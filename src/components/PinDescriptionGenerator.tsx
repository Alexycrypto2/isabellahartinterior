import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Copy, CheckCircle2 } from 'lucide-react';

interface PinDescriptionGeneratorProps {
  title: string;
  description: string;
  category?: string;
  price?: string;
  type: 'blog' | 'product';
}

const PinDescriptionGenerator = ({ title, description, category, price, type }: PinDescriptionGeneratorProps) => {
  const [pinDescription, setPinDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!title || !description) {
      toast({ title: 'Missing content', description: 'Add a title and description first.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pin-description', {
        body: { title, description: description.slice(0, 1000), category, price, type },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPinDescription(data.pin_description);
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pinDescription);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Pin description copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-[#E60023]/5 border-[#E60023]/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#E60023]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.627-.134-1.594.028-2.28.147-.627.946-4.012.946-4.012s-.241-.484-.241-1.199c0-1.123.652-1.962 1.462-1.962.69 0 1.023.518 1.023 1.139 0 .694-.442 1.732-.67 2.694-.19.805.404 1.462 1.199 1.462 1.439 0 2.544-1.517 2.544-3.703 0-1.936-1.392-3.29-3.38-3.29-2.302 0-3.654 1.727-3.654 3.513 0 .695.268 1.441.602 1.847a.242.242 0 0 1 .056.232c-.061.256-.199.805-.226.918-.035.147-.116.178-.268.107-1-.466-1.625-1.928-1.625-3.103 0-2.525 1.835-4.844 5.29-4.844 2.777 0 4.937 1.979 4.937 4.623 0 2.759-1.739 4.981-4.153 4.981-.811 0-1.573-.422-1.835-.92l-.499 1.902c-.181.695-.67 1.566-.997 2.097A12 12 0 1 0 12 0z"/>
          </svg>
          <span className="text-sm font-semibold">Pinterest Pin Description</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isGenerating || !title}
          className="rounded-full text-xs border-[#E60023]/30 text-[#E60023] hover:bg-[#E60023]/10"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Pin Description'
          )}
        </Button>
      </div>

      {pinDescription && (
        <div className="space-y-2">
          <Textarea
            value={pinDescription}
            onChange={(e) => setPinDescription(e.target.value)}
            rows={4}
            className="text-sm resize-none"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{pinDescription.length}/500 characters</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-xs h-7"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinDescriptionGenerator;
