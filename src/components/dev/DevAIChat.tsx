import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Copy, Loader2, Sparkles, Zap, Bug, RotateCcw, ShieldCheck, Palette, LayoutDashboard, PlusCircle, History, Trash2, CheckCircle2, Package, FileText, Settings, Tag } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

type Message = { role: 'user' | 'assistant'; content: string; actions?: ActionTaken[] };
type ActionTaken = { action: string; success: boolean; message: string };
type Conversation = { id: string; title: string; messages: Message[]; updatedAt: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dev-chat`;
const STORAGE_KEY = 'dev-ai-conversations';
const ACTIVE_KEY = 'dev-ai-active-convo';

const QUICK_PROMPTS = [
  { icon: Package, label: 'Add a product', prompt: 'Add a new trending home decor product to the shop. Pick something popular and stylish right now.' },
  { icon: FileText, label: 'Write a blog post', prompt: 'Write a full blog post about a trending home decor topic. Make it SEO-optimized and publish-ready.' },
  { icon: Tag, label: 'Add a category', prompt: 'What room categories do I currently have? Suggest any missing ones and add them.' },
  { icon: Settings, label: 'Update settings', prompt: 'Show me my current site settings so I can tell you what to change.' },
  { icon: Bug, label: 'Fix bugs', prompt: 'Scan my website for bugs and broken features. Tell me what\'s wrong and exactly how to fix each issue.' },
  { icon: Palette, label: 'Improve design', prompt: 'Review my website design. What looks off? Check responsive layout, colors, spacing. Give me the top improvements.' },
];

const ACTION_ICONS: Record<string, typeof Package> = {
  create_product: Package,
  update_product: Package,
  create_blog_post: FileText,
  update_blog_post: FileText,
  create_category: Tag,
  update_setting: Settings,
  create_banner: Sparkles,
  delete_product: Package,
  delete_blog_post: FileText,
};

const loadConversations = (): Conversation[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const saveConversations = (convos: Conversation[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos.slice(0, 30)));
};
const loadActiveId = (): string | null => localStorage.getItem(ACTIVE_KEY);
const saveActiveId = (id: string | null) => id ? localStorage.setItem(ACTIVE_KEY, id) : localStorage.removeItem(ACTIVE_KEY);
const generateId = () => crypto.randomUUID?.() || Date.now().toString(36);
const titleFromMessage = (msg: string) => msg.slice(0, 60) + (msg.length > 60 ? '...' : '');

const DevAIChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(loadActiveId);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConvo = conversations.find(c => c.id === activeId);
  const messages = activeConvo?.messages || [];

  useEffect(() => { saveConversations(conversations); }, [conversations]);
  useEffect(() => { saveActiveId(activeId); }, [activeId]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startNewChat = useCallback(() => { setActiveId(null); setShowHistory(false); }, []);
  const openConversation = useCallback((id: string) => { setActiveId(id); setShowHistory(false); }, []);
  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const updateMessages = useCallback((convoId: string, updater: (msgs: Message[]) => Message[]) => {
    setConversations(prev => prev.map(c =>
      c.id === convoId ? { ...c, messages: updater(c.messages), updatedAt: new Date().toISOString() } : c
    ));
  }, []);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { role: 'user', content: msg };
    let convoId = activeId;

    if (!convoId) {
      convoId = generateId();
      const newConvo: Conversation = {
        id: convoId, title: titleFromMessage(msg),
        messages: [userMsg], updatedAt: new Date().toISOString(),
      };
      setConversations(prev => [newConvo, ...prev]);
      setActiveId(convoId);
    } else {
      updateMessages(convoId, msgs => [...msgs, userMsg]);
    }

    setInput('');
    setIsLoading(true);

    const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const cId = convoId;

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.content || 'Done.',
        actions: data.actions_taken?.length ? data.actions_taken : undefined,
      };

      updateMessages(cId, msgs => [...msgs, assistantMsg]);

      // Show toast for actions
      if (data.actions_taken?.length) {
        const successCount = data.actions_taken.filter((a: ActionTaken) => a.success).length;
        if (successCount > 0) {
          toast.success(`${successCount} action${successCount > 1 ? 's' : ''} completed successfully`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to get AI response');
      const cId = convoId;
      updateMessages(cId, msgs => [...msgs, { role: 'assistant', content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied'); };

  // Action badges component
  const ActionBadges = ({ actions }: { actions: ActionTaken[] }) => (
    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/30">
      {actions.map((a, i) => {
        const Icon = ACTION_ICONS[a.action] || CheckCircle2;
        return (
          <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
            a.success ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-destructive/10 text-destructive'
          }`}>
            <Icon className="h-3 w-3" />
            {a.action.replace(/_/g, ' ')}
            {a.success ? ' ✅' : ' ❌'}
          </span>
        );
      })}
    </div>
  );

  if (showHistory) {
    return (
      <div className="flex flex-col h-[700px] rounded-2xl border border-border/50 bg-card overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold text-sm">Chat History</h3>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={startNewChat} className="text-xs gap-1">
              <PlusCircle className="h-3 w-3" /> New Chat
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="text-xs">Back</Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No conversations yet</p>
          ) : conversations.map(c => (
            <div key={c.id} className={`p-3 rounded-xl border cursor-pointer hover:bg-muted/40 transition-colors flex justify-between items-start gap-2 ${c.id === activeId ? 'border-primary/40 bg-primary/5' : 'border-border/50'}`}>
              <div className="flex-1 min-w-0" onClick={() => openConversation(c.id)}>
                <p className="text-sm font-medium truncate">{c.title}</p>
                <p className="text-[10px] text-muted-foreground">{c.messages.length} messages • {new Date(c.updatedAt).toLocaleDateString()}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[700px] rounded-2xl border border-border/50 bg-card overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">AI Engineer</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground">Can add products, posts, settings & more</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground">
            <History className="h-3 w-3" /> History
          </Button>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={startNewChat} className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-3 w-3" /> New
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary/60" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">AI Engineer — Ready to Build</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              I can directly add products, write blog posts, create categories, and update settings. Just tell me what you need!
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {QUICK_PROMPTS.map((qp) => (
                <button key={qp.label} onClick={() => sendMessage(qp.prompt)}
                  className="flex items-center gap-2 p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all text-left group">
                  <qp.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <span className="text-xs font-medium text-foreground">{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted/60 border border-border/40 rounded-bl-md'
            }`}>
              {msg.role === 'assistant' ? (
                <>
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-secondary/80 prose-pre:text-secondary-foreground prose-pre:text-xs prose-pre:rounded-lg prose-pre:border prose-pre:border-border/30 prose-code:text-primary prose-code:font-mono prose-code:text-xs prose-headings:text-foreground prose-strong:text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.actions && msg.actions.length > 0 && <ActionBadges actions={msg.actions} />}
                </>
              ) : (
                <p>{msg.content}</p>
              )}
              {msg.role === 'assistant' && msg.content && (
                <button onClick={() => copyText(msg.content)} className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="h-3 w-3" /> Copy
                </button>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-sm">
              <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
            </div>
            <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                Working on it...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Add a product, write a blog post, update settings..."
            className="min-h-[44px] max-h-[120px] resize-none text-sm rounded-xl border-border/50 bg-background focus-visible:ring-primary/30"
            rows={1}
          />
          <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} size="icon"
            className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent hover:opacity-90 shadow-md">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          AI Engineer • Can create products, blog posts, categories & update settings
        </p>
      </div>
    </div>
  );
};

export default DevAIChat;
