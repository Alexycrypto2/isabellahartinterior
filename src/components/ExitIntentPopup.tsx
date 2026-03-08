import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSetting } from '@/hooks/useSiteSettings';
import { Gift, X } from 'lucide-react';

const POPUP_STORAGE_KEY = 'exit-intent-shown';
const POPUP_COOLDOWN_DAYS = 7;

const DEFAULTS = {
  title: "Wait! Don't Leave Yet",
  description: 'Get our <strong>Free Room Styling Guide</strong> — packed with pro tips to transform any space into a magazine-worthy room.',
  button_text: 'Get My Free Guide',
  placeholder: 'Enter your email address',
  disclaimer: 'No spam, ever. Unsubscribe anytime.',
  enabled: true,
};

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: popupSettings } = useSiteSetting('exit_intent_popup');

  const config = {
    title: (popupSettings?.value as any)?.title || DEFAULTS.title,
    description: (popupSettings?.value as any)?.description || DEFAULTS.description,
    button_text: (popupSettings?.value as any)?.button_text || DEFAULTS.button_text,
    placeholder: (popupSettings?.value as any)?.placeholder || DEFAULTS.placeholder,
    disclaimer: (popupSettings?.value as any)?.disclaimer || DEFAULTS.disclaimer,
    enabled: (popupSettings?.value as any)?.enabled ?? DEFAULTS.enabled,
  };

  const trackEvent = useCallback(async (eventType: string) => {
    const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
    localStorage.setItem('visitor_id', visitorId);
    
    try {
      await supabase.from('analytics_events').insert({
        visitor_id: visitorId,
        event_type: eventType,
        page_path: window.location.pathname,
      });
    } catch (e) {
      console.error('Failed to track event:', e);
    }
  }, []);

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
        trackEvent('exit_intent_shown');
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [shouldShowPopup, trackEvent]);

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
        await trackEvent('exit_intent_converted');
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-1 hover:bg-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Gift className="h-8 w-8 text-primary" />
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
