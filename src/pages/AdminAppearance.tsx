import { useState, useCallback, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  Palette, 
  Type, 
  Image as ImageIcon,
  Save,
  RefreshCw,
} from 'lucide-react';

interface BrandingSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
}

interface ColorSettings {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

interface TypographySettings {
  headingFont: string;
  bodyFont: string;
}

const defaultBranding: BrandingSettings = {
  siteName: 'Home & Decor',
  tagline: 'Curated Home Design & Lifestyle',
  logoUrl: '',
  faviconUrl: '',
};

const defaultColors: ColorSettings = {
  primaryColor: '#8B7355',
  accentColor: '#C4A77D',
  backgroundColor: '#FFFFFF',
  textColor: '#1A1A1A',
};

const defaultTypography: TypographySettings = {
  headingFont: 'Playfair Display',
  bodyFont: 'Inter',
};

const fontOptions = [
  'Inter',
  'Playfair Display',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Source Sans Pro',
  'Merriweather',
  'Georgia',
];

const AdminAppearance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();

  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [colors, setColors] = useState<ColorSettings>(defaultColors);
  const [typography, setTypography] = useState<TypographySettings>(defaultTypography);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings when data is available
  useEffect(() => {
    if (settings) {
      const brandingSetting = settings.find(s => s.key === 'branding');
      const colorsSetting = settings.find(s => s.key === 'colors');
      const typographySetting = settings.find(s => s.key === 'typography');

      if (brandingSetting?.value) {
        setBranding({ ...defaultBranding, ...(brandingSetting.value as unknown as BrandingSettings) });
      }
      if (colorsSetting?.value) {
        setColors({ ...defaultColors, ...(colorsSetting.value as unknown as ColorSettings) });
      }
      if (typographySetting?.value) {
        setTypography({ ...defaultTypography, ...(typographySetting.value as unknown as TypographySettings) });
      }
    }
  }, [settings]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
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
        const fileName = `${type}-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { error } = await supabase.storage
          .from('blog-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);

        if (type === 'logo') {
          setBranding(prev => ({ ...prev, logoUrl: urlData.publicUrl }));
        } else {
          setBranding(prev => ({ ...prev, faviconUrl: urlData.publicUrl }));
        }

        toast({
          title: 'Upload successful',
          description: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully.`,
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
    [toast]
  );

  const handleSaveBranding = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({ key: 'branding', value: branding });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Branding saved',
        description: 'Your branding settings have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save branding settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveColors = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({ key: 'colors', value: colors });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Colors saved',
        description: 'Your color settings have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save color settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTypography = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({ key: 'typography', value: typography });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Typography saved',
        description: 'Your typography settings have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save typography settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-medium">Appearance</h1>
          <p className="text-muted-foreground mt-1">
            Customize your site's branding, colors, and typography
          </p>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Typography
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>
                  Manage your site name, tagline, logo, and favicon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={branding.siteName}
                      onChange={(e) => setBranding(prev => ({ ...prev, siteName: e.target.value }))}
                      placeholder="Your Site Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={branding.tagline}
                      onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="Your site tagline"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label>Logo</Label>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center">
                      {branding.logoUrl ? (
                        <div className="space-y-3">
                          <img
                            src={branding.logoUrl}
                            alt="Logo"
                            className="max-h-20 mx-auto object-contain"
                          />
                          <input
                            type="file"
                            id="logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                            disabled={isUploading}
                          />
                          <label htmlFor="logo-upload">
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              disabled={isUploading}
                              asChild
                            >
                              <span>Change Logo</span>
                            </Button>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                          <div>
                            <input
                              type="file"
                              id="logo-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'logo')}
                              disabled={isUploading}
                            />
                            <label htmlFor="logo-upload">
                              <Button
                                variant="outline"
                                className="cursor-pointer"
                                disabled={isUploading}
                                asChild
                              >
                                <span>
                                  {isUploading ? 'Uploading...' : 'Upload Logo'}
                                </span>
                              </Button>
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Recommended: PNG or SVG, 200x50px
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div className="space-y-3">
                    <Label>Favicon</Label>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center">
                      {branding.faviconUrl ? (
                        <div className="space-y-3">
                          <img
                            src={branding.faviconUrl}
                            alt="Favicon"
                            className="h-12 w-12 mx-auto object-contain"
                          />
                          <input
                            type="file"
                            id="favicon-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'favicon')}
                            disabled={isUploading}
                          />
                          <label htmlFor="favicon-upload">
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              disabled={isUploading}
                              asChild
                            >
                              <span>Change Favicon</span>
                            </Button>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                          <div>
                            <input
                              type="file"
                              id="favicon-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'favicon')}
                              disabled={isUploading}
                            />
                            <label htmlFor="favicon-upload">
                              <Button
                                variant="outline"
                                className="cursor-pointer"
                                disabled={isUploading}
                                asChild
                              >
                                <span>
                                  {isUploading ? 'Uploading...' : 'Upload Favicon'}
                                </span>
                              </Button>
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Recommended: PNG, 32x32px or 64x64px
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveBranding} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Branding'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
                <CardDescription>
                  Customize your site's color palette
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        id="primaryColor"
                        value={colors.primaryColor}
                        onChange={(e) => setColors(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={colors.primaryColor}
                        onChange={(e) => setColors(prev => ({ ...prev, primaryColor: e.target.value }))}
                        placeholder="#8B7355"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used for buttons, links, and accents
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        id="accentColor"
                        value={colors.accentColor}
                        onChange={(e) => setColors(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={colors.accentColor}
                        onChange={(e) => setColors(prev => ({ ...prev, accentColor: e.target.value }))}
                        placeholder="#C4A77D"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used for highlights and secondary elements
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        id="backgroundColor"
                        value={colors.backgroundColor}
                        onChange={(e) => setColors(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={colors.backgroundColor}
                        onChange={(e) => setColors(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        placeholder="#FFFFFF"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Main background color
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        id="textColor"
                        value={colors.textColor}
                        onChange={(e) => setColors(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={colors.textColor}
                        onChange={(e) => setColors(prev => ({ ...prev, textColor: e.target.value }))}
                        placeholder="#1A1A1A"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Main text color
                    </p>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="border rounded-xl p-6" style={{ backgroundColor: colors.backgroundColor }}>
                  <h3 className="font-display text-xl mb-2" style={{ color: colors.textColor }}>
                    Preview
                  </h3>
                  <p className="mb-4" style={{ color: colors.textColor }}>
                    This is how your colors will look together.
                  </p>
                  <div className="flex gap-3">
                    <Button style={{ backgroundColor: colors.primaryColor, color: '#fff' }}>
                      Primary Button
                    </Button>
                    <Button variant="outline" style={{ borderColor: colors.accentColor, color: colors.accentColor }}>
                      Accent Button
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveColors} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Colors'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography">
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>
                  Choose fonts for headings and body text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="headingFont">Heading Font</Label>
                    <select
                      id="headingFont"
                      value={typography.headingFont}
                      onChange={(e) => setTypography(prev => ({ ...prev, headingFont: e.target.value }))}
                      className="w-full h-10 px-3 border rounded-md bg-background"
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Used for titles and headings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bodyFont">Body Font</Label>
                    <select
                      id="bodyFont"
                      value={typography.bodyFont}
                      onChange={(e) => setTypography(prev => ({ ...prev, bodyFont: e.target.value }))}
                      className="w-full h-10 px-3 border rounded-md bg-background"
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Used for paragraphs and body text
                    </p>
                  </div>
                </div>

                {/* Typography Preview */}
                <div className="border rounded-xl p-6">
                  <h3 
                    className="text-2xl mb-3" 
                    style={{ fontFamily: `"${typography.headingFont}", serif` }}
                  >
                    Heading Preview
                  </h3>
                  <p style={{ fontFamily: `"${typography.bodyFont}", sans-serif` }}>
                    This is how your body text will look. The quick brown fox jumps over the lazy dog. 
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveTypography} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Typography'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAppearance;
