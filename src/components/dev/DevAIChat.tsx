import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Copy, Loader2, Sparkles, Zap, Code2, Bug, RotateCcw, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

type Message = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dev-chat`;

const QUICK_PROMPTS = [
  { icon: Bug, label: 'Find & fix bugs', prompt: 'Scan the entire website for bugs, broken features, and errors. List each issue with the exact fix needed.' },
  { icon: Zap, label: 'Performance audit', prompt: 'Run a full performance audit on this website. Check load times, bundle size, lazy loading, and optimization opportunities.' },
  { icon: Code2, label: 'Code review', prompt: 'Do a comprehensive code review of the entire codebase. Look for security issues, bad practices, and suggest improvements.' },
  { icon: Terminal, label: 'Check admin panel', prompt: 'Scan all admin panel features and check if each one is working correctly. List any broken or incomplete features.' },
];

const DevAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { role: 'user', content: msg };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);

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

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch { /* partial JSON */ }
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to get AI response');
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const clearChat = () => {
    setMessages([]);
    toast.info('Chat cleared');
  };

  return (
    <div className="flex flex-col h-[700px] rounded-2xl border border-border/50 bg-card overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">AI Engineer Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground">Online • Powered by Lovable AI</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-3 w-3" /> Clear
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
            <h4 className="font-semibold text-foreground mb-1">AI Engineer Ready</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Describe any issue with your website or admin panel. I'll scan the code, identify the problem, and provide the exact fix.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.prompt)}
                  className="flex items-center gap-2 p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all text-left group"
                >
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
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted/60 border border-border/40 rounded-bl-md'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-secondary/80 prose-pre:text-secondary-foreground prose-pre:text-xs prose-pre:rounded-lg prose-pre:border prose-pre:border-border/30 prose-code:text-primary prose-code:font-mono prose-code:text-xs">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
              {msg.role === 'assistant' && msg.content && (
                <button
                  onClick={() => copyText(msg.content)}
                  className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="h-3 w-3" /> Copy response
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

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
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
                Analyzing your code...
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
            placeholder="Describe the issue or ask me to scan your code..."
            className="min-h-[44px] max-h-[120px] resize-none text-sm rounded-xl border-border/50 bg-background focus-visible:ring-primary/30"
            rows={1}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent hover:opacity-90 shadow-md"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          AI can scan your codebase, diagnose errors, and provide copy-paste fixes
        </p>
      </div>
    </div>
  );
};

export default DevAIChat;
