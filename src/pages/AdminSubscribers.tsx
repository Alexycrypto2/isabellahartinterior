import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useNewsletterSubscribers,
  useDeleteSubscriber,
  useToggleSubscriberStatus,
} from '@/hooks/useNewsletterSubscribers';
import { useToast } from '@/hooks/use-toast';
import { Mail, Trash2, Download, Search, UserCheck, UserX, Users } from 'lucide-react';

const AdminSubscribers = () => {
  const { data: subscribers, isLoading, error } = useNewsletterSubscribers();
  const deleteMutation = useDeleteSubscriber();
  const toggleStatusMutation = useToggleSubscriberStatus();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Subscriber deleted',
        description: 'The subscriber has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subscriber.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({ id, is_active: !currentStatus });
      toast({
        title: currentStatus ? 'Subscriber deactivated' : 'Subscriber activated',
        description: currentStatus
          ? 'The subscriber has been deactivated.'
          : 'The subscriber is now active.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscriber status.',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    if (!subscribers || subscribers.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no subscribers to export.',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Email', 'Subscribed At', 'Status'];
    const rows = subscribers.map((s) => [
      s.email,
      new Date(s.subscribed_at).toLocaleDateString(),
      s.is_active ? 'Active' : 'Inactive',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export complete',
      description: `Exported ${subscribers.length} subscribers to CSV.`,
    });
  };

  const filteredSubscribers = subscribers?.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = subscribers?.filter((s) => s.is_active).length || 0;
  const inactiveCount = subscribers?.filter((s) => !s.is_active).length || 0;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium">Newsletter Subscribers</h1>
            <p className="text-muted-foreground mt-1">
              Manage your newsletter subscribers
            </p>
          </div>
          <Button onClick={handleExportCSV} className="rounded-full">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Subscribers</span>
            </div>
            <p className="font-display text-3xl font-medium mt-2">
              {subscribers?.length || 0}
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <p className="font-display text-3xl font-medium mt-2 text-green-600">
              {activeCount}
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <UserX className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Inactive</span>
            </div>
            <p className="font-display text-3xl font-medium mt-2 text-yellow-600">
              {inactiveCount}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>

        {/* Subscribers Table */}
        <div className="bg-background border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading subscribers...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              Error loading subscribers
            </div>
          ) : filteredSubscribers && filteredSubscribers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{subscriber.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriber.is_active ? 'default' : 'secondary'}>
                        {subscriber.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(subscriber.id, subscriber.is_active)
                          }
                          disabled={toggleStatusMutation.isPending}
                        >
                          {subscriber.is_active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{subscriber.email}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(subscriber.id)}
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
          ) : (
            <div className="p-8 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No subscribers yet</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No subscribers found for "${searchQuery}"`
                  : 'Subscribers will appear here when people sign up for your newsletter.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscribers;
