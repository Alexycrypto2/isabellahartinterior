import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const submissionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  instagram_handle: z.string().max(50).optional(),
  caption: z.string().max(300, "Caption must be under 300 characters").optional(),
  room_type: z.string().min(1, "Please select a room type"),
});

const roomTypes = [
  { value: "living-room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "dining-room", label: "Dining Room" },
  { value: "bathroom", label: "Bathroom" },
  { value: "office", label: "Home Office" },
  { value: "entryway", label: "Entryway" },
  { value: "outdoor", label: "Outdoor" },
  { value: "other", label: "Other" },
];

const PhotoSubmissionForm = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagram_handle: "",
    caption: "",
    room_type: "living-room",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", instagram_handle: "", caption: "", room_type: "living-room" });
    setFile(null);
    setPreview(null);
    setErrors({});
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = submissionSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!file) {
      setErrors({ file: "Please upload a photo" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload photo
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("customer-photos")
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("customer-photos")
        .getPublicUrl(fileName);

      // Save submission record
      const { error: insertError } = await supabase
        .from("customer_photo_submissions")
        .insert({
          name: result.data.name,
          email: result.data.email,
          instagram_handle: result.data.instagram_handle || null,
          caption: result.data.caption || null,
          photo_url: urlData.publicUrl,
          room_type: result.data.room_type,
        });

      if (insertError) throw insertError;

      setIsSuccess(true);
      toast.success("Photo submitted! We'll review it soon.");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full bg-accent text-accent-foreground hover:brightness-110 gap-2">
          <Camera className="w-4 h-4" />
          Share Your Space
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-accent mx-auto" />
            <h3 className="font-display text-2xl font-medium">Thank You!</h3>
            <p className="text-muted-foreground">
              Your photo has been submitted for review. Once approved, it'll appear in our community gallery!
            </p>
            <Button variant="outline" onClick={() => { resetForm(); setOpen(false); }} className="rounded-full">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Share Your Styled Space</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Upload a photo of your home styling and get featured in our community gallery.
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Photo Upload */}
              <div>
                <Label>Photo *</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {preview ? (
                  <div className="relative mt-2 rounded-xl overflow-hidden">
                    <img src={preview} alt="Preview" className="w-full aspect-[4/3] object-cover" />
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreview(null); }}
                      className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full p-1 hover:bg-foreground/90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload (JPG, PNG, WebP · max 5MB)</p>
                  </button>
                )}
                {errors.file && <p className="text-sm text-destructive mt-1">{errors.file}</p>}
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@email.com"
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Instagram & Room Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram (optional)</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram_handle}
                    onChange={(e) => setFormData((p) => ({ ...p, instagram_handle: e.target.value }))}
                    placeholder="@yourhandle"
                  />
                </div>
                <div>
                  <Label>Room Type *</Label>
                  <Select value={formData.room_type} onValueChange={(v) => setFormData((p) => ({ ...p, room_type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Caption */}
              <div>
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  value={formData.caption}
                  onChange={(e) => setFormData((p) => ({ ...p, caption: e.target.value }))}
                  placeholder="Tell us about your space..."
                  rows={2}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.caption.length}/300</p>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-accent text-accent-foreground hover:brightness-110">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Submit Photo"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree to let us feature your photo on our site with credit.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PhotoSubmissionForm;
