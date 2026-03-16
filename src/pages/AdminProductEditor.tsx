import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  useProductById,
  useCreateProduct,
  useUpdateProduct,
  useProductCategories,
} from '@/hooks/useProducts';
import { ArrowLeft, Save, Star } from 'lucide-react';
import { ArrowLeft, Save, Star } from 'lucide-react';
import PinDescriptionGenerator from '@/components/PinDescriptionGenerator';
import AdminProductMediaManager from '@/components/AdminProductMediaManager';

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const AdminProductEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  // fileInputRef removed - image upload now handled by gallery manager

  const { data: existingProduct, isLoading: isLoadingProduct } = useProductById(id || '');
  const { data: categories } = useProductCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [rating, setRating] = useState('0');
  const [reviews, setReviews] = useState('0');
  const [badge, setBadge] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setSlug(existingProduct.slug);
      setDescription(existingProduct.description);
      setPrice(existingProduct.price);
      setOriginalPrice(existingProduct.original_price || '');
      setCategory(existingProduct.category);
      setImageUrl(existingProduct.image_url || '');
      setAffiliateUrl(existingProduct.affiliate_url);
      setRating(existingProduct.rating?.toString() || '0');
      setReviews(existingProduct.reviews?.toString() || '0');
      setBadge(existingProduct.badge || '');
      setIsFeatured(existingProduct.is_featured);
      setIsActive(existingProduct.is_active);
      setAutoSlug(false);
      // SEO fields
      setMetaTitle((existingProduct as any).meta_title || '');
      setMetaDescription((existingProduct as any).meta_description || '');
      setOgImageUrl((existingProduct as any).og_image_url || '');
    }
  }, [existingProduct]);

  // Prefill from navigation state (e.g., from Trending Products)
  useEffect(() => {
    const prefill = (location.state as any)?.prefill;
    if (prefill && !isEditing) {
      if (prefill.name) setName(prefill.name);
      if (prefill.slug) setSlug(prefill.slug);
      if (prefill.description) setDescription(prefill.description);
      if (prefill.price) setPrice(prefill.price);
      if (prefill.original_price) setOriginalPrice(prefill.original_price);
      if (prefill.category) setCategory(prefill.category);
      if (prefill.affiliate_url) setAffiliateUrl(prefill.affiliate_url);
      if (prefill.badge) setBadge(prefill.badge);
      if (prefill.rating) setRating(prefill.rating);
      if (prefill.reviews) setReviews(prefill.reviews);
      if (prefill.meta_title) setMetaTitle(prefill.meta_title);
      if (prefill.meta_description) setMetaDescription(prefill.meta_description);
      setAutoSlug(false);
    }
  }, [location.state, isEditing]);

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(generateSlug(name));
    }
  }, [name, autoSlug]);

  // Image upload now handled by AdminProductMediaManager

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !slug || !description || !price || !category || !affiliateUrl) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    try {
      const productData = {
        name,
        slug,
        description,
        price,
        original_price: originalPrice || null,
        category,
        image_url: imageUrl || null,
        affiliate_url: affiliateUrl,
        rating: parseFloat(rating) || 0,
        reviews: parseInt(reviews) || 0,
        badge: badge || null,
        is_featured: isFeatured,
        is_active: isActive,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        og_image_url: ogImageUrl || null,
      };

      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, ...productData });
        toast({ title: 'Product updated', description: 'Your product has been updated successfully.' });
      } else {
        await createMutation.mutateAsync(productData);
        toast({ title: 'Product created', description: 'Your product has been created successfully.' });
      }

      navigate('/admin/products');
    } catch (error: any) {
      let message = 'Failed to save the product.';
      if (error.message?.includes('duplicate')) {
        message = 'A product with this slug already exists.';
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  if (isEditing && isLoadingProduct) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  // Filter out "All Products" category
  const selectableCategories = categories?.filter(c => c.slug !== 'all') || [];

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="p-4 sm:p-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/admin/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="font-display text-xl sm:text-2xl font-medium">
              {isEditing ? 'Edit Product' : 'New Product'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="isActive" className="text-sm">{isActive ? 'Active' : 'Inactive'}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              <Label htmlFor="isFeatured" className="text-sm">Featured</Label>
            </div>
            <Button type="submit" className="rounded-full" size="sm" disabled={createMutation.isPending || updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" className="text-lg" />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }} placeholder="product-url-slug" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." rows={3} />
          </div>

          {/* Pricing row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$99.99" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input id="originalPrice" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="$129.99 (for sales)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge">Badge</Label>
              <Select value={badge || "none"} onValueChange={(val) => setBadge(val === "none" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select badge (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Badge</SelectItem>
                  <SelectItem value="Bestseller">🏆 Bestseller</SelectItem>
                  <SelectItem value="Editor's Pick">⭐ Editor's Pick</SelectItem>
                  <SelectItem value="New Arrival">✨ New Arrival</SelectItem>
                  <SelectItem value="Most Saved">❤️ Most Saved</SelectItem>
                  <SelectItem value="Sale">🔥 Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category and Affiliate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {selectableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="affiliateUrl">Affiliate URL *</Label>
              <Input id="affiliateUrl" value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} placeholder="https://amazon.com/..." />
            </div>
          </div>

          {/* Rating and Reviews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating" className="flex items-center gap-1">
                <Star className="h-4 w-4" /> Rating (0-5)
              </Label>
              <Input id="rating" type="number" min="0" max="5" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviews">Number of Reviews</Label>
              <Input id="reviews" type="number" min="0" value={reviews} onChange={(e) => setReviews(e.target.value)} />
            </div>
          </div>

          {/* Product Gallery (unified - images & videos) */}
          {isEditing && id ? (
            <div className="border rounded-lg p-6 space-y-4 bg-muted/30">
              <AdminProductMediaManager productId={id} onFirstMediaChange={(url) => setImageUrl(url)} />
            </div>
          ) : (
            <div className="border rounded-lg p-6 bg-muted/30">
              <Label className="text-base font-medium">Product Gallery</Label>
              <p className="text-sm text-muted-foreground mt-2">
                Save the product first, then you can add images and videos to the gallery. The first image becomes the main product image.
              </p>
            </div>
          )}

          {/* Pinterest Pin Description */}
          <PinDescriptionGenerator
            title={name}
            description={description}
            category={category}
            price={price}
            type="product"
          />

          {/* SEO Section */}
          <div className="border rounded-lg p-6 space-y-4 bg-muted/30">
            <h3 className="font-medium text-lg">SEO Settings</h3>
            <p className="text-sm text-muted-foreground">
              Optimize how this product appears in search engines and social media
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
                placeholder="SEO title (defaults to product name)"
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
                placeholder="SEO description (defaults to product description)"
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
                placeholder="Social sharing image (defaults to product image)"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1200x630px for optimal social media display
              </p>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductEditor;
