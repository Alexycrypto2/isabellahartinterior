import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Play, ZoomIn, X } from 'lucide-react';
import { resolveImageUrl } from '@/lib/imageResolver';
import { Button } from '@/components/ui/button';
import { useGesture } from '@use-gesture/react';

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
  children?: React.ReactNode;
}

const ProductMediaGallery = ({
  media,
  fallbackImage,
  productName,
  badge,
  children,
}: ProductMediaGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const buildItems = (): MediaItem[] => {
    if (media.length > 0) return media;
    return [{ id: 'fallback', media_url: fallbackImage, media_type: 'image', alt_text: productName }];
  };

  const items = buildItems();
  const activeItem = items[activeIndex] || items[0];
  const hasMultiple = items.length > 1;

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsZoomed(false);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      resetZoom();
      setActiveIndex((index + items.length) % items.length);
    },
    [items.length, resetZoom]
  );

  const isVideo = (type: string) => type === 'video';

  // Gesture handling for pinch-to-zoom and swipe
  const bind = useGesture(
    {
      onPinch: ({ offset: [s], memo }) => {
        const newScale = Math.min(Math.max(s, 1), 4);
        setScale(newScale);
        setIsZoomed(newScale > 1.05);
        if (newScale <= 1.05) {
          setTranslate({ x: 0, y: 0 });
        }
        return memo;
      },
      onDrag: ({ movement: [mx, my], direction: [dx], velocity: [vx], cancel, first, memo = { swiping: false } }) => {
        if (scale > 1.05) {
          // When zoomed: pan the image
          const maxX = (scale - 1) * 150;
          const maxY = (scale - 1) * 150;
          setTranslate({
            x: Math.min(Math.max(mx, -maxX), maxX),
            y: Math.min(Math.max(my, -maxY), maxY),
          });
          return memo;
        }

        // When not zoomed: swipe to change slide
        if (first) memo.swiping = false;
        if (!memo.swiping && hasMultiple && Math.abs(mx) > 30 && vx > 0.2) {
          memo.swiping = true;
          if (dx > 0) goTo(activeIndex - 1);
          else goTo(activeIndex + 1);
          cancel();
        }
        return memo;
      },
    },
    {
      pinch: { scaleBounds: { min: 1, max: 4 }, rubberband: true },
      drag: { from: () => [translate.x, translate.y], filterTaps: true },
    }
  );

  const handleDoubleTap = useCallback(() => {
    if (isVideo(activeItem.media_type)) return;
    if (isZoomed) {
      resetZoom();
    } else {
      setScale(2.5);
      setIsZoomed(true);
    }
  }, [activeItem.media_type, isZoomed, resetZoom]);

  return (
    <div className="relative">
      {/* Main display */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative group touch-none select-none">
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
          <div
            ref={imageRef}
            {...bind()}
            onDoubleClick={handleDoubleTap}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          >
            <img
              key={activeItem.id}
              src={resolveImageUrl(activeItem.media_url)}
              alt={activeItem.alt_text || `${productName} - image ${activeIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 ease-out will-change-transform"
              style={{
                transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
              }}
              draggable={false}
            />
          </div>
        )}

        {/* Zoom indicator */}
        {isZoomed && (
          <button
            type="button"
            onClick={resetZoom}
            className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground shadow-lg transition-opacity"
          >
            <X className="h-3 w-3" />
            Reset zoom
          </button>
        )}

        {/* Zoom hint on mobile - only when not zoomed */}
        {!isZoomed && !isVideo(activeItem.media_type) && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm text-xs text-muted-foreground opacity-0 group-active:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="h-3 w-3" />
            Pinch to zoom · Swipe to browse
          </div>
        )}

        {/* Navigation arrows - hidden when zoomed */}
        {hasMultiple && !isZoomed && (
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
        {hasMultiple && !isZoomed && (
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
