import { useState, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Image,
  Upload,
  Trash2,
  Copy,
  Search,
  FolderOpen,
  CheckCircle,
} from 'lucide-react';
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

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

const AdminMedia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch files from blog-images bucket
  const { data: files, isLoading } = useQuery({
    queryKey: ['media-files'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('blog-images')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;
      return data as StorageFile[];
    },
  });

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file.',
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);
      try {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { error } = await supabase.storage
          .from('blog-images')
          .upload(fileName, file);

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['media-files'] });
        toast({
          title: 'Upload successful',
          description: 'Your image has been uploaded.',
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload the image.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    },
    [queryClient, toast]
  );

  const handleDelete = async (fileName: string) => {
    try {
      const { error } = await supabase.storage.from('blog-images').remove([fileName]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast({
        title: 'File deleted',
        description: 'The image has been deleted.',
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete the image.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyUrl = async (fileName: string, fileId: string) => {
    const url = getPublicUrl(fileName);
    await navigator.clipboard.writeText(url);
    setCopiedId(fileId);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'URL copied',
      description: 'Image URL has been copied to clipboard.',
    });
  };

  const filteredFiles = files?.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium">Media Library</h1>
            <p className="text-muted-foreground mt-1">
              Upload and manage your images
            </p>
          </div>
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button
                className="rounded-full cursor-pointer"
                disabled={isUploading}
                asChild
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Image className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Images</span>
            </div>
            <p className="font-display text-3xl font-medium mt-2">
              {files?.length || 0}
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Storage Used</span>
            </div>
            <p className="font-display text-3xl font-medium mt-2">
              {formatFileSize(
                files?.reduce((acc, file) => acc + ((file.metadata?.size as number) || 0), 0) || 0
              )}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>

        {/* Image Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading images...
          </div>
        ) : filteredFiles && filteredFiles.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group relative bg-muted rounded-xl overflow-hidden aspect-square"
              >
                <img
                  src={getPublicUrl(file.name)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyUrl(file.name, file.id)}
                    >
                      {copiedId === file.id ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Image</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this image? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(file.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-background text-xs truncate">{file.name}</p>
                  <p className="text-background/70 text-xs">
                    {formatFileSize((file.metadata?.size as number) || undefined)}
                  </p>
                </div>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No images yet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No images found for "${searchQuery}"`
                : 'Upload your first image to get started.'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;
