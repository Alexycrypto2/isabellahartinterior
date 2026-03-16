import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useProductMedia, useAddProductMedia, useDeleteProductMedia, useReorderProductMedia, ProductMedia } from '@/hooks/useProductMedia';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, GripVertical, Play, Image as ImageIcon, Film, Plus, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageResolver';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdminProductMediaManagerProps {
  productId: string;
}

const SortableMediaItem = ({
  item,
  idx,
  onDelete,
}: {
  item: ProductMedia;
  idx: number;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative aspect-square rounded-lg overflow-hidden border border-border group bg-muted',
        isDragging && 'z-50 ring-2 ring-primary opacity-90 shadow-xl'
      )}
    >
      {item.media_type === 'video' ? (
        <div className="w-full h-full flex items-center justify-center relative">
          <video src={item.media_url} className="w-full h-full object-cover" muted preload="metadata" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>
      ) : (
        <img
          src={resolveImageUrl(item.media_url)}
          alt={item.alt_text || `Media ${idx + 1}`}
          className="w-full h-full object-cover"
        />
      )}

      {/* Drag handle */}
      <button
        type="button"
        className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm rounded p-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {/* Order badge */}
      <span className="absolute bottom-1 left-1 bg-background/80 backdrop-blur-sm text-[10px] font-medium px-1.5 py-0.5 rounded">
        {idx + 1}
      </span>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>

      {/* Type indicator */}
      <span className="absolute bottom-1 right-1 bg-background/80 backdrop-blur-sm rounded p-0.5">
        {item.media_type === 'video' ? (
          <Film className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ImageIcon className="h-3 w-3 text-muted-foreground" />
        )}
      </span>
    </div>
  );
};

const AdminProductMediaManager = ({ productId, onFirstMediaChange }: AdminProductMediaManagerProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const { data: mediaItems = [] } = useProductMedia(productId);
  const addMedia = useAddProductMedia();
  const deleteMedia = useDeleteProductMedia();
  const reorderMedia = useReorderProductMedia();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = mediaItems.findIndex((m) => m.id === active.id);
    const newIndex = mediaItems.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(mediaItems, oldIndex, newIndex);

    reorderMedia.mutate({
      items: reordered.map((item, i) => ({
        id: item.id,
        display_order: i,
        product_id: item.product_id,
      })),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isImage && !isVideo) {
          toast({ title: 'Invalid file', description: `${file.name} is not an image or video.`, variant: 'destructive' });
          continue;
        }

        const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds ${isVideo ? '50MB' : '5MB'} limit.`,
            variant: 'destructive',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, file);

        if (uploadError) {
          toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath);

        await addMedia.mutateAsync({
          product_id: productId,
          media_url: publicUrl,
          media_type: isVideo ? 'video' : 'image',
          display_order: mediaItems.length + i,
        });
      }

      toast({ title: 'Upload complete', description: 'Media added successfully.' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;

    const isVideo = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(urlInput) || urlInput.includes('youtube') || urlInput.includes('vimeo');

    try {
      await addMedia.mutateAsync({
        product_id: productId,
        media_url: urlInput.trim(),
        media_type: isVideo ? 'video' : 'image',
        display_order: mediaItems.length,
      });
      setUrlInput('');
      setShowUrlInput(false);
      toast({ title: 'Media added' });
    } catch {
      toast({ title: 'Failed to add media', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia.mutateAsync({ id, productId });
      toast({ title: 'Media removed' });
    } catch {
      toast({ title: 'Failed to remove', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Product Gallery</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Drag to reorder • Images & videos</p>
        </div>
        <span className="text-sm text-muted-foreground">{mediaItems.length} item{mediaItems.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Sortable media grid */}
      {mediaItems.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={mediaItems.map((m) => m.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {mediaItems.map((item, idx) => (
                <SortableMediaItem key={item.id} item={item} idx={idx} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Upload actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="rounded-full"
        >
          <Link className="mr-2 h-4 w-4" />
          Add URL
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* URL input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg or video.mp4"
            className="flex-1"
          />
          <Button type="button" size="sm" onClick={handleAddUrl} disabled={!urlInput.trim()}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Upload images (up to 5MB) or videos (up to 50MB). Supports JPG, PNG, WebP, MP4, WebM.
      </p>
    </div>
  );
};

export default AdminProductMediaManager;
