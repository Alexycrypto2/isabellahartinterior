import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, AlertTriangle, Mail, CheckCircle, Clock, Loader2, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface TransferRequest {
  id: string;
  current_owner_id: string;
  new_owner_email: string;
  current_owner_confirmed: boolean;
  new_owner_confirmed: boolean;
  expires_at: string;
  completed_at: string | null;
  created_at: string;
}

const AdminOwnershipTransfer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pendingTransfer, setPendingTransfer] = useState<TransferRequest | null>(null);
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPendingTransfer();
  }, [user]);

  const loadPendingTransfer = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ownership_transfers')
        .select('*')
        .eq('current_owner_id', user.id)
        .is('completed_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setPendingTransfer(data);
    } catch (error) {
      console.error('Error loading transfer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateTransfer = async () => {
    if (!newOwnerEmail || newOwnerEmail !== confirmEmail) {
      toast({ title: 'Email addresses must match', variant: 'destructive' });
      return;
    }

    if (newOwnerEmail === user?.email) {
      toast({ title: 'Cannot transfer to yourself', variant: 'destructive' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOwnerEmail)) {
      toast({ title: 'Invalid email address', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('ownership_transfers')
        .insert({
          current_owner_id: user?.id,
          new_owner_email: newOwnerEmail.toLowerCase().trim(),
        });

      if (error) throw error;

      toast({ 
        title: 'Transfer initiated', 
        description: 'Verification emails have been sent to both parties.' 
      });
      
      setNewOwnerEmail('');
      setConfirmEmail('');
      loadPendingTransfer();
    } catch (error) {
      console.error('Error initiating transfer:', error);
      toast({ title: 'Failed to initiate transfer', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelTransfer = async () => {
    if (!pendingTransfer) return;

    try {
      const { error } = await supabase
        .from('ownership_transfers')
        .delete()
        .eq('id', pendingTransfer.id);

      if (error) throw error;

      toast({ title: 'Transfer cancelled' });
      setPendingTransfer(null);
    } catch (error) {
      console.error('Error cancelling transfer:', error);
      toast({ title: 'Failed to cancel transfer', variant: 'destructive' });
    }
  };

  const confirmTransfer = async () => {
    if (!pendingTransfer) return;

    try {
      const { error } = await supabase
        .from('ownership_transfers')
        .update({ current_owner_confirmed: true })
        .eq('id', pendingTransfer.id);

      if (error) throw error;

      toast({ 
        title: 'Your confirmation recorded', 
        description: 'Waiting for the new owner to confirm.' 
      });
      loadPendingTransfer();
    } catch (error) {
      console.error('Error confirming transfer:', error);
      toast({ title: 'Failed to confirm transfer', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-medium flex items-center gap-2">
            <Crown className="h-6 w-6 text-purple-500" />
            Transfer Ownership
          </h1>
          <p className="text-muted-foreground mt-1">
            Transfer Super Admin privileges to another user
          </p>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Irreversible Action</AlertTitle>
          <AlertDescription>
            Transferring ownership will give full control of this site to another person. 
            You will lose Super Admin access once the transfer is complete. 
            This action requires email verification from both parties.
          </AlertDescription>
        </Alert>

        {pendingTransfer ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Transfer
              </CardTitle>
              <CardDescription>
                Ownership transfer to {pendingTransfer.new_owner_email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Current Owner</p>
                  <p className="font-medium">{user?.email}</p>
                  {pendingTransfer.current_owner_confirmed ? (
                    <Badge className="mt-2 bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2">
                      Pending
                    </Badge>
                  )}
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">New Owner</p>
                  <p className="font-medium">{pendingTransfer.new_owner_email}</p>
                  {pendingTransfer.new_owner_confirmed ? (
                    <Badge className="mt-2 bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Expires:</strong>{' '}
                  {formatDistanceToNow(new Date(pendingTransfer.expires_at), { addSuffix: true })}
                </p>
                <p>
                  <strong>Created:</strong>{' '}
                  {format(new Date(pendingTransfer.created_at), 'PPpp')}
                </p>
              </div>

              <div className="flex gap-3">
                {!pendingTransfer.current_owner_confirmed && (
                  <Button onClick={confirmTransfer}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Transfer
                  </Button>
                )}
                <Button variant="destructive" onClick={cancelTransfer}>
                  Cancel Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Initiate Transfer</CardTitle>
              <CardDescription>
                Enter the email address of the person you want to transfer ownership to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newOwnerEmail">New Owner's Email</Label>
                <Input
                  id="newOwnerEmail"
                  type="email"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmEmail">Confirm Email</Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Re-enter email address"
                />
              </div>

              <Button 
                onClick={initiateTransfer} 
                disabled={isSubmitting || !newOwnerEmail || newOwnerEmail !== confirmEmail}
                className="w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Verification Emails
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Both you and the new owner must verify via email before the transfer completes.
                The transfer request expires in 48 hours.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOwnershipTransfer;