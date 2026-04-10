import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Lightbulb, Home, DollarSign, Sofa, Bot, User, Trash2, UserCircle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant" | "admin"; content: string };

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

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLiveChat, setIsLiveChat] = useState(false);
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
            className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold leading-tight">Design Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs opacity-80">{isLiveChat ? "Live chat active" : "Online • Powered by AI"}</p>
                  </div>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="p-2 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                    aria-label="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {isLiveChat && (
                <div className="mt-2 px-3 py-1.5 bg-green-500/20 backdrop-blur rounded-lg text-xs font-medium flex items-center gap-2">
                  <Headphones className="w-3.5 h-3.5" />
                  A team member has been notified
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="h-[380px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/20 to-background">
              {messages.length === 0 && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-3">
                    <Bot className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">Hi! I'm your design assistant.</p>
                  <p className="text-xs text-muted-foreground mb-5">Ask me about products, styling tips, or anything home décor.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s.query)}
                        className="flex items-center gap-2 p-3 text-xs text-left bg-background border border-border rounded-xl hover:bg-accent hover:border-primary/30 transition-all duration-200 group"
                        disabled={isLoading}
                      >
                        <s.icon className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-foreground font-medium">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {(msg.role === "assistant" || msg.role === "admin") && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      msg.role === "admin" ? "bg-green-500/10" : "bg-primary/10"
                    }`}>
                      {msg.role === "admin" ? <UserCircle className="w-3.5 h-3.5 text-green-600" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : msg.role === "admin"
                        ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-bl-md shadow-sm"
                        : "bg-background border border-border rounded-bl-md shadow-sm"
                  }`}>
                    {msg.role === "admin" && (
                      <div className="text-[10px] font-semibold text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                        <UserCircle className="w-3 h-3" /> Team Member
                      </div>
                    )}
                    {msg.role === "user" ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm prose-neutral dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_strong]:font-semibold [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-background border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-background/80 backdrop-blur">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about home décor..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background transition-colors"
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
