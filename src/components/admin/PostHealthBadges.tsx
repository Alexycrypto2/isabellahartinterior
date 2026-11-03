import { Badge } from '@/components/ui/badge';
import { getPostHealth } from '@/lib/postHealth';

const LABELS = {
  ready: { text: 'Rank ready', cls: 'border-primary/40 text-primary' },
  good: { text: 'Good draft', cls: 'border-accent/50 text-accent' },
  thin: { text: 'Thin — re-expand', cls: 'border-destructive/50 text-destructive' },
};

export const PostHealthBadges = ({ content, imageUrl }: { content: string; imageUrl?: string | null }) => {
  const h = getPostHealth(content, !!imageUrl);
  const l = LABELS[h.level];
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1">
      <Badge variant="outline" className={`text-[10px] ${l.cls}`}>{l.text}</Badge>
      <span className="text-[11px] text-muted-foreground">{h.words.toLocaleString()} words · {h.images} image{h.images !== 1 ? 's' : ''}</span>
    </div>
  );
};
