import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Check, X, Trash2, Search, Eye, Camera, Instagram } from "lucide-react";

const AdminPhotoSubmissions = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin-photo-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_photo_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from("customer_photo_submissions")
        .update({ is_approved: approved })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-photo-submissions"] });
      toast.success(approved ? "Photo approved!" : "Photo rejected");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("customer_photo_submissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-photo-submissions"] });
      toast.success("Submission deleted");
      setSelectedPhoto(null);
    },
  });

  const filtered = submissions?.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.instagram_handle?.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !s.is_approved) ||
      (filter === "approved" && s.is_approved);
    return matchesSearch && matchesFilter;
  }) || [];

  const pendingCount = submissions?.filter((s) => !s.is_approved).length || 0;
  const approvedCount = submissions?.filter((s) => s.is_approved).length || 0;

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-medium flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Photo Submissions
            </h1>
            <p className="text-muted-foreground mt-1">Review and approve customer home styling photos</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold">{submissions?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-destructive">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-accent">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or Instagram..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "approved"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No submissions found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((sub) => (
              <div key={sub.id} className="bg-card border border-border rounded-xl overflow-hidden group">
                {/* Image */}
                <div className="aspect-square relative cursor-pointer" onClick={() => setSelectedPhoto(sub)}>
                  <img
                    src={sub.photo_url}
                    alt={sub.caption || "Customer photo"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={sub.is_approved ? "default" : "secondary"}>
                      {sub.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                    <Eye className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                  {sub.instagram_handle && (
                    <p className="text-xs text-accent flex items-center gap-1 mt-1">
                      <Instagram className="w-3 h-3" />
                      {sub.instagram_handle}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {!sub.is_approved ? (
                      <Button
                        size="sm"
                        className="flex-1 bg-accent text-accent-foreground hover:brightness-110"
                        onClick={() => approveMutation.mutate({ id: sub.id, approved: true })}
                      >
                        <Check className="w-3 h-3 mr-1" /> Approve
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => approveMutation.mutate({ id: sub.id, approved: false })}
                      >
                        <X className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete submission?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently remove this photo submission.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(sub.id)} className="bg-destructive text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedPhoto} onOpenChange={(v) => !v && setSelectedPhoto(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedPhoto && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Photo Details</DialogTitle>
                </DialogHeader>
                <img
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.caption || "Customer photo"}
                  className="w-full rounded-xl object-contain max-h-[50vh]"
                />
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedPhoto.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedPhoto.email}</p>
                    </div>
                    <Badge variant={selectedPhoto.is_approved ? "default" : "secondary"}>
                      {selectedPhoto.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  {selectedPhoto.instagram_handle && (
                    <p className="text-sm text-accent flex items-center gap-1">
                      <Instagram className="w-4 h-4" /> {selectedPhoto.instagram_handle}
                    </p>
                  )}
                  {selectedPhoto.caption && (
                    <p className="text-sm text-foreground">"{selectedPhoto.caption}"</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Room: {selectedPhoto.room_type} · Submitted {new Date(selectedPhoto.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 pt-2">
                    {!selectedPhoto.is_approved ? (
                      <Button
                        className="flex-1 bg-accent text-accent-foreground hover:brightness-110"
                        onClick={() => {
                          approveMutation.mutate({ id: selectedPhoto.id, approved: true });
                          setSelectedPhoto({ ...selectedPhoto, is_approved: true });
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" /> Approve
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          approveMutation.mutate({ id: selectedPhoto.id, approved: false });
                          setSelectedPhoto({ ...selectedPhoto, is_approved: false });
                        }}
                      >
                        <X className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(selectedPhoto.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPhotoSubmissions;
