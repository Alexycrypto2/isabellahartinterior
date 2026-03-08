import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, User } from 'lucide-react';

interface BlogCommentsProps {
  blogPostId: string;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const BlogComments = ({ blogPostId }: BlogCommentsProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['blog-comments', blogPostId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('id, author_name, content, created_at')
        .eq('blog_post_id', blogPostId)
        .eq('is_approved', true)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Comment[];
    },
  });

  const submitComment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('blog_comments')
        .insert([{ blog_post_id: blogPostId, author_name: name, author_email: email, content }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Comment submitted!', description: 'Your comment will appear after moderation.' });
      setName('');
      setEmail('');
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogPostId] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit comment. Please check your inputs.', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) return;
    submitComment.mutate();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h3 className="font-display text-2xl font-medium">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Existing comments */}
      {isLoading ? (
        <p className="text-muted-foreground">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground italic">Be the first to leave a comment!</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border border-border rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">{comment.author_name}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-foreground/90 leading-relaxed pl-10">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div className="border border-border rounded-xl p-6">
        <h4 className="font-display text-lg font-medium mb-4">Leave a Comment</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comment-name">Name</Label>
              <Input
                id="comment-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment-email">Email</Label>
              <Input
                id="comment-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Your email won't be displayed publicly.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment-content">Comment</Label>
            <Textarea
              id="comment-content"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              maxLength={2000}
              rows={4}
            />
          </div>
          <Button type="submit" className="rounded-full" disabled={submitComment.isPending}>
            <Send className="w-4 h-4 mr-2" />
            {submitComment.isPending ? 'Submitting...' : 'Post Comment'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BlogComments;
