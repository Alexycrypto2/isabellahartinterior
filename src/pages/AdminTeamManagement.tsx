import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Mail, Shield, RefreshCw, Crown, Loader2, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface TeamMember {
  user_id: string;
  role: string;
  last_login: string | null;
  created_at: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

const roleDescriptions: Record<string, string> = {
  super_admin: 'Full access to everything including user management and billing',
  admin: 'Full access to content and settings, cannot manage users',
  editor: 'Can create, edit and publish blog posts and products',
  writer: 'Can create and edit blog posts only, cannot publish',
  viewer: 'Read-only access to dashboard and analytics',
};

const roleBadgeColors: Record<string, string> = {
  super_admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  editor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  writer: 'bg-green-500/10 text-green-500 border-green-500/20',
  viewer: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const AdminTeamManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('editor');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setIsLoading(true);
    try {
      // Load team members with their roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: true });

      if (rolesError) throw rolesError;

      // Load profiles for each user
      const membersWithProfiles = await Promise.all(
        (roles || []).map(async (role) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', role.user_id)
            .maybeSingle();

          return {
            ...role,
            display_name: profile?.display_name || null,
            avatar_url: profile?.avatar_url || null,
          };
        })
      );

      setTeamMembers(membersWithProfiles);

      // Load pending invitations
      const { data: invites, error: invitesError } = await supabase
        .from('team_invitations')
        .select('*')
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (invitesError) throw invitesError;
      setInvitations(invites || []);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({ title: 'Error loading team data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail || !inviteRole) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      toast({ title: 'Invalid email address', variant: 'destructive' });
      return;
    }

    setIsInviting(true);
    try {
      const { error } = await supabase
        .from('team_invitations')
        .insert({
          email: inviteEmail.toLowerCase().trim(),
          role: inviteRole as any,
          invited_by: user?.id,
        });

      if (error) throw error;

      toast({ 
        title: 'Invitation sent', 
        description: `An invitation has been sent to ${inviteEmail}` 
      });
      
      setInviteEmail('');
      setInviteRole('editor');
      setInviteDialogOpen(false);
      loadTeamData();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({ title: 'Failed to send invitation', variant: 'destructive' });
    } finally {
      setIsInviting(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({ title: 'Invitation cancelled' });
      loadTeamData();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({ title: 'Failed to cancel invitation', variant: 'destructive' });
    }
  };

  const removeMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({ title: 'Team member removed' });
      loadTeamData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({ title: 'Failed to remove member', variant: 'destructive' });
    }
  };

  const updateMemberRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', userId);

      if (error) throw error;

      toast({ title: 'Role updated' });
      loadTeamData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({ title: 'Failed to update role', variant: 'destructive' });
    }
  };

  const resetMemberPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({ 
        title: 'Password reset email sent', 
        description: `A password reset link has been sent to ${email}` 
      });
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast({ title: 'Failed to send reset email', variant: 'destructive' });
    }
  };

  const getInitials = (name: string | null | undefined, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.[0].toUpperCase() || '?';
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
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-medium">Team Management</h1>
            <p className="text-muted-foreground mt-1">Invite and manage team members</p>
          </div>
          
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="team@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-purple-500" />
                          Super Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="writer">Writer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {roleDescriptions[inviteRole]}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={sendInvitation} disabled={isInviting}>
                  {isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Pending Invitations
              </CardTitle>
              <CardDescription>
                Invitations that haven't been accepted yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleBadgeColors[invite.role]}>
                          {invite.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitation(invite.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} in your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(member.display_name, member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.display_name || 'No name set'}
                            {member.user_id === user?.id && (
                              <span className="text-muted-foreground ml-2">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.email || member.user_id.slice(0, 8) + '...'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.user_id === user?.id ? (
                        <Badge variant="outline" className={roleBadgeColors[member.role]}>
                          {member.role === 'super_admin' && <Crown className="h-3 w-3 mr-1" />}
                          {member.role.replace('_', ' ')}
                        </Badge>
                      ) : (
                        <Select
                          value={member.role}
                          onValueChange={(value) => updateMemberRole(member.user_id, value)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="writer">Writer</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.last_login 
                        ? formatDistanceToNow(new Date(member.last_login), { addSuffix: true })
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {member.user_id !== user?.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetMemberPassword(member.email || '')}
                              title="Reset Password"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" title="Remove Member">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove this team member? 
                                    They will lose access to the admin panel.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => removeMember(member.user_id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role Descriptions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>What each role can do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(roleDescriptions).map(([role, description]) => (
                <div key={role} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {role === 'super_admin' && <Crown className="h-4 w-4 text-purple-500" />}
                    <Badge variant="outline" className={roleBadgeColors[role]}>
                      {role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminTeamManagement;