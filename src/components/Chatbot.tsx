import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Bot, User, Trash2, UserCircle, Headphones,
  HelpCircle, ChevronRight, FileDown, ArrowLeft, Sparkles,
  Sofa, DollarSign, Lightbulb, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant" | "admin"; content: string };
type View = "home" | "messages" | "help";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/home-decor-chat`;

const quickSuggestions = [
  { icon: Sofa, label: "Show me products", query: "What products do you have? Show me some popular picks." },
  { icon: DollarSign, label: "Under $100", query: "What are your best home decor finds under $100?" },
  { icon: Lightbulb, label: "Blog tips", query: "What blog articles do you have about home styling?" },
  { icon: Home, label: "Returns policy", query: "How do returns work if I buy something?" },
  { icon: Headphones, label: "Talk to a person", query: "I'd like to speak with a real person please." },
];

function getVisitorId() {
  let id = localStorage.getItem("chatbot-visitor-id");
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("chatbot-visitor-id", id);
  }
  return id;
}

const HELP_TOPICS = [
  { q: "How do shipping & returns work?", a: "Most orders ship within 1–3 business days. Returns are accepted within 30 days for unused items in original packaging. See our Shipping & Returns pages for full details." },
  { q: "Are these affiliate links?", a: "Yes — many product picks are Amazon affiliate links. We earn a small commission at no extra cost to you, which helps keep our content free." },
  { q: "How do I get styling help?", a: "Use the Messages tab to chat with our AI design assistant 24/7, or ask to speak with a real person and our team will jump in." },
  { q: "Where can I find blog tips?", a: "Browse our Blog for room-by-room styling guides, trend reports, and shoppable inspiration." },
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("home");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLiveChat, setIsLiveChat] = useState(false);
  const [openHelp, setOpenHelp] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const visitorId = useRef(getVisitorId());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Listen for admin messages in real-time
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload: any) => {
          const msg = payload.new;
          if (msg.role === "admin") {
            setMessages(prev => [...prev, { role: "admin", content: msg.content }]);
            setIsLiveChat(true);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ visitor_id: visitorId.current })
      .select("id")
      .single();
    if (data) {
      setConversationId(data.id);
      return data.id;
    }
    console.error("Failed to create conversation:", error);
    return null;
  }, [conversationId]);

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from("chat_messages").insert({ conversation_id: convId, role, content });
    await supabase.from("chat_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", convId);
  };

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages.filter(m => m.role !== "admin").map(m => ({ role: m.role === "admin" ? "user" : m.role, content: m.content })) }),
    });

    if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
    return assistantContent;
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const convId = await ensureConversation();
      if (convId) await saveMessage(convId, "user", textToSend);

      // Check for live chat request
      const liveKeywords = ["real person", "human", "speak to someone", "talk to a person", "live chat", "agent", "support"];
      const wantsLive = liveKeywords.some(k => textToSend.toLowerCase().includes(k));

      if (wantsLive && convId) {
        await supabase.from("chat_conversations").update({ is_live_chat: true, status: "waiting" }).eq("id", convId);
        setIsLiveChat(true);
        const liveMsg = "I've notified our team that you'd like to speak with someone. A team member will join this chat shortly. In the meantime, I'm still here to help!";
        setMessages(prev => [...prev, { role: "assistant", content: liveMsg }]);
        if (convId) await saveMessage(convId, "assistant", liveMsg);
      } else {
        const assistantContent = await streamChat(updatedMessages);
        if (convId && assistantContent) await saveMessage(convId, "assistant", assistantContent);
      }
    } catch (error) {
      const errMsg = "I'm sorry, I encountered an error. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClear = async () => {
    setMessages([]);
    setConversationId(null);
    setIsLiveChat(false);
  };

  return (
    <>
      {/* Toggle */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] bg-[#0F172A] text-white border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Top hero header (Freecash-style) */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-white px-5 pt-5 pb-8 overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute right-10 bottom-0 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

              <div className="relative flex items-start justify-between mb-6">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-center gap-2">
                  {/* Avatars */}
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full ring-2 ring-primary bg-gradient-to-br from-amber-200 to-rose-300 flex items-center justify-center text-[10px] font-bold text-primary"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="ml-1 p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <p className="text-base font-light opacity-90">Hi there 👋</p>
                <h3 className="text-2xl font-display font-bold leading-tight mt-0.5">
                  How can we help?
                </h3>
              </div>
            </div>

            {/* HOME view */}
            {view === "home" && (
              <div className="flex-1 px-4 pt-4 pb-3 -mt-4 space-y-3">
                {/* Messages + Help action card */}
                <div className="rounded-2xl bg-white text-slate-900 shadow-xl divide-y divide-slate-100 overflow-hidden">
                  <button
                    onClick={() => setView("messages")}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-sm">Messages</span>
                    <MessageCircle className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => setView("help")}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-sm">Help</span>
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <button
                  onClick={() => { setView("messages"); }}
                  className="w-full rounded-2xl bg-white text-slate-900 shadow-xl px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-sm">Send us a message</span>
                  <Send className="w-4 h-4 text-slate-500" />
                </button>

                <a
                  href="/disclosure"
                  className="w-full rounded-2xl bg-white text-slate-900 shadow-xl px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-sm">View disclosures & policies</span>
                  <FileDown className="w-4 h-4 text-slate-500" />
                </a>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-white/60">
                    Powered by AI · Replies in seconds
                  </p>
                </div>
              </div>
            )}

            {/* HELP view */}
            {view === "help" && (
              <div className="flex-1 bg-white text-slate-900 -mt-4 rounded-t-3xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setView("home")}
                    className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h4 className="font-display font-semibold text-base">Help Center</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {HELP_TOPICS.map((t, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setOpenHelp(openHelp === i ? null : i)}
                        className="w-full flex items-center justify-between px-3.5 py-3 text-left hover:bg-slate-50"
                      >
                        <span className="text-sm font-medium pr-2">{t.q}</span>
                        <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openHelp === i ? "rotate-90" : ""}`} />
                      </button>
                      {openHelp === i && (
                        <div className="px-3.5 pb-3 text-xs text-slate-600 leading-relaxed">{t.a}</div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setView("messages")}
                    className="w-full mt-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-95"
                  >
                    Still need help? Chat with us <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* MESSAGES view (full chat) */}
            {view === "messages" && (
              <div className="flex-1 bg-white text-slate-900 -mt-4 rounded-t-3xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setView("home")}
                    className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">Design Assistant</p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {isLiveChat ? "Live chat active" : "Online"}
                      </span>
                    </div>
                  </div>
                  {messages.length > 0 && (
                    <button
                      onClick={handleClear}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                      aria-label="Clear chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isLiveChat && (
                  <div className="mx-3 mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-[11px] font-medium text-green-700 flex items-center gap-2">
                    <Headphones className="w-3.5 h-3.5" />
                    A team member has been notified
                  </div>
                )}

                <div className="flex-1 h-[340px] overflow-y-auto p-3 space-y-3 bg-slate-50/40">
                  {messages.length === 0 && (
                    <div className="py-2">
                      <p className="text-xs text-slate-500 mb-3 text-center">Pick a quick start or type your question below.</p>
                      <div className="space-y-1.5">
                        {quickSuggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(s.query)}
                            className="w-full flex items-center gap-2.5 p-2.5 text-xs text-left bg-white border border-slate-200 rounded-xl hover:border-primary/40 hover:bg-primary/[0.03] transition-all"
                            disabled={isLoading}
                          >
                            <s.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="text-slate-800 font-medium">{s.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {(msg.role === "assistant" || msg.role === "admin") && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                          msg.role === "admin" ? "bg-green-100" : "bg-primary/10"
                        }`}>
                          {msg.role === "admin" ? <UserCircle className="w-3 h-3 text-green-600" /> : <Bot className="w-3 h-3 text-primary" />}
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : msg.role === "admin"
                            ? "bg-green-50 border border-green-200 text-slate-800 rounded-bl-md"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
                      }`}>
                        {msg.role === "admin" && (
                          <div className="text-[10px] font-semibold text-green-700 mb-1 flex items-center gap-1">
                            <UserCircle className="w-3 h-3" /> Team Member
                          </div>
                        )}
                        {msg.role === "user" ? (
                          <p className="text-sm leading-snug">{msg.content}</p>
                        ) : (
                          <div className="text-sm prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_strong]:font-semibold">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm">
                        <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-slate-100 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message…"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-colors placeholder:text-slate-400"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="rounded-xl h-10 w-10 shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom tab bar (only on home/help) */}
            {view !== "messages" && (
              <div className="grid grid-cols-2 border-t border-white/10 bg-[#0F172A]">
                <button
                  onClick={() => setView("home")}
                  className={`py-3 text-xs font-medium flex flex-col items-center gap-1 transition-colors ${view === "home" ? "text-primary" : "text-white/60 hover:text-white"}`}
                >
                  <MessageCircle className="w-4 h-4" /> Home
                </button>
                <button
                  onClick={() => setView("help")}
                  className={`py-3 text-xs font-medium flex flex-col items-center gap-1 transition-colors ${view === "help" ? "text-primary" : "text-white/60 hover:text-white"}`}
                >
                  <HelpCircle className="w-4 h-4" /> Help
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
