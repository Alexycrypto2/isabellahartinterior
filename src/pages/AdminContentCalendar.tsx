import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  scheduled_for: string | null;
}

export default function AdminContentCalendar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedPost, setDraggedPost] = useState<BlogPost | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published, created_at, scheduled_for')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, scheduled_for }: { id: string; scheduled_for: string }) => {
      const { error } = await supabase
        .from('blog_posts')
        .update({ scheduled_for })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts-calendar'] });
      toast({ title: 'Post rescheduled', description: 'The post has been moved to the new date.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reschedule post.', variant: 'destructive' });
    },
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get posts for a specific date
  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = post.scheduled_for 
        ? parseISO(post.scheduled_for) 
        : parseISO(post.created_at);
      return isSameDay(postDate, date);
    });
  };

  const handleDragStart = (post: BlogPost) => {
    setDraggedPost(post);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (date: Date) => {
    if (draggedPost) {
      updateMutation.mutate({
        id: draggedPost.id,
        scheduled_for: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      });
      setDraggedPost(null);
    }
  };

  const postsForSelectedDate = selectedDate ? getPostsForDate(selectedDate) : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Content Calendar</h1>
            <p className="text-muted-foreground">Plan and schedule your blog posts</p>
          </div>
          <Button onClick={() => navigate('/admin/blog/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
          </CardHeader>
          <CardContent>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-t-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-muted/50 p-2 text-center text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-border border border-t-0 rounded-b-lg overflow-hidden">
              {calendarDays.map(day => {
                const dayPosts = getPostsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[100px] bg-card p-1 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !isCurrentMonth ? 'opacity-40' : ''
                    } ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}
                    onClick={() => setSelectedDate(day)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(day)}
                  >
                    <div className={`text-sm mb-1 ${isToday ? 'font-bold text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayPosts.slice(0, 2).map(post => (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={() => handleDragStart(post)}
                          className={`text-xs p-1 rounded truncate cursor-move ${
                            post.published
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {post.title}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayPosts.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Dialog */}
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {postsForSelectedDate.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No posts scheduled for this date</p>
              ) : (
                postsForSelectedDate.map(post => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/admin/blog/${post.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{post.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {post.published ? (
                          <Badge variant="outline" className="text-green-600 border-green-600/50 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-600/50 gap-1">
                            <Clock className="h-3 w-3" />
                            Draft
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Button
                className="w-full mt-2"
                onClick={() => {
                  setSelectedDate(null);
                  navigate('/admin/blog/new');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post for This Date
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
