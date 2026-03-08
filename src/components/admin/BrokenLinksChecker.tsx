import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle2, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BrokenLink {
  id: string;
  url: string;
  source_type: string;
  source_id: string;
  source_name: string | null;
  status_code: number | null;
  last_checked: string;
  is_resolved: boolean;
}

export default function BrokenLinksChecker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);

  const { data: brokenLinks = [], isLoading } = useQuery({
    queryKey: ['broken-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broken_links')
        .select('*')
        .eq('is_resolved', false)
        .order('last_checked', { ascending: false });
      if (error) throw error;
      return data as BrokenLink[];
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('broken_links')
        .update({ is_resolved: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broken-links'] });
      toast({ title: 'Marked as resolved' });
    },
  });

  const runCheck = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-broken-links');
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['broken-links'] });
      toast({
        title: 'Link check complete',
        description: `Found ${data?.brokenCount || 0} broken links.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to run link check. Try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const unresolvedCount = brokenLinks.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className={`h-5 w-5 ${unresolvedCount > 0 ? 'text-amber-500' : 'text-green-500'}`} />
          Broken Links
          {unresolvedCount > 0 && (
            <Badge variant="destructive" className="ml-2">{unresolvedCount}</Badge>
          )}
        </CardTitle>
        <Button size="sm" variant="outline" onClick={runCheck} disabled={isChecking}>
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Check Now</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : unresolvedCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
            <p className="font-medium">All links are working!</p>
            <p className="text-sm text-muted-foreground">No broken links detected.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {brokenLinks.map(link => (
              <div key={link.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {link.source_type === 'product' ? 'Product' : 'Blog Post'}
                    </Badge>
                    {link.status_code && (
                      <Badge variant="destructive" className="text-xs">
                        {link.status_code}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{link.source_name || 'Unknown'}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary truncate flex items-center gap-1"
                  >
                    {link.url.substring(0, 50)}...
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">
                    Checked: {format(new Date(link.last_checked), 'MMM d, h:mm a')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => resolveMutation.mutate(link.id)}
                  disabled={resolveMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
