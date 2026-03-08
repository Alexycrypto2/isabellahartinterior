import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import RichTextEditor from '@/components/RichTextEditor';
import { resolveImageUrl } from '@/lib/imageResolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  useBlogPostById,
  useCreateBlogPost,
  useUpdateBlogPost,
} from '@/hooks/useBlogPosts';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save, Image as ImageIcon, Upload, Sparkles, Link2, ShoppingBag, Crop } from 'lucide-react';
import AiBlogWriter from '@/components/AiBlogWriter';
import FeaturedImageEditor from '@/components/FeaturedImageEditor';
import PinDescriptionGenerator from '@/components/PinDescriptionGenerator';

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const AdminBlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existingPost, isLoading: isLoadingPost } = useBlogPostById(id || '');
  const { data: categories } = useCategories();
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [isAiWriterOpen, setIsAiWriterOpen] = useState(false);
  const [isAddingLinks, setIsAddingLinks] = useState(false);
  const [isEmbeddingProducts, setIsEmbeddingProducts] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');

  // Resolve /src/assets/ paths in HTML content so images display in the editor
  const resolveContentImages = (html: string) => {
    return html.replace(
      /src=(['"])(\/?src\/assets\/[^'"\s>]+)\1/g,
      (_match, quote, path) => `src=${quote}${resolveImageUrl(path)}${quote}`
    );
  };

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setSlug(existingPost.slug);
      setExcerpt(existingPost.excerpt);
      setContent(resolveContentImages(existingPost.content));
      setAuthor(existingPost.author);
      setCategory(existingPost.category);
      setReadTime(existingPost.read_time);
      setImageUrl(existingPost.image_url || '');
      setPublished(existingPost.published);
      setAutoSlug(false);
      // SEO fields
      setMetaTitle((existingPost as any).meta_title || '');
      setMetaDescription((existingPost as any).meta_description || '');
      setOgImageUrl((existingPost as any).og_image_url || '');
    }
  }, [existingPost]);

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(generateSlug(title));
    }
  }, [title, autoSlug]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert to WebP for better performance
      const webpBlob = await convertToWebP(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
      const filePath = `featured/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, webpBlob, { contentType: 'image/webp' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast({
        title: 'Image uploaded',
        description: 'Image converted to WebP and uploaded successfully.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Convert image file to WebP format
  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context failed')); return; }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('WebP conversion failed')),
          'image/webp',
          0.85
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleContentImageUpload = useCallback((insertImage: (url: string, alt?: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid file type', description: 'Please upload an image file.', variant: 'destructive' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Max 5MB.', variant: 'destructive' });
        return;
      }

      try {
        const webpBlob = await convertToWebP(file);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
        const filePath = `content/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, webpBlob, { contentType: 'image/webp' });
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath);

        insertImage(publicUrl, file.name);
        toast({ title: 'Image inserted', description: 'Image uploaded and added to content.' });
      } catch (error) {
        console.error('Content image upload error:', error);
        toast({ title: 'Upload failed', description: 'Failed to upload image.', variant: 'destructive' });
      }
    };
    input.click();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !excerpt || !content || !author || !category) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const postData = {
        title,
        slug,
        excerpt,
        content,
        author,
        category,
        read_time: readTime,
        image_url: imageUrl || null,
        published,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        og_image_url: ogImageUrl || null,
      };

      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, ...postData });
        toast({
          title: 'Post updated',
          description: 'Your blog post has been updated successfully.',
        });
      } else {
        await createMutation.mutateAsync(postData);
        toast({
          title: 'Post created',
          description: 'Your blog post has been created successfully.',
        });
      }

      navigate('/admin');
    } catch (error: any) {
      let message = 'Failed to save the post.';
      if (error.message?.includes('duplicate')) {
        message = 'A post with this slug already exists. Please use a different title.';
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleAddInternalLinks = async () => {
    if (!content) {
      toast({ title: 'No content', description: 'Write or generate content first before adding internal links.', variant: 'destructive' });
      return;
    }
    setIsAddingLinks(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-internal-links', {
        body: { content, currentSlug: slug },
      });
      if (error) throw error;
      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }
      setContent(data.content);
      toast({
        title: data.linksAdded > 0 ? `${data.linksAdded} internal links added!` : 'No new links needed',
        description: data.linksAdded > 0
          ? 'Internal links have been inserted into your content for better SEO.'
          : data.message || 'The content already has sufficient internal links.',
      });
    } catch (error) {
      console.error('Internal links error:', error);
      toast({ title: 'Error', description: 'Failed to add internal links. Please try again.', variant: 'destructive' });
    } finally {
      setIsAddingLinks(false);
    }
  };

  const handleEmbedProducts = async () => {
    if (!content) {
      toast({ title: 'No content', description: 'Write or generate content first before embedding products.', variant: 'destructive' });
      return;
    }
    setIsEmbeddingProducts(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-internal-links', {
        body: { content, currentSlug: slug, mode: 'products' },
      });
      if (error) throw error;
      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }
      setContent(resolveContentImages(data.content));
      toast({
        title: data.productsAdded > 0 ? `${data.productsAdded} products embedded!` : 'No products added',
        description: data.productsAdded > 0
          ? 'Product images and affiliate links have been inserted into your content.'
          : 'No matching products found for this content.',
      });
    } catch (error) {
      console.error('Product embed error:', error);
      toast({ title: 'Error', description: 'Failed to embed products. Please try again.', variant: 'destructive' });
    } finally {
      setIsEmbeddingProducts(false);
    }
  };

  if (isEditing && isLoadingPost) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="font-display text-2xl font-medium">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-accent/30 text-accent hover:bg-accent/10"
              onClick={() => setIsAiWriterOpen(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isEditing ? 'Rewrite with AI' : 'Write with AI'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={handleAddInternalLinks}
              disabled={isAddingLinks || !content}
            >
              <Link2 className="mr-2 h-4 w-4" />
              {isAddingLinks ? 'Adding Links...' : 'Add Internal Links'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={handleEmbedProducts}
              disabled={isEmbeddingProducts || !content}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {isEmbeddingProducts ? 'Embedding...' : 'Embed Products'}
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">
                {published ? 'Published' : 'Draft'}
              </Label>
            </div>
            <Button
              type="submit"
              className="rounded-full"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : 'Save Post'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="text-lg"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug *
              <span className="text-muted-foreground text-sm ml-2">
                (URL-friendly identifier)
              </span>
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="post-url-slug"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post..."
              rows={2}
            />
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="readTime">Read Time</Label>
              <Input
                id="readTime"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="5 min read"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label>Featured Image <span className="text-muted-foreground text-sm">(Recommended: 1200×630px)</span></Label>
            <div className="border-2 border-dashed rounded-lg p-6">
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Featured"
                    className="w-full aspect-[1200/630] object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsImageEditorOpen(true)}
                    >
                      <Crop className="mr-2 h-4 w-4" />
                      Crop / Resize
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Upload a featured image for your post
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Or paste an image URL:
            </p>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <RichTextEditor content={content} onChange={setContent} onImageUpload={handleContentImageUpload} />
          </div>

          {/* SEO Section */}
          <div className="border rounded-lg p-6 space-y-4 bg-muted/30">
            <h3 className="font-medium text-lg">SEO Settings</h3>
            <p className="text-sm text-muted-foreground">
              Optimize how this post appears in search engines and social media
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="metaTitle">
                Meta Title
                <span className="text-muted-foreground text-sm ml-2">
                  ({metaTitle.length}/60 characters)
                </span>
              </Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="SEO title (defaults to post title)"
                maxLength={60}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">
                Meta Description
                <span className="text-muted-foreground text-sm ml-2">
                  ({metaDescription.length}/160 characters)
                </span>
              </Label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO description (defaults to excerpt)"
                maxLength={160}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogImageUrl">Open Graph Image URL</Label>
              <Input
                id="ogImageUrl"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                placeholder="Social sharing image (defaults to featured image)"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1200x630px for optimal social media display
              </p>
            </div>
          </div>
        </div>

        <AiBlogWriter
          isOpen={isAiWriterOpen}
          onClose={() => setIsAiWriterOpen(false)}
          categories={categories || []}
          onGenerated={(data) => {
            setTitle(data.title);
            setSlug(data.slug);
            setAutoSlug(false);
            setExcerpt(data.excerpt);
            setContent(resolveContentImages(data.content));
            setMetaTitle(data.meta_title);
            setMetaDescription(data.meta_description);
            setReadTime(data.read_time);
            if (data.image_url) {
              setImageUrl(data.image_url);
              setOgImageUrl(data.image_url);
            }
          }}
        />

        {imageUrl && (
          <FeaturedImageEditor
            isOpen={isImageEditorOpen}
            onClose={() => setIsImageEditorOpen(false)}
            imageUrl={imageUrl}
            onSave={async (blob) => {
              try {
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
                const filePath = `featured/${fileName}`;
                const { error } = await supabase.storage
                  .from('blog-images')
                  .upload(filePath, blob, { contentType: 'image/webp' });
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage
                  .from('blog-images')
                  .getPublicUrl(filePath);
                setImageUrl(publicUrl);
                setOgImageUrl(publicUrl);
                toast({ title: 'Image saved', description: 'Cropped image uploaded successfully.' });
              } catch (err) {
                console.error(err);
                toast({ title: 'Save failed', description: 'Could not upload cropped image.', variant: 'destructive' });
              }
            }}
          />
        )}
      </form>
    </AdminLayout>
  );
};

export default AdminBlogEditor;
