import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Copy, CheckCircle2, Sparkles, Image as ImageIcon, RefreshCw, Trash2 } from 'lucide-react';

interface GeneratedPin {
  id: string;
  title: string;
  image_url: string | null;
  concept: string;
  pin_description: string;
  created_at: string;
}

const PIN_STYLES = [
  { value: 'modern-minimal', label: 'Modern Minimal' },
  { value: 'cozy-warm', label: 'Cozy & Warm' },
  { value: 'luxury-elegant', label: 'Luxury Elegant' },
  { value: 'boho-natural', label: 'Boho Natural' },
  { value: 'bold-colorful', label: 'Bold & Colorful' },
  { value: 'scandinavian', label: 'Scandinavian' },
  { value: 'vintage-retro', label: 'Vintage Retro' },
];

export default function AdminPinGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('modern-minimal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPins, setGeneratedPins] = useState<GeneratedPin[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('generated-pins') || '[]');
    } catch { return []; }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const savePins = (pins: GeneratedPin[]) => {
    setGeneratedPins(pins);
    localStorage.setItem('generated-pins', JSON.stringify(pins.slice(0, 50)));
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Enter a title for your pin.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pin-image', {
        body: { title: title.trim(), description: description.trim(), style },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newPin: GeneratedPin = {
        id: Date.now().toString(),
        title: title.trim(),
        image_url: data.image_url,
        concept: data.concept,
        pin_description: data.pin_description || data.concept,
        created_at: new Date().toISOString(),
      };

      savePins([newPin, ...generatedPins]);
      toast({ title: '✨ Pin Generated!', description: data.image_url ? 'Your pin image is ready.' : 'Pin concept generated. Image may need manual creation.' });
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyDescription = async (pin: GeneratedPin) => {
    await navigator.clipboard.writeText(pin.pin_description);
    setCopiedId(pin.id);
    toast({ title: 'Copied!', description: 'Pin description copied to clipboard.' });
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

  const handleDelete = (id: string) => {
    savePins(generatedPins.filter(p => p.id !== id));
    toast({ title: 'Deleted', description: 'Pin removed from history.' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E60023]/10">
            <svg className="w-6 h-6 text-[#E60023]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.627-.134-1.594.028-2.28.147-.627.946-4.012.946-4.012s-.241-.484-.241-1.199c0-1.123.652-1.962 1.462-1.962.69 0 1.023.518 1.023 1.139 0 .694-.442 1.732-.67 2.694-.19.805.404 1.462 1.199 1.462 1.439 0 2.544-1.517 2.544-3.703 0-1.936-1.392-3.29-3.38-3.29-2.302 0-3.654 1.727-3.654 3.513 0 .695.268 1.441.602 1.847a.242.242 0 0 1 .056.232c-.061.256-.199.805-.226.918-.035.147-.116.178-.268.107-1-.466-1.625-1.928-1.625-3.103 0-2.525 1.835-4.844 5.29-4.844 2.777 0 4.937 1.979 4.937 4.623 0 2.759-1.739 4.981-4.153 4.981-.811 0-1.573-.422-1.835-.92l-.499 1.902c-.181.695-.67 1.566-.997 2.097A12 12 0 1 0 12 0z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pinterest Pin Generator</h1>
            <p className="text-sm text-muted-foreground">AI-powered pin images & descriptions for your Pinterest marketing</p>
          </div>
        </div>

        {/* Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-[#E60023]" />
              Create New Pin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Pin Title *</label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 10 Cozy Living Room Ideas for Fall"
                className="text-base"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add extra context about your pin topic..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Visual Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIN_STYLES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !title.trim()}
              className="w-full bg-[#E60023] hover:bg-[#E60023]/90 text-white"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Pin...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Pin
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Pins Gallery */}
        {generatedPins.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Generated Pins ({generatedPins.length})</h2>
              {generatedPins.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { savePins([]); toast({ title: 'Cleared', description: 'All pins removed.' }); }}
                  className="text-destructive"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedPins.map(pin => (
                <Card key={pin.id} className="overflow-hidden group">
                  {/* Image */}
                  {pin.image_url ? (
                    <div className="relative aspect-[2/3] bg-muted">
                      <img
                        src={pin.image_url}
                        alt={pin.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(pin.image_url!, pin.title)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCopyDescription(pin)}
                          >
                            {copiedId === pin.id ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[2/3] bg-muted flex items-center justify-center">
                      <div className="text-center p-4">
                        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground">Concept only — no image generated</p>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{pin.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3">{pin.pin_description}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(pin.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopyDescription(pin)}
                          title="Copy description"
                        >
                          {copiedId === pin.id ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                        {pin.image_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDownload(pin.image_url!, pin.title)}
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          onClick={() => handleDelete(pin.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedPins.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <svg className="w-12 h-12 mx-auto text-[#E60023]/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.627-.134-1.594.028-2.28.147-.627.946-4.012.946-4.012s-.241-.484-.241-1.199c0-1.123.652-1.962 1.462-1.962.69 0 1.023.518 1.023 1.139 0 .694-.442 1.732-.67 2.694-.19.805.404 1.462 1.199 1.462 1.439 0 2.544-1.517 2.544-3.703 0-1.936-1.392-3.29-3.38-3.29-2.302 0-3.654 1.727-3.654 3.513 0 .695.268 1.441.602 1.847a.242.242 0 0 1 .056.232c-.061.256-.199.805-.226.918-.035.147-.116.178-.268.107-1-.466-1.625-1.928-1.625-3.103 0-2.525 1.835-4.844 5.29-4.844 2.777 0 4.937 1.979 4.937 4.623 0 2.759-1.739 4.981-4.153 4.981-.811 0-1.573-.422-1.835-.92l-.499 1.902c-.181.695-.67 1.566-.997 2.097A12 12 0 1 0 12 0z"/>
              </svg>
              <h3 className="font-semibold text-lg mb-1">No pins yet</h3>
              <p className="text-sm text-muted-foreground">Enter a title above and generate your first AI-powered Pinterest pin!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
