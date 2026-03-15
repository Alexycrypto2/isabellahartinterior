import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { resolveImageUrl } from '@/lib/imageResolver';
import { Button } from '@/components/ui/button';

interface MediaItem {
  id: string;
  media_url: string;
  media_type: string;
  alt_text: string | null;
}

interface ProductMediaGalleryProps {
  media: MediaItem[];
  fallbackImage: string;
  productName: string;
  badge?: string | null;
  children?: React.ReactNode; // For overlays like Pinterest button
}

const ProductMediaGallery = ({
  media,
  fallbackImage,
  productName,
  badge,
  children,
}: ProductMediaGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Build items list: use media if available, otherwise fallback to single image
  const items: MediaItem[] =
    media.length > 0
      ? media
      : [{ id: 'fallback', media_url: fallbackImage, media_type: 'image', alt_text: productName }];

  const activeItem = items[activeIndex] || items[0];
  const hasMultiple = items.length > 1;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + items.length) % items.length);
    },
    [items.length]
  );

  const isVideo = (type: string) => type === 'video';

  return (
    <div className="relative">
      {/* Main display */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative group">
        {isVideo(activeItem.media_type) ? (
          <video
            key={activeItem.id}
            src={activeItem.media_url}
            controls
            playsInline
            className="w-full h-full object-cover"
            poster=""
          />
        ) : (
          <img
            key={activeItem.id}
            src={resolveImageUrl(activeItem.media_url)}
            alt={activeItem.alt_text || `${productName} - image ${activeIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-background/90"
              onClick={() => goTo(activeIndex - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-background/90"
              onClick={() => goTo(activeIndex + 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Dot indicators */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  i === activeIndex
                    ? 'bg-foreground w-6'
                    : 'bg-foreground/40 hover:bg-foreground/60'
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Badge */}
      {badge && (
        <span
          className={cn(
            'absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-semibold z-10',
            badge === 'Sale'
              ? 'bg-accent text-accent-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          {badge}
        </span>
      )}

      {/* Overlay children (Pinterest button, etc.) */}
      {children && <div className="absolute top-4 right-4 z-10">{children}</div>}

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200',
                i === activeIndex
                  ? 'border-primary ring-1 ring-primary/30'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              {isVideo(item.media_type) ? (
                <div className="w-full h-full bg-muted flex items-center justify-center relative">
                  <video
                    src={item.media_url}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={resolveImageUrl(item.media_url)}
                  alt={item.alt_text || `${productName} thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductMediaGallery;
