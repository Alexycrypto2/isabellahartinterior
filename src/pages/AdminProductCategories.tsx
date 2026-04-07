import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useProductCategories, useCreateProductCategory, useUpdateProductCategory,
  useDeleteProductCategory, useProductCategoryAssignments, useActiveProducts,
  useBulkAssignCategory, ProductCategory,
} from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Home, GripVertical, Package, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AdminProductCategories = () => {
  const { data: categories, isLoading } = useProductCategories();
  const { data: assignments } = useProductCategoryAssignments();
  const { data: products } = useActiveProducts();
  const createMutation = useCreateProductCategory();
  const updateMutation = useUpdateProductCategory();
  const deleteMutation = useDeleteProductCategory();
  const bulkAssignMutation = useBulkAssignCategory();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  // Bulk assign
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');

  const getCategoryCount = (catSlug: string) =>
    (assignments || []).filter(a => a.category_slug === catSlug).length;

  const resetForm = () => {
    setName(''); setSlug(''); setIcon(''); setDescription(''); setCoverImageUrl('');
    setAutoSlug(true); setEditingCategory(null);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (autoSlug) setSlug(generateSlug(value));
  };

  const handleCreate = async () => {
    if (!name || !slug) {
      toast({ title: 'Missing fields', description: 'Name and slug are required.', variant: 'destructive' });
      return;
    }
    try {
      const maxOrder = Math.max(0, ...(categories || []).map(c => c.display_order));
      await createMutation.mutateAsync({ name, slug, icon: icon || undefined, description: description || undefined, cover_image_url: coverImageUrl || undefined, display_order: maxOrder + 1 });
      toast({ title: 'Category created' });
      setIsCreateOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message?.includes('duplicate') ? 'Category already exists.' : 'Failed to create.', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !name || !slug) return;
    try {
      await updateMutation.mutateAsync({ id: editingCategory.id, name, slug, icon: icon || undefined, description: description || undefined, cover_image_url: coverImageUrl || undefined });
      toast({ title: 'Category updated' });
      setEditingCategory(null);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Category deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    }
  };

  const openEditDialog = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || '');
    setDescription(cat.description || '');
    setCoverImageUrl(cat.cover_image_url || '');
    setAutoSlug(false);
  };

  const handleBulkAssign = async () => {
    if (!bulkCategory || selectedProductIds.length === 0) return;
    try {
      await bulkAssignMutation.mutateAsync({ productIds: selectedProductIds, categorySlug: bulkCategory });
      toast({ title: `Assigned ${selectedProductIds.length} products to ${bulkCategory}` });
      setSelectedProductIds([]);
      setBulkCategory('');
      setShowBulkAssign(false);
    } catch {
      toast({ title: 'Bulk assign failed', variant: 'destructive' });
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const categoryFormFields = (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Living Room" />
      </div>
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input value={slug} onChange={e => { setSlug(e.target.value); setAutoSlug(false); }} placeholder="e.g. living-room" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Icon Emoji</Label>
          <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🛋️" />
        </div>
        <div className="space-y-2">
          <Label>Cover Image URL</Label>
          <Input value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Category description..." rows={2} />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-medium flex items-center gap-2">
              <Home className="h-6 w-6 text-accent" /> Room Categories
            </h1>
            <p className="text-muted-foreground mt-1">Manage room-based product categories</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBulkAssign(!showBulkAssign)} className="rounded-full" size="sm">
              <Package className="mr-2 h-4 w-4" /> Bulk Assign
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={open => { setIsCreateOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="rounded-full" size="sm"><Plus className="mr-2 h-4 w-4" /> New Category</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Room Category</DialogTitle>
                  <DialogDescription>Add a new room category for organizing products.</DialogDescription>
                </DialogHeader>
                {categoryFormFields}
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-background border rounded-xl overflow-hidden mb-8">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading categories...</div>
          ) : categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(cat => (
                  <TableRow key={cat.id}>
                    <TableCell><GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" /></TableCell>
                    <TableCell className="font-medium">
                      <span className="mr-2 text-lg">{cat.icon}</span>{cat.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{cat.slug}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        {getCategoryCount(cat.slug)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{cat.description || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog open={editingCategory?.id === cat.id} onOpenChange={open => { if (!open) resetForm(); }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(cat)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                              <DialogDescription>Update room category details.</DialogDescription>
                            </DialogHeader>
                            {categoryFormFields}
                            <DialogFooter>
                              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Saving...' : 'Save'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{cat.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>Products assigned to this category will need to be reassigned.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No categories yet</h3>
              <p className="text-muted-foreground">Create room categories to organize your products.</p>
            </div>
          )}
        </div>

        {/* Bulk Assign Section */}
        {showBulkAssign && products && categories && (
          <div className="bg-background border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Bulk Assign Products to Category</h3>
              <div className="flex items-center gap-3">
                <Select value={bulkCategory} onValueChange={setBulkCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.slug !== 'all-rooms').map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleBulkAssign} disabled={!bulkCategory || selectedProductIds.length === 0 || bulkAssignMutation.isPending} size="sm" className="rounded-full">
                  <Check className="mr-2 h-4 w-4" />
                  Assign {selectedProductIds.length > 0 ? `(${selectedProductIds.length})` : ''}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-auto">
              {products.map(p => (
                <label key={p.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedProductIds.includes(p.id) ? 'border-accent bg-accent/5' : 'border-border'}`}>
                  <Checkbox checked={selectedProductIds.includes(p.id)} onCheckedChange={() => toggleProductSelection(p.id)} />
                  <span className="text-sm truncate">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProductCategories;