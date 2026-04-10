import { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Loader2, Download, Copy, CheckCircle2, Sparkles, Image as ImageIcon,
  Trash2, Upload, X, History, ChevronDown, Wand2, Palette, Maximize,
  Clock, LayoutGrid, ImagePlus, Zap
} from 'lucide-react';

interface GeneratedPin {
  id: string;
  title: string;
  image_url: string | null;
  pin_description: string;
  dimensions: string;
  style: string;
  created_at: string;
}

const PIN_STYLES = [
  { value: 'modern-minimal', label: '✨ Modern Minimal', color: 'from-gray-100 to-white' },
  { value: 'cozy-warm', label: '🕯️ Cozy & Warm', color: 'from-amber-100 to-orange-50' },
  { value: 'luxury-elegant', label: '👑 Luxury Elegant', color: 'from-yellow-100 to-amber-50' },
  { value: 'boho-natural', label: '🌿 Boho Natural', color: 'from-green-100 to-emerald-50' },
  { value: 'bold-colorful', label: '🎨 Bold & Colorful', color: 'from-pink-100 to-purple-50' },
  { value: 'scandinavian', label: '🏔️ Scandinavian', color: 'from-blue-50 to-slate-50' },
  { value: 'vintage-retro', label: '📻 Vintage Retro', color: 'from-rose-100 to-amber-50' },
  { value: 'dark-moody', label: '🌙 Dark & Moody', color: 'from-gray-800 to-gray-900' },
  { value: 'tropical', label: '🌴 Tropical', color: 'from-emerald-100 to-teal-50' },
  { value: 'industrial', label: '🏗️ Industrial', color: 'from-stone-200 to-zinc-100' },
];

const PIN_SIZES = [
  { value: '1000x1500', label: 'Pinterest Standard', desc: '1000×1500 (2:3)', icon: '📌' },
  { value: '1000x1000', label: 'Square Pin', desc: '1000×1000 (1:1)', icon: '⬜' },
  { value: '600x900', label: 'Story Pin', desc: '600×900 (2:3)', icon: '📱' },
  { value: '1080x1920', label: 'Instagram Story', desc: '1080×1920 (9:16)', icon: '📸' },
  { value: '1080x1350', label: 'Instagram Portrait', desc: '1080×1350 (4:5)', icon: '🖼️' },
  { value: '1080x1080', label: 'Instagram Square', desc: '1080×1080 (1:1)', icon: '📷' },
  { value: '1200x628', label: 'Facebook/OG', desc: '1200×628 (≈2:1)', icon: '👍' },
  { value: 'custom', label: 'Custom Size', desc: 'Enter your own', icon: '✏️' },
];

export default function AdminPinGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('modern-minimal');
  const [sizePreset, setSizePreset] = useState('1000x1500');
  const [customWidth, setCustomWidth] = useState('1000');
  const [customHeight, setCustomHeight] = useState('1500');
  const [isGenerating, setIsGenerating] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [generatedPins, setGeneratedPins] = useState<GeneratedPin[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('create');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load history from database
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('pin_generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) {
      setGeneratedPins(data.map((p: any) => ({
        id: p.id,
        title: p.title,
        image_url: p.image_url,
        pin_description: p.pin_description || '',
        dimensions: p.dimensions || '1000x1500',
        style: p.style || 'modern-minimal',
        created_at: p.created_at,
      })));
    }
  };

  const getDimensions = () => {
    if (sizePreset === 'custom') return `${customWidth}x${customHeight}`;
    return sizePreset;
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 10MB', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setReferenceImage(base64);
      setReferencePreview(base64);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pin-image', {
        body: {
          title: title.trim(),
          description: description.trim(),
          style,
          dimensions: getDimensions(),
          referenceImageBase64: referenceImage,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: '✨ Pin Generated!',
        description: data.image_url ? 'Your AI pin is ready to download.' : 'Description generated. Image may need retry.',
      });

      loadHistory();
      setActiveTab('gallery');
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: 'Copied!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (url: string, title: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `pin-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('pin_generations').delete().eq('id', id);
    setGeneratedPins(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Deleted' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E60023] via-[#c4001e] to-[#8b0015] p-6 md:p-8 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2Mmgtdjl6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Pin Studio</h1>
                  <p className="text-white/70 text-sm">Powered by Gemini AI • Create stunning pins in seconds</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {['AI Image Generation', 'Custom Sizes', 'Product Image Upload', 'SEO Descriptions'].map(f => (
                  <span key={f} className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-3 py-2">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">{generatedPins.length} pins created</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'create' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImagePlus className="w-4 h-4" />
            Create Pin
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'gallery' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Gallery ({generatedPins.length})
          </button>
        </div>

        {/* CREATE TAB */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Title & Description */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#E60023]" />
                      Pin Title *
                    </label>
                    <Input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. 10 Cozy Living Room Ideas for Fall 2026"
                      className="text-base h-12 border-2 focus:border-[#E60023]/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Prompt / Description</label>
                    <Textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe what you want the AI to create. Be specific about colors, mood, elements..."
                      rows={4}
                      className="border-2 focus:border-[#E60023]/50 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Reference Image Upload */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#E60023]" />
                    Reference / Product Image (Optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {referencePreview ? (
                    <div className="relative group">
                      <img
                        src={referencePreview}
                        alt="Reference"
                        className="w-full max-h-64 object-contain rounded-xl border-2 border-dashed border-[#E60023]/30 bg-muted/30"
                      />
                      <button
                        onClick={() => { setReferenceImage(null); setReferencePreview(null); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#E60023]/50 hover:bg-[#E60023]/5 transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                      <span className="text-sm text-muted-foreground">Drop a product image here or click to upload</span>
                      <span className="text-xs text-muted-foreground/50">The AI will use this as reference for the pin design</span>
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Style & Size */}
            <div className="space-y-5">
              {/* Style Picker */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#E60023]" />
                    Visual Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PIN_STYLES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setStyle(s.value)}
                        className={`text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all border-2 ${
                          style === s.value
                            ? 'border-[#E60023] bg-[#E60023]/10 text-foreground shadow-sm'
                            : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Size Picker */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                    <Maximize className="w-4 h-4 text-[#E60023]" />
                    Pin Size
                  </label>
                  <div className="space-y-2">
                    {PIN_SIZES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setSizePreset(s.value)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all border-2 flex items-center gap-3 ${
                          sizePreset === s.value
                            ? 'border-[#E60023] bg-[#E60023]/10 shadow-sm'
                            : 'border-transparent bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <span className="text-lg">{s.icon}</span>
                        <div>
                          <div className="font-medium text-xs">{s.label}</div>
                          <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {sizePreset === 'custom' && (
                    <div className="flex gap-2 mt-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Width</label>
                        <Input
                          type="number"
                          value={customWidth}
                          onChange={e => setCustomWidth(e.target.value)}
                          className="h-9"
                          min="200" max="4000"
                        />
                      </div>
                      <div className="flex items-end pb-1 text-muted-foreground">×</div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Height</label>
                        <Input
                          type="number"
                          value={customHeight}
                          onChange={e => setCustomHeight(e.target.value)}
                          className="h-9"
                          min="200" max="4000"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !title.trim()}
                className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#E60023] to-[#c4001e] hover:from-[#c4001e] hover:to-[#E60023] text-white shadow-lg shadow-[#E60023]/25 rounded-xl"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating your pin...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Pin
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div>
            {generatedPins.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#E60023]/10 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-[#E60023]/50" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">No pins yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">Create your first AI-powered pin!</p>
                  <Button onClick={() => setActiveTab('create')} variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" /> Create Pin
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {generatedPins.map(pin => (
                  <Card key={pin.id} className="overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
                    {pin.image_url ? (
                      <div className="relative bg-muted aspect-[2/3]">
                        <img
                          src={pin.image_url}
                          alt={pin.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                          <div className="flex gap-2 w-full">
                            <Button
                              size="sm"
                              onClick={() => handleDownload(pin.image_url!, pin.title)}
                              className="flex-1 bg-white text-black hover:bg-white/90 rounded-xl h-10"
                            >
                              <Download className="h-4 w-4 mr-1" /> Download
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(pin.pin_description, pin.id)}
                              className="bg-white/20 text-white hover:bg-white/30 rounded-xl h-10 px-3"
                            >
                              {copiedId === pin.id ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(pin.id)}
                              className="bg-red-500/20 text-white hover:bg-red-500/40 rounded-xl h-10 px-3"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Size badge */}
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur rounded-lg text-[10px] text-white font-mono">
                          {pin.dimensions}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[2/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <div className="text-center p-4">
                          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-xs text-muted-foreground">Text only</p>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-bold text-sm line-clamp-2">{pin.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{pin.pin_description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(pin.created_at).toLocaleDateString()}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full capitalize">{pin.style?.replace('-', ' ')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
