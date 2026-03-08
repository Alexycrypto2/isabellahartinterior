import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Crop, RotateCw, ZoomIn, Save, X } from 'lucide-react';

interface FeaturedImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (blob: Blob) => Promise<void>;
}

const PRESETS = [
  { label: 'Blog Featured (1200×630)', w: 1200, h: 630 },
  { label: 'Social Share (1200×630)', w: 1200, h: 630 },
  { label: 'Square (800×800)', w: 800, h: 800 },
  { label: 'Custom', w: 0, h: 0 },
];

const FeaturedImageEditor = ({ isOpen, onClose, imageUrl, onSave }: FeaturedImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [outputWidth, setOutputWidth] = useState(1200);
  const [outputHeight, setOutputHeight] = useState(630);
  const [zoom, setZoom] = useState([1]);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activePreset, setActivePreset] = useState(0);

  // Load image
  useEffect(() => {
    if (!isOpen || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
      setOffsetX(0);
      setOffsetY(0);
      setZoom([1]);
      drawCanvas(img, 1, 0, 0);
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl]);

  const drawCanvas = useCallback((img: HTMLImageElement, z: number, ox: number, oy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Display canvas at a reasonable preview size
    const previewW = Math.min(600, outputWidth);
    const scale = previewW / outputWidth;
    const previewH = outputHeight * scale;
    canvas.width = previewW;
    canvas.height = previewH;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#f5f5f4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate how to fit the image
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawW: number, drawH: number;
    if (imgAspect > canvasAspect) {
      drawH = canvas.height * z;
      drawW = drawH * imgAspect;
    } else {
      drawW = canvas.width * z;
      drawH = drawW / imgAspect;
    }

    const x = (canvas.width - drawW) / 2 + ox;
    const y = (canvas.height - drawH) / 2 + oy;

    ctx.drawImage(img, x, y, drawW, drawH);
  }, [outputWidth, outputHeight]);

  useEffect(() => {
    if (loaded && imgRef.current) {
      drawCanvas(imgRef.current, zoom[0], offsetX, offsetY);
    }
  }, [zoom, offsetX, offsetY, outputWidth, outputHeight, loaded, drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setDragging(false);

  const handlePreset = (idx: number) => {
    setActivePreset(idx);
    if (PRESETS[idx].w > 0) {
      setOutputWidth(PRESETS[idx].w);
      setOutputHeight(PRESETS[idx].h);
    }
  };

  const handleSave = async () => {
    if (!imgRef.current) return;
    setSaving(true);
    try {
      // Render at full output resolution
      const offscreen = document.createElement('canvas');
      offscreen.width = outputWidth;
      offscreen.height = outputHeight;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      const img = imgRef.current;
      const z = zoom[0];
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = outputWidth / outputHeight;

      let drawW: number, drawH: number;
      if (imgAspect > canvasAspect) {
        drawH = outputHeight * z;
        drawW = drawH * imgAspect;
      } else {
        drawW = outputWidth * z;
        drawH = drawW / imgAspect;
      }

      // Scale the offset from preview coords to output coords
      const previewW = Math.min(600, outputWidth);
      const scaleFactor = outputWidth / previewW;
      
      const x = (outputWidth - drawW) / 2 + offsetX * scaleFactor;
      const y = (outputHeight - drawH) / 2 + offsetY * scaleFactor;

      ctx.fillStyle = '#f5f5f4';
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      ctx.drawImage(img, x, y, drawW, drawH);

      const blob = await new Promise<Blob>((resolve, reject) => {
        offscreen.toBlob(
          (b) => b ? resolve(b) : reject(new Error('Blob creation failed')),
          'image/webp',
          0.9
        );
      });

      await onSave(blob);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <Crop className="w-5 h-5 text-accent" />
            Featured Image Editor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <Button
                key={i}
                type="button"
                variant={activePreset === i ? 'default' : 'outline'}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => handlePreset(i)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Custom dimensions */}
          {activePreset === 3 && (
            <div className="flex gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Width (px)</Label>
                <Input
                  type="number"
                  value={outputWidth}
                  onChange={(e) => setOutputWidth(Number(e.target.value) || 800)}
                  className="w-24"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Height (px)</Label>
                <Input
                  type="number"
                  value={outputHeight}
                  onChange={(e) => setOutputHeight(Number(e.target.value) || 600)}
                  className="w-24"
                />
              </div>
            </div>
          )}

          {/* Zoom */}
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={zoom}
              onValueChange={setZoom}
              min={1}
              max={3}
              step={0.05}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">{Math.round(zoom[0] * 100)}%</span>
          </div>

          {/* Canvas */}
          <div
            className="border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing bg-muted mx-auto"
            style={{ width: 'fit-content' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} className="block" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Drag to reposition • Output: {outputWidth}×{outputHeight}px (WebP)
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || !loaded}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save & Apply'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeaturedImageEditor;
