import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSiteSettings, useUpsertSiteSetting } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, Home, Info, Mail, FileText, Share2 } from 'lucide-react';

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
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-medium">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your website content and appearance</p>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Hero</CardTitle>
                <CardDescription>Customize the main hero section on your homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Curated Home Finds" />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Transform your space..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Background Image</Label>
                  <div className="flex gap-4">
                    {heroImage && <img src={heroImage} alt="Hero" className="w-32 h-20 object-cover rounded-lg" />}
                    <Button type="button" variant="outline" onClick={() => triggerUpload('hero')} disabled={isUploading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading && uploadTarget === 'hero' ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </div>
                  <Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="Or paste image URL" className="mt-2" />
                </div>
                <Button onClick={saveHero} disabled={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Hero Settings
                </Button>
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
                  <Label>Title</Label>
                  <Input value={shopTitle} onChange={(e) => setShopTitle(e.target.value)} placeholder="Shop Our Collection" />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Textarea value={shopSubtitle} onChange={(e) => setShopSubtitle(e.target.value)} placeholder="Handpicked pieces..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Background Image</Label>
                  <div className="flex gap-4">
                    {shopImage && <img src={shopImage} alt="Shop" className="w-32 h-20 object-cover rounded-lg" />}
                    <Button type="button" variant="outline" onClick={() => triggerUpload('shop')} disabled={isUploading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading && uploadTarget === 'shop' ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </div>
                  <Input value={shopImage} onChange={(e) => setShopImage(e.target.value)} placeholder="Or paste image URL" className="mt-2" />
                </div>
                <Button onClick={saveShopHero} disabled={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Shop Settings
                </Button>
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
                  <Label>Title</Label>
                  <Input value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} placeholder="About Us" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={aboutDescription} onChange={(e) => setAboutDescription(e.target.value)} placeholder="Tell your story..." rows={5} />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <div className="flex gap-4">
                    {aboutImage && <img src={aboutImage} alt="About" className="w-32 h-20 object-cover rounded-lg" />}
                    <Button type="button" variant="outline" onClick={() => triggerUpload('about')} disabled={isUploading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading && uploadTarget === 'about' ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </div>
                  <Input value={aboutImage} onChange={(e) => setAboutImage(e.target.value)} placeholder="Or paste image URL" className="mt-2" />
                </div>
                <Button onClick={saveAbout} disabled={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save About Settings
                </Button>
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
                <Button onClick={saveContact} disabled={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Contact Settings
                </Button>
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
                <Button onClick={saveSocialMedia} disabled={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Social Media Links
                </Button>
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
                <Button onClick={saveFooter} disabled={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Footer Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
