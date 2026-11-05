import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Upload, Images, Loader2 } from 'lucide-react';

interface Props {
  content: string;
  onChange: (html: string) => void;
}

interface Slot { index: number; src: string; alt: string }

function parseImages(html: string): Slot[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.querySelectorAll('img')).map((img, index) => ({
    index,
    src: img.getAttribute('src') || '',
    alt: img.getAttribute('alt') || '',
  }));
}

function updateImage(html: string, index: number, patch: { src?: string; alt?: string }) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const img = doc.querySelectorAll('img')[index];
  if (!img) return html;
  if (patch.src) img.setAttribute('src', patch.src);
  if (patch.alt !== undefined) img.setAttribute('alt', patch.alt);
  return doc.body.innerHTML;
}

export default function ArticleImageStudio({ content, onChange }: Props) {
  const slots = useMemo(() => parseImages(content), [content]);
  const [busy, setBusy] = useState<number | null>(null);
  const [prompts, setPrompts] = useState<Record<number, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadIdx = useRef<number>(-1);

  const regenerate = async (s: Slot) => {
    setBusy(s.index);
    try {
      const prompt = prompts[s.index] || s.alt || 'Editorial interior design photograph';
      const { data, error } = await supabase.functions.invoke('generate-blog-image', { body: { prompt } });
      if (error || !data?.image_url) throw new Error(data?.error || error?.message || 'No image returned');
      onChange(updateImage(content, s.index, { src: data.image_url }));
      toast.success('New image created — remember to save the post');
    } catch (e: any) {
      toast.error(`Could not create image: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const onFile = async (file: File) => {
    const idx = uploadIdx.current;
    setBusy(idx);
    try {
      const path = `uploads/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '-')}`;
      const { error } = await supabase.storage.from('blog-images').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
      onChange(updateImage(content, idx, { src: data.publicUrl }));
      toast.success('Image replaced — remember to save the post');
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="border border-border p-6 space-y-4 bg-muted/30">
      <div className="flex items-center gap-2">
        <Images className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-lg">Article Image Studio</h3>
        <span className="text-sm text-muted-foreground">({slots.length} images in article)</span>
      </div>
      {slots.length === 0 && <p className="text-sm text-muted-foreground">No images inside the article yet.</p>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((s) => (
          <div key={s.index} className="border border-border bg-background p-3 space-y-2">
            <div className="aspect-square overflow-hidden bg-muted relative">
              {s.src && <img src={s.src} alt={s.alt} className="w-full h-full object-cover" loading="lazy" />}
              {busy === s.index && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <Input value={s.alt} placeholder="Alt text (for Google)"
              onChange={(e) => onChange(updateImage(content, s.index, { alt: e.target.value }))} />
            <Input value={prompts[s.index] ?? ''} placeholder="Describe the new image (optional)"
              onChange={(e) => setPrompts({ ...prompts, [s.index]: e.target.value })} />
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" disabled={busy !== null} onClick={() => regenerate(s)}>
                <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
              </Button>
              <Button type="button" size="sm" variant="ghost" disabled={busy !== null}
                onClick={() => { uploadIdx.current = s.index; fileRef.current?.click(); }}>
                <Upload className="h-4 w-4 mr-1" /> Replace
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
