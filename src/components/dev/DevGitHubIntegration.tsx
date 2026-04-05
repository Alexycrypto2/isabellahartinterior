import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Github, FolderOpen, FileCode, ArrowLeft, Loader2, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface GHFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
}

const REPO = 'Alexycrypto2/isabellahartinterior';

const DevGitHubIntegration = () => {
  const [token, setToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [files, setFiles] = useState<GHFile[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ name: string; content: string } | null>(null);

  const headers = () => ({
    'Accept': 'application/vnd.github.v3+json',
    ...(token ? { 'Authorization': `token ${token}` } : {}),
  });

  const fetchFiles = async (path: string = '') => {
    setLoading(true);
    setPreview(null);
    try {
      const resp = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, { headers: headers() });
      if (!resp.ok) throw new Error(`GitHub API error: ${resp.status}`);
      const data = await resp.json();
      const items: GHFile[] = Array.isArray(data) ? data : [data];
      setFiles(items.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      }));
      setCurrentPath(path);
      setConnected(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewFile = async (file: GHFile) => {
    if (file.type === 'dir') {
      fetchFiles(file.path);
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`https://api.github.com/repos/${REPO}/contents/${file.path}`, { headers: headers() });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const content = atob(data.content);
      setPreview({ name: file.name, content });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    fetchFiles(parts.join('/'));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>Browse your repository files: {REPO}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub Token (optional for public repos)</label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_..."
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">A token increases rate limits. Leave blank for public access.</p>
            </div>
            <Button onClick={() => fetchFiles()} className="gap-1.5">
              <Github className="h-4 w-4" /> Connect & Browse
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentPath && (
                  <Button size="sm" variant="ghost" onClick={goUp} className="gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </Button>
                )}
                <Badge variant="outline" className="font-mono text-xs">
                  /{currentPath || ''}
                </Badge>
              </div>
              <a href={`https://github.com/${REPO}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> Open on GitHub
                </Button>
              </a>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : preview ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="font-mono text-xs">{preview.name}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => setPreview(null)} className="gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to files
                  </Button>
                </div>
                <pre className="bg-secondary text-secondary-foreground rounded-xl p-4 text-xs overflow-auto max-h-[400px] font-mono whitespace-pre">
                  {preview.content}
                </pre>
              </div>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-auto">
                {files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => viewFile(file)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    {file.type === 'dir' ? (
                      <FolderOpen className="h-4 w-4 text-accent shrink-0" />
                    ) : (
                      <FileCode className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    {file.type === 'file' && file.size && (
                      <span className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)}KB</span>
                    )}
                    {file.type === 'file' && (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DevGitHubIntegration;
