import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle, Send, Clock, User, Bot, Headphones,
  Eye, ChevronLeft, Trash2, RefreshCw, Circle, UserCircle
} from 'lucide-react';

interface Conversation {
  id: string;
  visitor_id: string;
  started_at: string;
  last_message_at: string;
  is_live_chat: boolean;
  status: string;
  message_count?: number;
  last_message?: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function AdminChatDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (selectedConv) loadMessages(selectedConv);
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time messages
  useEffect(() => {
    if (!selectedConv) return;
    const channel = supabase
      .channel(`admin-chat-${selectedConv}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${selectedConv}` },
        (payload: any) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  const loadConversations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(100);
    if (data) {
      // Get message counts
      const convs: Conversation[] = [];
      for (const c of data) {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', c.id);
        const { data: lastMsg } = await supabase
          .from('chat_messages')
          .select('content, role')
          .eq('conversation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        convs.push({
          ...c,
          message_count: count || 0,
          last_message: lastMsg?.content?.slice(0, 80) || '',
        });
      }
      setConversations(convs);
    }
    setLoading(false);
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const sendAdminReply = async () => {
    if (!replyText.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      await supabase.from('chat_messages').insert({
        conversation_id: selectedConv,
        role: 'admin',
        content: replyText.trim(),
      });
      await supabase.from('chat_conversations').update({
        last_message_at: new Date().toISOString(),
        is_live_chat: true,
        status: 'active',
      }).eq('id', selectedConv);
      setReplyText('');
      toast({ title: 'Message sent' });
    } catch {
      toast({ title: 'Failed to send', variant: 'destructive' });
    }
    setSending(false);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('chat_messages').delete().eq('conversation_id', id);
    await supabase.from('chat_conversations').delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (selectedConv === id) { setSelectedConv(null); setMessages([]); }
    toast({ title: 'Conversation deleted' });
  };

  const selectedConversation = conversations.find(c => c.id === selectedConv);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Chat Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {conversations.length} conversations • {conversations.filter(c => c.is_live_chat && c.status === 'waiting').length} waiting for response
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadConversations}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          {/* Conversation List */}
          <Card className="lg:col-span-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No conversations yet</div>
              ) : conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all group ${
                    selectedConv === conv.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        conv.is_live_chat && conv.status === 'waiting'
                          ? 'bg-orange-100 text-orange-600'
                          : conv.is_live_chat
                            ? 'bg-green-100 text-green-600'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {conv.is_live_chat ? <Headphones className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate">
                            Visitor {conv.visitor_id.slice(-6)}
                          </span>
                          {conv.is_live_chat && conv.status === 'waiting' && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] bg-orange-500 text-white rounded-full font-bold">LIVE</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{conv.last_message}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(conv.last_message_at).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {conv.message_count} msgs
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Chat View */}
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSelectedConv(null)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedConversation?.is_live_chat ? 'bg-green-100' : 'bg-muted'
                    }`}>
                      {selectedConversation?.is_live_chat ? <Headphones className="w-4 h-4 text-green-600" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Visitor {selectedConversation?.visitor_id.slice(-6)}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Started {new Date(selectedConversation?.started_at || '').toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => selectedConv && deleteConversation(selectedConv)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role !== 'user' && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                          msg.role === 'admin' ? 'bg-green-100' : 'bg-primary/10'
                        }`}>
                          {msg.role === 'admin' ? <UserCircle className="w-3.5 h-3.5 text-green-600" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : msg.role === 'admin'
                            ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-bl-md'
                            : 'bg-background border border-border rounded-bl-md'
                      }`}>
                        {msg.role === 'admin' && (
                          <div className="text-[10px] font-semibold text-green-600 mb-1">Admin Response</div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-[9px] opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                <div className="p-3 border-t bg-background">
                  <div className="flex gap-2">
                    <Input
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAdminReply(); } }}
                      placeholder="Type your reply to the visitor..."
                      className="flex-1"
                      disabled={sending}
                    />
                    <Button onClick={sendAdminReply} disabled={!replyText.trim() || sending} size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Select a conversation</p>
                  <p className="text-xs">Choose from the list to view chat history and reply</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
