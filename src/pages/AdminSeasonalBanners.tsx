import { useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAllSeasonalBanners, useCreateSeasonalBanner, useUpdateSeasonalBanner, useDeleteSeasonalBanner } from '@/hooks/useSeasonalBanners';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Upload, Calendar, Save, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const AdminSeasonalBanners = () => {
  const { data: banners, isLoading } = useAllSeasonalBanners();
  const createMutation = useCreateSeasonalBanner();
  const updateMutation = useUpdateSeasonalBanner();
  const deleteMutation = useDeleteSeasonalBanner();
  const { toast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [badgeText, setBadgeText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('blog-images').upload(`banners/${fileName}`, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(`banners/${fileName}`);
      setImageUrl(publicUrl);
      toast({ title: 'Uploaded', description: 'Banner image uploaded.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to upload image.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!title || !startDate || !endDate) {
      toast({ title: 'Missing fields', description: 'Title, start date and end date are required.', variant: 'destructive' });
      return;
    }
    try {
      await createMutation.mutateAsync({
        title,
        subtitle: subtitle || null,
        image_url: imageUrl || null,
        cta_text: ctaText,
        cta_link: ctaLink,
        badge_text: badgeText || null,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        is_active: true,
        priority,
      });
      toast({ title: 'Created', description: 'Seasonal banner scheduled.' });
      resetForm();
    } catch {
      toast({ title: 'Error', description: 'Failed to create banner.', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setCtaText('Shop Now');
    setCtaLink('/shop');
    setBadgeText('');
    setStartDate('');
    setEndDate('');
    setPriority(0);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateMutation.mutateAsync({ id, is_active: !current });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await deleteMutation.mutateAsync(id);
    toast({ title: 'Deleted', description: 'Banner removed.' });
  };

  const getBannerStatus = (banner: { start_date: string; end_date: string; is_active: boolean }) => {
    const now = new Date();
    const start = new Date(banner.start_date);
    const end = new Date(banner.end_date);
    if (!banner.is_active) return { label: 'Disabled', variant: 'secondary' as const };
    if (now < start) return { label: 'Scheduled', variant: 'outline' as const };
    if (now > end) return { label: 'Expired', variant: 'destructive' as const };
    return { label: 'Live', variant: 'default' as const };
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-medium">Seasonal Banners</h1>
              <p className="text-sm text-muted-foreground">Schedule hero banners for holidays & promotions</p>
            </div>
          </div>
          <Button onClick={() => setIsCreating(!isCreating)} className="rounded-full" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Banner
          </Button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        {/* Create form */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                New Seasonal Banner
              </CardTitle>
              <CardDescription>Schedule a special hero banner for holidays, sales, or seasonal events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Black Friday Sale ✨" />
                </div>
                <div className="space-y-2">
                  <Label>Badge Text</Label>
                  <Input value={badgeText} onChange={e => setBadgeText(e.target.value)} placeholder="LIMITED TIME" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Up to 60% off on curated home decor..." rows={2} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CTA Button Text</Label>
                  <Input value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="Shop Now" />
                </div>
                <div className="space-y-2">
                  <Label>CTA Link</Label>
                  <Input value={ctaLink} onChange={e => setCtaLink(e.target.value)} placeholder="/shop" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Priority (higher = shown first)</Label>
                <Input type="number" value={priority} onChange={e => setPriority(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-3">
                <Label>Banner Image</Label>
                {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-border" />}
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <span className="text-xs text-muted-foreground">or</span>
                  <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Paste image URL" className="flex-1 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="rounded-full">
                  <Save className="mr-2 h-4 w-4" />
                  Schedule Banner
                </Button>
                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !banners || banners.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-display text-lg font-medium mb-2">No banners yet</h3>
              <p className="text-sm text-muted-foreground">Schedule your first seasonal banner for holidays like Christmas, Black Friday, or Spring Sale.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {banners.map(banner => {
              const status = getBannerStatus(banner);
              return (
                <Card key={banner.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {banner.image_url && (
                      <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display text-lg font-medium">{banner.title}</h3>
                            <Badge variant={status.variant}>{status.label}</Badge>
                            {banner.badge_text && <Badge variant="outline">{banner.badge_text}</Badge>}
                          </div>
                          {banner.subtitle && <p className="text-sm text-muted-foreground line-clamp-1">{banner.subtitle}</p>}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(banner.start_date), 'MMM d, yyyy HH:mm')} → {format(new Date(banner.end_date), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={banner.is_active} onCheckedChange={() => toggleActive(banner.id, banner.is_active)} />
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSeasonalBanners;
