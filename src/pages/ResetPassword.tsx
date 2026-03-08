import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import PageTransition from '@/components/PageTransition';
import { KeyRound, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a recovery session from the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsValidSession(true);
    } else {
      // Also check if user has an active session (already clicked the link)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsValidSession(true);
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      setIsSuccess(true);
      toast({ title: 'Password updated!', description: 'You can now sign in with your new password.' });
      setTimeout(() => navigate('/auth'), 3000);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update password', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center space-y-4">
            <KeyRound className="w-12 h-12 mx-auto text-muted-foreground" />
            <h1 className="font-display text-3xl font-medium">Invalid Reset Link</h1>
            <p className="text-muted-foreground">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button onClick={() => navigate('/auth')} className="rounded-full">
              Back to Sign In
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isSuccess) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
            <h1 className="font-display text-3xl font-medium">Password Updated!</h1>
            <p className="text-muted-foreground">Redirecting you to sign in...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <KeyRound className="w-10 h-10 mx-auto mb-4 text-primary" />
            <h1 className="font-display text-3xl font-medium mb-2">Set New Password</h1>
            <p className="text-muted-foreground">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
