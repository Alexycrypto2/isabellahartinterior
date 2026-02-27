import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Eye, Trash2, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminContactSubmissions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['contact_submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ContactSubmission[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact_submissions'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact_submissions'] });
      toast({ title: 'Submission deleted' });
    },
  });

  const handleView = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    if (!submission.is_read) {
      markReadMutation.mutate(submission.id);
    }
  };

  const unreadCount = submissions?.filter(s => !s.is_read).length || 0;

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-medium">Contact Submissions</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              {submissions?.length || 0} total
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading submissions...</div>
            ) : submissions && submissions.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((sub) => (
                        <TableRow key={sub.id} className={!sub.is_read ? 'bg-accent/5' : ''}>
                          <TableCell>
                            {sub.is_read ? (
                              <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Badge variant="default" className="text-xs">New</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{sub.name}</TableCell>
                          <TableCell className="text-muted-foreground">{sub.email}</TableCell>
                          <TableCell className="text-muted-foreground line-clamp-1 max-w-[200px]">
                            {sub.subject || '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleView(sub)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <a href={`mailto:${sub.email}`}>
                                <Button variant="ghost" size="sm">
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </a>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this message from {sub.name}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(sub.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y">
                  {submissions.map((sub) => (
                    <div key={sub.id} className={`p-4 space-y-2 ${!sub.is_read ? 'bg-accent/5' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{sub.name}</p>
                            {!sub.is_read && <Badge variant="default" className="text-xs">New</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{sub.email}</p>
                          {sub.subject && <p className="text-xs text-muted-foreground mt-1">{sub.subject}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{sub.message}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(sub)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        <a href={`mailto:${sub.email}`}>
                          <Button variant="outline" size="sm">
                            <Mail className="h-3.5 w-3.5 mr-1" /> Reply
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No contact submissions yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Message from {selectedSubmission?.name}</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedSubmission.email}`} className="text-accent hover:underline">
                    {selectedSubmission.email}
                  </a>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedSubmission.subject && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Subject</p>
                  <p className="font-medium">{selectedSubmission.subject}</p>
                </div>
              )}
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Message</p>
                <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <a href={`mailto:${selectedSubmission.email}`} className="flex-1">
                  <Button className="w-full">
                    <Mail className="h-4 w-4 mr-2" /> Reply via Email
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminContactSubmissions;
