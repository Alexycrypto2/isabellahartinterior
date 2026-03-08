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
import { Save, Upload, Home, Info, Mail, FileText, Share2, Bell, Settings2, Bot, Eye, EyeOff, ImageIcon, TrendingUp, BarChart3, Zap, Loader2, CheckCircle2, XCircle, Gift, Heart, Star, Sparkles, Tag, Percent, Megaphone, PartyPopper, Plus, Trash2, FlaskConical } from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'Gift', label: 'Gift', icon: Gift },
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'Star', label: 'Star', icon: Star },
  { value: 'Sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'Tag', label: 'Tag', icon: Tag },
  { value: 'Percent', label: 'Percent', icon: Percent },
  { value: 'Megaphone', label: 'Megaphone', icon: Megaphone },
  { value: 'PartyPopper', label: 'Party', icon: PartyPopper },
  { value: 'Bell', label: 'Bell', icon: Bell },
  { value: 'Zap', label: 'Zap', icon: Zap },
] as const;

const getIconComponent = (name: string) => {
  return ICON_OPTIONS.find(i => i.value === name)?.icon || Gift;
};
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
  const [notificationEmail, setNotificationEmail] = useState('');
  const [contactReplyEmail, setContactReplyEmail] = useState('');

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

  // AI priority toggle
  const [aiPriority, setAiPriority] = useState<'custom' | 'lovable'>('custom');

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

  // AI test states
  const [testingText, setTestingText] = useState(false);
  const [testingImage, setTestingImage] = useState(false);
  const [testingBuiltIn, setTestingBuiltIn] = useState(false);
  const [textTestResult, setTextTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [imageTestResult, setImageTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [builtInTestResult, setBuiltInTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Affiliate alert settings
  const [alertThreshold, setAlertThreshold] = useState(10);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [alertEmail, setAlertEmail] = useState('');

  // Weekly digest settings
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestEmail, setDigestEmail] = useState('');

  // Exit intent popup settings
  const [exitTitle, setExitTitle] = useState("Wait! Don't Leave Yet");
  const [exitDescription, setExitDescription] = useState('Get our <strong>Free Room Styling Guide</strong> — packed with pro tips to transform any space into a magazine-worthy room.');
  const [exitButtonText, setExitButtonText] = useState('Get My Free Guide');
  const [exitPlaceholder, setExitPlaceholder] = useState('Enter your email address');
  const [exitDisclaimer, setExitDisclaimer] = useState('No spam, ever. Unsubscribe anytime.');
  const [exitEnabled, setExitEnabled] = useState(true);
  const [exitIcon, setExitIcon] = useState('Gift');
  const [exitGradientFrom, setExitGradientFrom] = useState('#8B5CF6');
  const [exitGradientTo, setExitGradientTo] = useState('#D946EF');
  const [exitAbEnabled, setExitAbEnabled] = useState(false);
  const [exitVariants, setExitVariants] = useState<Array<{
    id: string;
    name: string;
    title: string;
    description: string;
    button_text: string;
    weight: number;
  }>>([]);

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
      setNotificationEmail(contact.notification_email || '');
      setContactReplyEmail(contact.reply_email || '');
      
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
      setAiPriority(ai.priority || 'custom');
      setAiTextProvider(ai.text_provider || ai.provider || 'openai');
      setAiTextKey(ai.text_api_key || ai.api_key || '');
      setAiTextModel(ai.text_model || ai.model || '');
      setAiTextEndpoint(ai.text_endpoint || '');
      setAiImageProvider(ai.image_provider || 'openai');
      setAiImageKey(ai.image_api_key || '');
      setAiImageModel(ai.image_model || '');
      setAiImageEndpoint(ai.image_endpoint || '');

      // Affiliate alerts
      const alerts = getSetting('affiliate_alerts') as Record<string, any>;
      setAlertThreshold(alerts.threshold ?? 10);
      setAlertEnabled(alerts.enabled ?? true);
      setAlertEmail(alerts.email || '');

      // Weekly digest
      const digest = getSetting('weekly_digest') as Record<string, any>;
      setDigestEnabled(digest.enabled ?? true);
      setDigestEmail(digest.email || '');

      // Exit intent popup
      const exitPopup = getSetting('exit_intent_popup') as Record<string, any>;
      setExitTitle(exitPopup.title || "Wait! Don't Leave Yet");
      setExitDescription(exitPopup.description || 'Get our <strong>Free Room Styling Guide</strong> — packed with pro tips to transform any space into a magazine-worthy room.');
      setExitButtonText(exitPopup.button_text || 'Get My Free Guide');
      setExitPlaceholder(exitPopup.placeholder || 'Enter your email address');
      setExitDisclaimer(exitPopup.disclaimer || 'No spam, ever. Unsubscribe anytime.');
      setExitEnabled(exitPopup.enabled ?? true);
      setExitIcon(exitPopup.icon || 'Gift');
      setExitGradientFrom(exitPopup.gradient_from || '#8B5CF6');
      setExitGradientTo(exitPopup.gradient_to || '#D946EF');
      setExitAbEnabled(exitPopup.ab_enabled ?? false);
      setExitVariants(exitPopup.variants || []);
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
        value: {
          email: contactEmail,
          phone: contactPhone,
          address: contactAddress,
          notification_email: notificationEmail || null,
          reply_email: contactReplyEmail || null,
        },
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
          priority: aiPriority,
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
      case 'google': return 'gemini-2.0-flash-exp';
      case 'custom': return '';
      default: return '';
    }
  };

  const getDefaultTextEndpoint = (provider: string, model?: string) => {
    switch (provider) {
      case 'google': {
        const m = model || 'gemini-2.0-flash';
        return `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`;
      }
      case 'openai': return 'https://api.openai.com/v1/chat/completions';
      case 'anthropic': return 'https://api.anthropic.com/v1/messages';
      default: return '';
    }
  };

  const getDefaultImageEndpoint = (provider: string, model?: string) => {
    switch (provider) {
      case 'google': {
        const m = model || 'gemini-2.0-flash-exp';
        return `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`;
      }
      case 'openai': return 'https://api.openai.com/v1/images/generations';
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

  const testBuiltInCredits = async () => {
    setTestingBuiltIn(true);
    setBuiltInTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('home-decor-chat', {
        body: { messages: [{ role: 'user', content: 'Say OK' }] },
      });

      // If we get a streaming response or data back, credits are working
      if (error) {
        const errMsg = typeof error === 'object' && 'message' in error ? (error as any).message : String(error);
        if (errMsg.includes('402') || errMsg.includes('Payment')) {
          setBuiltInTestResult({ success: false, message: 'Built-in AI credits exhausted. Configure fallback keys below.' });
        } else if (errMsg.includes('429') || errMsg.includes('Rate')) {
          setBuiltInTestResult({ success: false, message: 'Rate limited. Try again in a minute.' });
        } else {
          setBuiltInTestResult({ success: false, message: errMsg });
        }
      } else {
        setBuiltInTestResult({ success: true, message: 'Built-in AI credits are active and working!' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Test failed';
      if (msg.includes('402') || msg.includes('Payment')) {
        setBuiltInTestResult({ success: false, message: 'Built-in AI credits exhausted. Configure fallback keys below.' });
      } else {
        setBuiltInTestResult({ success: false, message: msg });
      }
    } finally {
      setTestingBuiltIn(false);
    }
  };

  const testAiKey = async (type: 'text' | 'image') => {
    const isText = type === 'text';
    const provider = isText ? aiTextProvider : aiImageProvider;
    const apiKey = isText ? aiTextKey : aiImageKey;
    const model = isText ? aiTextModel : aiImageModel;
    const endpoint = isText ? aiTextEndpoint : aiImageEndpoint;

    if (!apiKey) {
      toast({ title: 'No API key', description: 'Enter an API key first.', variant: 'destructive' });
      return;
    }

    if (isText) { setTestingText(true); setTextTestResult(null); }
    else { setTestingImage(true); setImageTestResult(null); }

    try {
      const { data, error } = await supabase.functions.invoke('test-ai-key', {
        body: { type, provider, api_key: apiKey, model, endpoint },
      });

      if (error) throw error;

      const result = { success: data.success, message: data.success ? data.message : data.error };
      if (isText) setTextTestResult(result);
      else setImageTestResult(result);

      toast({
        title: data.success ? '✅ Connection successful' : '❌ Connection failed',
        description: data.success ? data.message : data.error,
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Test failed';
      const result = { success: false, message: msg };
      if (isText) setTextTestResult(result);
      else setImageTestResult(result);
      toast({ title: 'Test failed', description: msg, variant: 'destructive' });
    } finally {
      if (isText) setTestingText(false);
      else setTestingImage(false);
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
              <TabsTrigger value="alerts" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <TrendingUp className="h-3.5 w-3.5" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="digest" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <BarChart3 className="h-3.5 w-3.5" />
                Digest
              </TabsTrigger>
              <TabsTrigger value="exit-popup" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap">
                <Gift className="h-3.5 w-3.5" />
                Exit Popup
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
                  <Label className="text-sm font-medium">Display Email</Label>
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@example.com" />
                  <p className="text-xs text-muted-foreground">Shown on the contact page for visitors</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Notification Email</Label>
                  <Input value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} placeholder="Leave empty to use display email" />
                  <p className="text-xs text-muted-foreground">Where all system emails go — contact form submissions, trending alerts, weekly digest</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Reply-To Email</Label>
                  <Input value={contactReplyEmail} onChange={(e) => setContactReplyEmail(e.target.value)} placeholder="Leave empty to use display email" />
                  <p className="text-xs text-muted-foreground">When customers reply to the contact form confirmation, it goes to this address</p>
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
                    Choose which AI provider to use by default — your own API keys or built-in credits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Priority Toggle */}
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">AI Provider Priority</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {aiPriority === 'custom' 
                            ? 'Your API keys are used first. Built-in credits are the fallback.' 
                            : 'Built-in credits are used first. Your API keys are the fallback.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${aiPriority === 'custom' ? 'text-foreground' : 'text-muted-foreground'}`}>My API</span>
                        <button
                          onClick={() => setAiPriority(aiPriority === 'custom' ? 'lovable' : 'custom')}
                          aria-label={`Switch to ${aiPriority === 'custom' ? 'built-in credits' : 'custom API'} priority`}
                          className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          style={{ backgroundColor: aiPriority === 'lovable' ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
                        >
                          <span
                            className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-md ring-0 transition-transform duration-300 ease-in-out"
                            style={{ transform: aiPriority === 'lovable' ? 'translateX(22px)' : 'translateX(4px)' }}
                          />
                        </button>
                        <span className={`text-xs font-medium ${aiPriority === 'lovable' ? 'text-foreground' : 'text-muted-foreground'}`}>Built-in</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={testBuiltInCredits}
                      disabled={testingBuiltIn}
                      className="w-full"
                    >
                      {testingBuiltIn ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking built-in credits...</>
                      ) : (
                        <><Bot className="mr-2 h-4 w-4" />Test Built-in AI Credits</>
                      )}
                    </Button>
                    {builtInTestResult && (
                      <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${builtInTestResult.success ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'}`}>
                        {builtInTestResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-amber-500 shrink-0" />}
                        <span className={`text-sm ${builtInTestResult.success ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>{builtInTestResult.message}</span>
                      </div>
                    )}
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
                    <Select value={aiTextProvider} onValueChange={(val) => { setAiTextProvider(val); const m = getDefaultTextModel(val); setAiTextModel(m); setAiTextEndpoint(val !== 'custom' ? getDefaultTextEndpoint(val, m) : ''); }}>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">API Endpoint URL</Label>
                    <Input value={aiTextEndpoint} onChange={(e) => setAiTextEndpoint(e.target.value)} placeholder={getDefaultTextEndpoint(aiTextProvider)} readOnly={aiTextProvider !== 'custom'} className={aiTextProvider !== 'custom' ? 'bg-muted/50' : ''} />
                    <p className="text-xs text-muted-foreground">{aiTextProvider === 'custom' ? 'Must be OpenAI-compatible (e.g. Groq, Mistral, Together AI, Ollama, LM Studio)' : 'Auto-filled based on provider and model'}</p>
                  </div>
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
                  <div className="space-y-3">
                    {aiTextKey && (
                      <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm text-emerald-700 dark:text-emerald-400">Text AI fallback configured</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => testAiKey('text')}
                      disabled={testingText || !aiTextKey}
                      className="w-full"
                    >
                      {testingText ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Testing connection...</>
                      ) : (
                        <><Zap className="mr-2 h-4 w-4" />Test Text AI Connection</>
                      )}
                    </Button>
                    {textTestResult && (
                      <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${textTestResult.success ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-destructive/10 border-destructive/30'}`}>
                        {textTestResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                        <span className={`text-sm ${textTestResult.success ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}>{textTestResult.message}</span>
                      </div>
                    )}
                  </div>
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
                    <Select value={aiImageProvider} onValueChange={(val) => { setAiImageProvider(val); const m = getDefaultImageModel(val); setAiImageModel(m); setAiImageEndpoint(val !== 'custom' ? getDefaultImageEndpoint(val, m) : ''); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI (DALL·E)</SelectItem>
                        <SelectItem value="google">Google (Gemini)</SelectItem>
                        <SelectItem value="custom">Custom (OpenAI-compatible)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">API Endpoint URL</Label>
                    <Input value={aiImageEndpoint} onChange={(e) => setAiImageEndpoint(e.target.value)} placeholder={getDefaultImageEndpoint(aiImageProvider)} readOnly={aiImageProvider !== 'custom'} className={aiImageProvider !== 'custom' ? 'bg-muted/50' : ''} />
                    <p className="text-xs text-muted-foreground">{aiImageProvider === 'custom' ? 'Must be OpenAI-compatible image generation endpoint' : 'Auto-filled based on provider and model'}</p>
                  </div>
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
                  <div className="space-y-3">
                    {aiImageKey && (
                      <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm text-emerald-700 dark:text-emerald-400">Image AI fallback configured</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => testAiKey('image')}
                      disabled={testingImage || !aiImageKey}
                      className="w-full"
                    >
                      {testingImage ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Testing connection...</>
                      ) : (
                        <><Zap className="mr-2 h-4 w-4" />Test Image AI Connection</>
                      )}
                    </Button>
                    {imageTestResult && (
                      <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${imageTestResult.success ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-destructive/10 border-destructive/30'}`}>
                        {imageTestResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                        <span className={`text-sm ${imageTestResult.success ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}>{imageTestResult.message}</span>
                      </div>
                    )}
                  </div>
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

          {/* Affiliate Alerts */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Trending Products Alerts</CardTitle>
                <CardDescription>Get notified when affiliate clicks exceed a daily threshold</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Alerts</Label>
                    <p className="text-xs text-muted-foreground">Send email when products trend above threshold</p>
                  </div>
                  <Switch checked={alertEnabled} onCheckedChange={setAlertEnabled} />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Daily Click Threshold</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[alertThreshold]}
                      onValueChange={([v]) => setAlertThreshold(v)}
                      min={1}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-right">{alertThreshold}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Alert when any product gets more than {alertThreshold} affiliate clicks in a day
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Alert Email (optional)</Label>
                  <Input
                    type="email"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder="Leave empty to use contact email"
                  />
                  <p className="text-xs text-muted-foreground">Override the default contact email for alert notifications</p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={async () => {
                      try {
                        await updateMutation.mutateAsync({
                          key: 'affiliate_alerts',
                          value: {
                            enabled: alertEnabled,
                            threshold: alertThreshold,
                            email: alertEmail || null,
                          },
                        });
                        toast({ title: 'Saved', description: 'Alert settings updated successfully.' });
                      } catch (error) {
                        toast({ title: 'Error', description: 'Failed to save alert settings.', variant: 'destructive' });
                      }
                    }}
                    disabled={updateMutation.isPending}
                    className="rounded-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Alert Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Digest */}
          <TabsContent value="digest">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance Digest</CardTitle>
                <CardDescription>Receive a summary of top products and blog posts every Monday at 9 AM UTC</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Weekly Digest</Label>
                    <p className="text-xs text-muted-foreground">Send a performance summary email every Monday</p>
                  </div>
                  <Switch checked={digestEnabled} onCheckedChange={setDigestEnabled} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Digest Email (optional)</Label>
                  <Input
                    type="email"
                    value={digestEmail}
                    onChange={(e) => setDigestEmail(e.target.value)}
                    placeholder="Leave empty to use contact email"
                  />
                  <p className="text-xs text-muted-foreground">Override the default contact email for digest notifications</p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={async () => {
                      try {
                        await updateMutation.mutateAsync({
                          key: 'weekly_digest',
                          value: {
                            enabled: digestEnabled,
                            email: digestEmail || null,
                          },
                        });
                        toast({ title: 'Saved', description: 'Digest settings updated successfully.' });
                      } catch (error) {
                        toast({ title: 'Error', description: 'Failed to save digest settings.', variant: 'destructive' });
                      }
                    }}
                    disabled={updateMutation.isPending}
                    className="rounded-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Digest Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exit Intent Popup */}
          <TabsContent value="exit-popup">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exit Intent Popup</CardTitle>
                  <CardDescription>Customize the popup that appears when visitors are about to leave your site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enable Exit Popup</Label>
                      <p className="text-xs text-muted-foreground">Show the popup when visitors move to leave</p>
                    </div>
                    <Switch checked={exitEnabled} onCheckedChange={setExitEnabled} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Title</Label>
                    <Input value={exitTitle} onChange={(e) => setExitTitle(e.target.value)} placeholder="Wait! Don't Leave Yet" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea value={exitDescription} onChange={(e) => setExitDescription(e.target.value)} placeholder="Get our Free Room Styling Guide..." rows={3} />
                    <p className="text-xs text-muted-foreground">You can use &lt;strong&gt;bold text&lt;/strong&gt; for emphasis</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email Placeholder</Label>
                    <Input value={exitPlaceholder} onChange={(e) => setExitPlaceholder(e.target.value)} placeholder="Enter your email address" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Button Text</Label>
                    <Input value={exitButtonText} onChange={(e) => setExitButtonText(e.target.value)} placeholder="Get My Free Guide" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Disclaimer Text</Label>
                    <Input value={exitDisclaimer} onChange={(e) => setExitDisclaimer(e.target.value)} placeholder="No spam, ever. Unsubscribe anytime." />
                  </div>

                  {/* Icon Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Popup Icon</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {ICON_OPTIONS.map((opt) => {
                        const IconComp = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setExitIcon(opt.value)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                              exitIcon === opt.value
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <IconComp className="h-5 w-5" />
                            <span className="text-xs">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gradient Colors */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Background Gradient</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">From Color</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={exitGradientFrom}
                            onChange={(e) => setExitGradientFrom(e.target.value)}
                            className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                          />
                          <Input
                            value={exitGradientFrom}
                            onChange={(e) => setExitGradientFrom(e.target.value)}
                            placeholder="#8B5CF6"
                            className="flex-1 text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">To Color</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={exitGradientTo}
                            onChange={(e) => setExitGradientTo(e.target.value)}
                            className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                          />
                          <Input
                            value={exitGradientTo}
                            onChange={(e) => setExitGradientTo(e.target.value)}
                            placeholder="#D946EF"
                            className="flex-1 text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Preview</Label>
                    <div
                      className="border border-border rounded-lg p-6 text-center"
                      style={{
                        background: `linear-gradient(135deg, ${exitGradientFrom}15, transparent, ${exitGradientTo}15)`,
                      }}
                    >
                      <div
                        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${exitGradientFrom}20` }}
                      >
                        {(() => {
                          const IconComp = getIconComponent(exitIcon);
                          return <IconComp className="h-6 w-6" style={{ color: exitGradientFrom }} />;
                        })()}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{exitTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: exitDescription }} />
                      <div className="max-w-xs mx-auto space-y-2">
                        <Input disabled placeholder={exitPlaceholder} className="bg-background text-sm" />
                        <Button disabled className="w-full text-sm" style={{ backgroundColor: exitGradientFrom }}>{exitButtonText}</Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">{exitDisclaimer}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <Button
                      onClick={async () => {
                        try {
                          await updateMutation.mutateAsync({
                            key: 'exit_intent_popup',
                            value: {
                              enabled: exitEnabled,
                              title: exitTitle,
                              description: exitDescription,
                              button_text: exitButtonText,
                              placeholder: exitPlaceholder,
                              disclaimer: exitDisclaimer,
                              icon: exitIcon,
                              gradient_from: exitGradientFrom,
                              gradient_to: exitGradientTo,
                              ab_enabled: exitAbEnabled,
                              variants: exitVariants,
                            },
                          });
                          toast({ title: 'Saved', description: 'Exit popup settings updated successfully.' });
                        } catch (error) {
                          toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
                        }
                      }}
                      disabled={updateMutation.isPending}
                      className="rounded-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Exit Popup Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* A/B Testing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    A/B Testing
                  </CardTitle>
                  <CardDescription>Create multiple copy variants and compare conversion rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enable A/B Testing</Label>
                      <p className="text-xs text-muted-foreground">When enabled, visitors will randomly see different copy variants</p>
                    </div>
                    <Switch checked={exitAbEnabled} onCheckedChange={setExitAbEnabled} />
                  </div>

                  {exitAbEnabled && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        The default copy above serves as <strong>Variant A (Control)</strong>. Add additional variants below to test against it.
                      </p>

                      {exitVariants.map((variant, idx) => (
                        <div key={variant.id} className="border border-border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold">Variant {String.fromCharCode(66 + idx)}: {variant.name}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExitVariants(exitVariants.filter(v => v.id !== variant.id))}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Variant Name</Label>
                            <Input
                              value={variant.name}
                              onChange={(e) => {
                                const updated = [...exitVariants];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                setExitVariants(updated);
                              }}
                              placeholder="e.g. Urgency variant"
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={variant.title}
                              onChange={(e) => {
                                const updated = [...exitVariants];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setExitVariants(updated);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={variant.description}
                              onChange={(e) => {
                                const updated = [...exitVariants];
                                updated[idx] = { ...updated[idx], description: e.target.value };
                                setExitVariants(updated);
                              }}
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Button Text</Label>
                            <Input
                              value={variant.button_text}
                              onChange={(e) => {
                                const updated = [...exitVariants];
                                updated[idx] = { ...updated[idx], button_text: e.target.value };
                                setExitVariants(updated);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Traffic Weight (%)</Label>
                            <div className="flex items-center gap-3">
                              <Slider
                                value={[variant.weight]}
                                onValueChange={([val]) => {
                                  const updated = [...exitVariants];
                                  updated[idx] = { ...updated[idx], weight: val };
                                  setExitVariants(updated);
                                }}
                                max={100}
                                min={5}
                                step={5}
                                className="flex-1"
                              />
                              <span className="text-sm font-mono w-12 text-right">{variant.weight}%</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {exitVariants.length < 3 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setExitVariants([
                              ...exitVariants,
                              {
                                id: crypto.randomUUID(),
                                name: `Variant ${String.fromCharCode(66 + exitVariants.length)}`,
                                title: exitTitle,
                                description: exitDescription,
                                button_text: exitButtonText,
                                weight: 50,
                              },
                            ]);
                          }}
                          className="w-full rounded-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Variant ({exitVariants.length + 1}/4 total)
                        </Button>
                      )}

                      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                        <strong>Traffic split:</strong> Control (A) gets{' '}
                        {Math.max(0, 100 - exitVariants.reduce((sum, v) => sum + v.weight, 0))}%
                        {exitVariants.map((v, i) => (
                          <span key={v.id}> · {String.fromCharCode(66 + i)} gets {v.weight}%</span>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
