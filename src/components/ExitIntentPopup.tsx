import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSetting } from '@/hooks/useSiteSettings';
import { Gift, Heart, Star, Sparkles, Tag, Percent, Megaphone, PartyPopper, Bell, Zap, X } from 'lucide-react';

const POPUP_STORAGE_KEY = 'exit-intent-shown';
const POPUP_COOLDOWN_DAYS = 7;
const VARIANT_STORAGE_KEY = 'exit-intent-variant';

const ICON_MAP: Record<string, typeof Gift> = {
  Gift, Heart, Star, Sparkles, Tag, Percent, Megaphone, PartyPopper, Bell, Zap,
};

const DEFAULTS = {
  title: "Wait! Don't Leave Yet",
  description: 'Get our <strong>Free Room Styling Guide</strong> — packed with pro tips to transform any space into a magazine-worthy room.',
  button_text: 'Get My Free Guide',
  placeholder: 'Enter your email address',
  disclaimer: 'No spam, ever. Unsubscribe anytime.',
  enabled: true,
  icon: 'Gift',
  gradient_from: '#8B5CF6',
  gradient_to: '#D946EF',
};

interface Variant {
  id: string;
  name: string;
  title: string;
  description: string;
  button_text: string;
  weight: number;
}

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: popupSettings } = useSiteSetting('exit_intent_popup');

  const settings = (popupSettings?.value || {}) as Record<string, any>;

  const baseConfig = {
    title: settings.title || DEFAULTS.title,
    description: settings.description || DEFAULTS.description,
    button_text: settings.button_text || DEFAULTS.button_text,
    placeholder: settings.placeholder || DEFAULTS.placeholder,
    disclaimer: settings.disclaimer || DEFAULTS.disclaimer,
    enabled: settings.enabled ?? DEFAULTS.enabled,
    icon: settings.icon || DEFAULTS.icon,
    gradient_from: settings.gradient_from || DEFAULTS.gradient_from,
    gradient_to: settings.gradient_to || DEFAULTS.gradient_to,
    ab_enabled: settings.ab_enabled ?? false,
    variants: (settings.variants || []) as Variant[],
  };

  // A/B variant selection — pick once per visitor and persist
  const selectedVariant = useMemo(() => {
    if (!baseConfig.ab_enabled || baseConfig.variants.length === 0) return null;

    // Check if we already assigned a variant
    const stored = localStorage.getItem(VARIANT_STORAGE_KEY);
    if (stored) {
      // Validate it still exists
      if (stored === 'control') return null;
      const found = baseConfig.variants.find(v => v.id === stored);
      if (found) return found;
    }

    // Weighted random selection
    const controlWeight = Math.max(0, 100 - baseConfig.variants.reduce((s: number, v: Variant) => s + v.weight, 0));
    const rand = Math.random() * 100;
    let cumulative = controlWeight;

    if (rand < cumulative) {
      localStorage.setItem(VARIANT_STORAGE_KEY, 'control');
      return null;
    }

    for (const v of baseConfig.variants) {
      cumulative += v.weight;
      if (rand < cumulative) {
        localStorage.setItem(VARIANT_STORAGE_KEY, v.id);
        return v;
      }
    }

    localStorage.setItem(VARIANT_STORAGE_KEY, 'control');
    return null;
  }, [baseConfig.ab_enabled, baseConfig.variants]);

  // Merge variant overrides into config
  const config = {
    ...baseConfig,
    title: selectedVariant?.title || baseConfig.title,
    description: selectedVariant?.description || baseConfig.description,
    button_text: selectedVariant?.button_text || baseConfig.button_text,
  };

  const variantId = selectedVariant?.id || 'control';

  const trackEvent = useCallback(async (eventType: string, entityId?: string) => {
    const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
    localStorage.setItem('visitor_id', visitorId);

    try {
      await supabase.from('analytics_events').insert({
        visitor_id: visitorId,
        event_type: eventType,
        page_path: window.location.pathname,
        entity_id: entityId || null,
        entity_name: entityId ? (selectedVariant?.name || 'Control') : null,
      });
    } catch (e) {
      console.error('Failed to track event:', e);
    }
  }, [selectedVariant]);

  const shouldShowPopup = useCallback(() => {
    if (!config.enabled) return false;
    if (window.innerWidth < 1024) return false;

    const lastShown = localStorage.getItem(POPUP_STORAGE_KEY);
    if (lastShown) {
      const daysSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < POPUP_COOLDOWN_DAYS) return false;
    }

    return true;
  }, [config.enabled]);

  useEffect(() => {
    if (!shouldShowPopup()) return;

    let triggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !triggered) {
        triggered = true;
        setIsOpen(true);
        localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
        trackEvent('exit_intent_shown', variantId);
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [shouldShowPopup, trackEvent, variantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already subscribed', description: 'This email is already on our list!' });
        } else {
          throw error;
        }
      } else {
        await trackEvent('exit_intent_converted', variantId);
        toast({ title: 'Success!', description: 'Check your inbox for the free styling guide!' });
      }

      setIsOpen(false);
      setEmail('');
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconComp = ICON_MAP[config.icon] || Gift;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-1 hover:bg-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="p-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${config.gradient_from}15, transparent, ${config.gradient_to}15)`,
          }}
        >
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${config.gradient_from}20` }}
          >
            <IconComp className="h-8 w-8" style={{ color: config.gradient_from }} />
          </div>

          <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
          <p className="text-muted-foreground mb-6" dangerouslySetInnerHTML={{ __html: config.description }} />

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder={config.placeholder}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-background"
              required
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              style={{ backgroundColor: config.gradient_from }}
            >
              {isSubmitting ? 'Sending...' : config.button_text}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            {config.disclaimer}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
