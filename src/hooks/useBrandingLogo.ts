import { useSiteSetting } from '@/hooks/useSiteSettings';
import defaultLogo from '@/assets/logo-isabelle-hart.png';

/**
 * Returns the brand logo URL.
 * Priority: admin-uploaded logo from site_settings.branding.logoUrl → bundled default.
 */
export const useBrandingLogo = () => {
  const { data } = useSiteSetting('branding');
  const customUrl = (data?.value as { logoUrl?: string } | undefined)?.logoUrl;
  return customUrl && customUrl.trim().length > 0 ? customUrl : defaultLogo;
};

export { defaultLogo };
