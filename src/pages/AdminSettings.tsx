import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useSiteSettings, useUpsertSiteSetting } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, Home, Info, Mail, FileText, Share2, Bell, Settings2, Bot, Eye, EyeOff, ImageIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_NEWSLETTER_SETTINGS } from '@/hooks/useNewsletterSettings';

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpsertSiteSetting();
  const { toast } = useToast();

  // Hero settings
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');

  // Shop hero settings
  const [shopTitle, setShopTitle] = useState('');
  const [shopSubtitle, setShopSubtitle] = useState('');
  const [shopImage, setShopImage] = useState('');

  // About settings
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');
  const [aboutImage, setAboutImage] = useState('');

  // Contact settings
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');

// Footer settings
  const [footerCopyright, setFooterCopyright] = useState('');

  // Social media settings
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialPinterest, setSocialPinterest] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');

  // Newsletter popup settings
  const [newsletterEnabled, setNewsletterEnabled] = useState(DEFAULT_NEWSLETTER_SETTINGS.enabled);
  const [newsletterDelay, setNewsletterDelay] = useState(DEFAULT_NEWSLETTER_SETTINGS.delay_seconds);
  const [newsletterScroll, setNewsletterScroll] = useState(DEFAULT_NEWSLETTER_SETTINGS.scroll_threshold);
  const [newsletterExpiry, setNewsletterExpiry] = useState(DEFAULT_NEWSLETTER_SETTINGS.expiry_days);

  // AI API settings - Text
  const [aiTextProvider, setAiTextProvider] = useState('openai');
  const [aiTextKey, setAiTextKey] = useState('');
  const [aiTextModel, setAiTextModel] = useState('');
  const [aiTextEndpoint, setAiTextEndpoint] = useState('');
  const [showTextKey, setShowTextKey] = useState(false);

  // AI API settings - Image
  const [aiImageProvider, setAiImageProvider] = useState('openai');
  const [aiImageKey, setAiImageKey] = useState('');
  const [aiImageModel, setAiImageModel] = useState('');
  const [aiImageEndpoint, setAiImageEndpoint] = useState('');
  const [showImageKey, setShowImageKey] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get setting value by key
  const getSetting = (key: string) => {
    const setting = settings?.find(s => s.key === key);
    return setting?.value || {};
  };

  useEffect(() => {
    if (settings) {
      // Hero
      const hero = getSetting('hero') as Record<string, string>;
      setHeroTitle(hero.title || '');
      setHeroSubtitle(hero.subtitle || '');
      setHeroImage(hero.image_url || '');
      
      // Shop hero
      const shopHero = getSetting('shop_hero') as Record<string, string>;
      setShopTitle(shopHero.title || '');
      setShopSubtitle(shopHero.subtitle || '');
      setShopImage(shopHero.image_url || '');
      
      // About
      const about = getSetting('about') as Record<string, string>;
      setAboutTitle(about.title || '');
      setAboutDescription(about.description || '');
      setAboutImage(about.image_url || '');
      
      // Contact
      const contact = getSetting('contact') as Record<string, string>;
      setContactEmail(contact.email || '');
      setContactPhone(contact.phone || '');
      setContactAddress(contact.address || '');
      
      // Footer
      const footer = getSetting('footer') as Record<string, string>;
      setFooterCopyright(footer.copyright || '');
      
      // Social media
      const social = getSetting('social_media') as Record<string, string>;
      setSocialInstagram(social.instagram || '');
      setSocialFacebook(social.facebook || '');
      setSocialTwitter(social.twitter || '');
      setSocialPinterest(social.pinterest || '');
      setSocialYoutube(social.youtube || '');
      setSocialTiktok(social.tiktok || '');
      setSocialLinkedin(social.linkedin || '');

      // Newsletter popup
      const newsletter = getSetting('newsletter_popup') as Record<string, any>;
      setNewsletterEnabled(newsletter.enabled ?? DEFAULT_NEWSLETTER_SETTINGS.enabled);
      setNewsletterDelay(newsletter.delay_seconds ?? DEFAULT_NEWSLETTER_SETTINGS.delay_seconds);
      setNewsletterScroll(newsletter.scroll_threshold ?? DEFAULT_NEWSLETTER_SETTINGS.scroll_threshold);
      setNewsletterExpiry(newsletter.expiry_days ?? DEFAULT_NEWSLETTER_SETTINGS.expiry_days);

      // AI API
      const ai = getSetting('ai_api') as Record<string, any>;
      setAiTextProvider(ai.text_provider || ai.provider || 'openai');
      setAiTextKey(ai.text_api_key || ai.api_key || '');
      setAiTextModel(ai.text_model || ai.model || '');
      setAiTextEndpoint(ai.text_endpoint || '');
      setAiImageProvider(ai.image_provider || 'openai');
      setAiImageKey(ai.image_api_key || '');
      setAiImageModel(ai.image_model || '');
      setAiImageEndpoint(ai.image_endpoint || '');
    }
  }, [settings]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uploadTarget}-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      // Set the appropriate state based on target
      switch (uploadTarget) {
        case 'hero':
          setHeroImage(publicUrl);
          break;
        case 'shop':
          setShopImage(publicUrl);
          break;
        case 'about':
          setAboutImage(publicUrl);
          break;
      }

      toast({ title: 'Image uploaded', description: 'Your image has been uploaded successfully.' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: 'Failed to upload image.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setUploadTarget(null);
    }
  };

  const triggerUpload = (target: string) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const saveHero = async () => {
    try {
      await updateMutation.mutateAsync({
        key: 'hero',
        value: { title: heroTitle, subtitle: heroSubtitle, image_url: heroImage || null },
      });
      toast({ title: 'Saved', description: 'Hero section updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    }
  };

  const saveShopHero = async () => {
    try {
      await updateMutation.mutateAsync({
        key: 'shop_hero',
        value: { title: shopTitle, subtitle: shopSubtitle, image_url: shopImage || null },
      });
      toast({ title: 'Saved', description: 'Shop hero updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    }
  };

  const saveAbout = async () => {
    try {
      await updateMutation.mutateAsync({
        key: 'about',
        value: { title: aboutTitle, description: aboutDescription, image_url: aboutImage || null },
      });
      toast({ title: 'Saved', description: 'About section updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    }
  };

  const saveContact = async () => {
    try {
      await updateMutation.mutateAsync({
        key: 'contact',
        value: { email: contactEmail, phone: contactPhone, address: contactAddress },
      });
      toast({ title: 'Saved', description: 'Contact info updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    }
  };

  const saveFooter = async () => {
    try {
      await updateMutation.mutateAsync({
        key: 'footer',
        value: { copyright: footerCopyright },
      });
      toast({ title: 'Saved', description: 'Footer updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    }
  };

  const saveSocialMedia = async () => {
    try {
      await updateMutation.mutateAsync({
        key: 'social_media',
        value: {
          instagram: socialInstagram || null,
          facebook: socialFacebook || null,
          twitter: socialTwitter || null,
          pinterest: socialPinterest || null,
          youtube: socialYoutube || null,
          tiktok: socialTiktok || null,
          linkedin: socialLinkedin || null,
        },
      });
      toast({ title: 'Saved', description: 'Social media links updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    }
  };

  const saveNewsletterSettings = async () => {
    try {
      await updateMutation.mutateAsync({
        key: 'newsletter_popup',
        value: {
          enabled: newsletterEnabled,
          delay_seconds: newsletterDelay,
          scroll_threshold: newsletterScroll,
          expiry_days: newsletterExpiry,
        },
      });
      toast({ title: 'Saved', description: 'Newsletter popup settings updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    }
  };

  const saveAiSettings = async () => {
    try {
      await updateMutation.mutateAsync({
        key: 'ai_api',
        value: {
          text_provider: aiTextProvider,
          text_api_key: aiTextKey,
          text_model: aiTextModel,
          text_endpoint: aiTextEndpoint,
          image_provider: aiImageProvider,
          image_api_key: aiImageKey,
          image_model: aiImageModel,
          image_endpoint: aiImageEndpoint,
          // Keep backward-compatible fields for edge functions
          provider: aiTextProvider,
          api_key: aiTextKey,
          model: aiTextModel,
        },
      });
      toast({ title: 'Saved', description: 'AI API settings updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save AI settings.', variant: 'destructive' });
    }
  };

  const getDefaultTextModel = (provider: string) => {
    switch (provider) {
      case 'openai': return 'gpt-4o-mini';
      case 'google': return 'gemini-2.0-flash';
      case 'anthropic': return 'claude-sonnet-4-20250514';
      case 'custom': return '';
      default: return '';
    }
  };

  const getDefaultImageModel = (provider: string) => {
    switch (provider) {
      case 'openai': return 'dall-e-3';
      case 'google': return 'imagen-3.0-generate-002';
      case 'custom': return '';
      default: return '';
    }
  };

  const getTextKeyPlaceholder = (provider: string) => {
    switch (provider) {
      case 'openai': return 'sk-...';
      case 'google': return 'AIza...';
      case 'anthropic': return 'sk-ant-...';
      case 'custom': return 'Your API key';
      default: return '';
    }
  };

  const getTextKeyHint = (provider: string) => {
    switch (provider) {
      case 'openai': return 'Get your key from platform.openai.com/api-keys';
      case 'google': return 'Get your key from aistudio.google.com/apikey';
      case 'anthropic': return 'Get your key from console.anthropic.com/settings/keys';
      case 'custom': return 'Enter the API key for your custom provider';
      default: return '';
    }
  };

  if (isLoading) {
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
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-medium">Site Settings</h1>
              <p className="text-sm text-muted-foreground">Customize your website content and appearance</p>
            </div>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        <Tabs defaultValue="hero" className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-11 p-1 gap-1">
              <TabsTrigger value="hero" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <Home className="h-3.5 w-3.5" />
                Hero
              </TabsTrigger>
              <TabsTrigger value="shop" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <FileText className="h-3.5 w-3.5" />
                Shop
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <Info className="h-3.5 w-3.5" />
                About
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <Mail className="h-3.5 w-3.5" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <Share2 className="h-3.5 w-3.5" />
                Social
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <Bell className="h-3.5 w-3.5" />
                Newsletter
              </TabsTrigger>
              <TabsTrigger value="footer" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <FileText className="h-3.5 w-3.5" />
                Footer
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <Bot className="h-3.5 w-3.5" />
                AI API
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Hero</CardTitle>
                <CardDescription>Customize the main hero section on your homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title</Label>
                  <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Curated Home Finds" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Subtitle</Label>
                  <Textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Transform your space..." rows={3} />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Background Image</Label>
                  {heroImage && (
                    <img src={heroImage} alt="Hero preview" className="w-full h-32 object-cover rounded-lg border border-border" />
                  )}
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => triggerUpload('hero')} disabled={isUploading}>
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      {isUploading && uploadTarget === 'hero' ? 'Uploading...' : 'Upload'}
                    </Button>
                    <span className="text-xs text-muted-foreground">or</span>
                    <Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="Paste image URL" className="flex-1 text-sm" />
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <Button onClick={saveHero} disabled={updateMutation.isPending} className="rounded-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Hero Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Hero Section */}
          <TabsContent value="shop">
            <Card>
              <CardHeader>
                <CardTitle>Shop Page Hero</CardTitle>
                <CardDescription>Customize the hero section on your shop page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title</Label>
                  <Input value={shopTitle} onChange={(e) => setShopTitle(e.target.value)} placeholder="Shop Our Collection" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Subtitle</Label>
                  <Textarea value={shopSubtitle} onChange={(e) => setShopSubtitle(e.target.value)} placeholder="Handpicked pieces..." rows={3} />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Background Image</Label>
                  {shopImage && (
                    <img src={shopImage} alt="Shop preview" className="w-full h-32 object-cover rounded-lg border border-border" />
                  )}
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => triggerUpload('shop')} disabled={isUploading}>
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      {isUploading && uploadTarget === 'shop' ? 'Uploading...' : 'Upload'}
                    </Button>
                    <span className="text-xs text-muted-foreground">or</span>
                    <Input value={shopImage} onChange={(e) => setShopImage(e.target.value)} placeholder="Paste image URL" className="flex-1 text-sm" />
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <Button onClick={saveShopHero} disabled={updateMutation.isPending} className="rounded-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Shop Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Section */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Customize your about page content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title</Label>
                  <Input value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} placeholder="About Us" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea value={aboutDescription} onChange={(e) => setAboutDescription(e.target.value)} placeholder="Tell your story..." rows={5} />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Image</Label>
                  {aboutImage && (
                    <img src={aboutImage} alt="About preview" className="w-full h-32 object-cover rounded-lg border border-border" />
                  )}
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => triggerUpload('about')} disabled={isUploading}>
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      {isUploading && uploadTarget === 'about' ? 'Uploading...' : 'Upload'}
                    </Button>
                    <span className="text-xs text-muted-foreground">or</span>
                    <Input value={aboutImage} onChange={(e) => setAboutImage(e.target.value)} placeholder="Paste image URL" className="flex-1 text-sm" />
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <Button onClick={saveAbout} disabled={updateMutation.isPending} className="rounded-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save About Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Section */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Update your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} placeholder="Your business address" rows={2} />
                </div>
                <div className="pt-2 border-t border-border">
                  <Button onClick={saveContact} disabled={updateMutation.isPending} className="rounded-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Contact Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Section */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Add your social media profile URLs to display across your site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/yourusername" />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/yourpage" />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter / X</Label>
                    <Input value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} placeholder="https://twitter.com/yourusername" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pinterest</Label>
                    <Input value={socialPinterest} onChange={(e) => setSocialPinterest(e.target.value)} placeholder="https://pinterest.com/yourusername" />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube</Label>
                    <Input value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} placeholder="https://youtube.com/@yourchannel" />
                  </div>
                  <div className="space-y-2">
                    <Label>TikTok</Label>
                    <Input value={socialTiktok} onChange={(e) => setSocialTiktok(e.target.value)} placeholder="https://tiktok.com/@yourusername" />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn</Label>
                    <Input value={socialLinkedin} onChange={(e) => setSocialLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourusername" />
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <Button onClick={saveSocialMedia} disabled={updateMutation.isPending} className="rounded-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Social Media Links
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Newsletter Popup Section */}
          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Popup Settings</CardTitle>
                <CardDescription>Control when and how the newsletter signup popup appears to visitors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-base">Enable Newsletter Popup</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Show the email signup popup to visitors
                    </p>
                  </div>
                  <Switch 
                    checked={newsletterEnabled} 
                    onCheckedChange={setNewsletterEnabled}
                  />
                </div>

                {/* Delay */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Time Delay</Label>
                      <p className="text-sm text-muted-foreground">
                        Show popup after this many seconds on page
                      </p>
                    </div>
                    <span className="text-lg font-medium tabular-nums">{newsletterDelay}s</span>
                  </div>
                  <Slider
                    value={[newsletterDelay]}
                    onValueChange={([val]) => setNewsletterDelay(val)}
                    min={10}
                    max={120}
                    step={5}
                    disabled={!newsletterEnabled}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10s</span>
                    <span>120s</span>
                  </div>
                </div>

                {/* Scroll Threshold */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Scroll Threshold</Label>
                      <p className="text-sm text-muted-foreground">
                        Or show when visitor scrolls this percentage of the page
                      </p>
                    </div>
                    <span className="text-lg font-medium tabular-nums">{newsletterScroll}%</span>
                  </div>
                  <Slider
                    value={[newsletterScroll]}
                    onValueChange={([val]) => setNewsletterScroll(val)}
                    min={20}
                    max={90}
                    step={5}
                    disabled={!newsletterEnabled}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>20%</span>
                    <span>90%</span>
                  </div>
                </div>

                {/* Don't Show Again Period */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Don't Show Again For</Label>
                      <p className="text-sm text-muted-foreground">
                        Days before showing the popup again after dismissal
                      </p>
                    </div>
                    <span className="text-lg font-medium tabular-nums">{newsletterExpiry} days</span>
                  </div>
                  <Slider
                    value={[newsletterExpiry]}
                    onValueChange={([val]) => setNewsletterExpiry(val)}
                    min={1}
                    max={30}
                    step={1}
                    disabled={!newsletterEnabled}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 day</span>
                    <span>30 days</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <Button onClick={saveNewsletterSettings} disabled={updateMutation.isPending} className="rounded-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Newsletter Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Section */}
          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>Customize your website footer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Copyright Text</Label>
                  <Input value={footerCopyright} onChange={(e) => setFooterCopyright(e.target.value)} placeholder="© 2024 Your Brand. All rights reserved." />
                </div>
                <div className="pt-2 border-t border-border">
                  <Button onClick={saveFooter} disabled={updateMutation.isPending} className="rounded-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Footer Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI API Section */}
          <TabsContent value="ai">
            <div className="space-y-6">
              {/* How it works */}
              <Card>
                <CardHeader>
                  <CardTitle>AI API Configuration</CardTitle>
                  <CardDescription>
                    Configure separate API keys for text generation (blog writing, chat, recommendations) and image generation. Built-in AI is used first; your keys are used as fallback.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">How it works:</strong> The site tries built-in AI credits first. If credits run out, it automatically falls back to your custom API keys below. Text and image generation use different APIs, so you can configure them separately.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Text AI */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Text AI (Blog, Chat, Recommendations)</CardTitle>
                      <CardDescription>Used for blog writing, chatbot, and product recommendations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Provider</Label>
                    <Select value={aiTextProvider} onValueChange={(val) => { setAiTextProvider(val); setAiTextModel(getDefaultTextModel(val)); if (val !== 'custom') setAiTextEndpoint(''); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                        <SelectItem value="google">Google (Gemini)</SelectItem>
                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                        <SelectItem value="custom">Custom (OpenAI-compatible)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {aiTextProvider === 'custom' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">API Endpoint URL</Label>
                      <Input value={aiTextEndpoint} onChange={(e) => setAiTextEndpoint(e.target.value)} placeholder="https://api.example.com/v1/chat/completions" />
                      <p className="text-xs text-muted-foreground">Must be OpenAI-compatible (e.g. Groq, Mistral, Together AI, Ollama, LM Studio)</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">API Key</Label>
                    <div className="relative">
                      <Input
                        type={showTextKey ? 'text' : 'password'}
                        value={aiTextKey}
                        onChange={(e) => setAiTextKey(e.target.value)}
                        placeholder={getTextKeyPlaceholder(aiTextProvider)}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowTextKey(!showTextKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showTextKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{getTextKeyHint(aiTextProvider)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Model {aiTextProvider === 'custom' ? '' : '(optional)'}</Label>
                    <Input value={aiTextModel} onChange={(e) => setAiTextModel(e.target.value)} placeholder={getDefaultTextModel(aiTextProvider) || 'e.g. llama-3.1-70b-versatile'} />
                    {getDefaultTextModel(aiTextProvider) && <p className="text-xs text-muted-foreground">Leave blank to use the default: {getDefaultTextModel(aiTextProvider)}</p>}
                  </div>
                  {aiTextKey && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm text-emerald-700 dark:text-emerald-400">Text AI fallback configured</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Image AI */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Image AI (Blog Featured Images)</CardTitle>
                      <CardDescription>Used for generating blog post featured images</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Provider</Label>
                    <Select value={aiImageProvider} onValueChange={(val) => { setAiImageProvider(val); setAiImageModel(getDefaultImageModel(val)); if (val !== 'custom') setAiImageEndpoint(''); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI (DALL·E)</SelectItem>
                        <SelectItem value="google">Google (Imagen)</SelectItem>
                        <SelectItem value="custom">Custom (OpenAI-compatible)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {aiImageProvider === 'custom' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">API Endpoint URL</Label>
                      <Input value={aiImageEndpoint} onChange={(e) => setAiImageEndpoint(e.target.value)} placeholder="https://api.example.com/v1/images/generations" />
                      <p className="text-xs text-muted-foreground">Must be OpenAI-compatible image generation endpoint</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">API Key</Label>
                    <div className="relative">
                      <Input
                        type={showImageKey ? 'text' : 'password'}
                        value={aiImageKey}
                        onChange={(e) => setAiImageKey(e.target.value)}
                        placeholder={aiImageProvider === 'custom' ? 'Your API key' : aiImageProvider === 'openai' ? 'sk-...' : 'AIza...'}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowImageKey(!showImageKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showImageKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {aiImageProvider === 'openai' && 'Same OpenAI key works for DALL·E — platform.openai.com/api-keys'}
                      {aiImageProvider === 'google' && 'Same Google key works for Imagen — aistudio.google.com/apikey'}
                      {aiImageProvider === 'custom' && 'Enter the API key for your custom image provider'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Model {aiImageProvider === 'custom' ? '' : '(optional)'}</Label>
                    <Input value={aiImageModel} onChange={(e) => setAiImageModel(e.target.value)} placeholder={getDefaultImageModel(aiImageProvider) || 'e.g. stable-diffusion-xl'} />
                    {getDefaultImageModel(aiImageProvider) && <p className="text-xs text-muted-foreground">Leave blank to use the default: {getDefaultImageModel(aiImageProvider)}</p>}
                  </div>
                  {aiImageKey && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm text-emerald-700 dark:text-emerald-400">Image AI fallback configured</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Save */}
              <div className="pt-2">
                <Button onClick={saveAiSettings} disabled={updateMutation.isPending} className="rounded-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save All AI Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
