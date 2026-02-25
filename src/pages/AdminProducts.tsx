import { useState } from 'react';
import { resolveImageUrl } from '@/lib/imageResolver';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAllProducts, useDeleteProduct, useToggleProductStatus } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, Package, Search, Star } from 'lucide-react';

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products, isLoading, error } = useAllProducts();
  const deleteMutation = useDeleteProduct();
  const toggleStatusMutation = useToggleProductStatus();
  const { toast } = useToast();

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Product deleted', description: 'The product has been deleted successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete the product.', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({ id, is_active: !currentStatus });
      toast({
        title: currentStatus ? 'Product deactivated' : 'Product activated',
        description: currentStatus ? 'The product is now hidden.' : 'The product is now visible.',
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  const activeCount = products?.filter((p) => p.is_active).length || 0;
  const featuredCount = products?.filter((p) => p.is_featured).length || 0;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your product catalog</p>
          </div>
          <Link to="/admin/products/new">
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Products</span>
            </div>
            <p className="font-display text-3xl font-medium mt-2">{products?.length || 0}</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <p className="font-display text-3xl font-medium mt-2 text-green-600">{activeCount}</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Featured</span>
            </div>
            <p className="font-display text-3xl font-medium mt-2 text-yellow-600">{featuredCount}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Table */}
        <div className="bg-background border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading products...</div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">Error loading products</div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={resolveImageUrl(product.image_url)} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          {product.badge && <Badge variant="secondary" className="text-xs">{product.badge}</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{product.price}</span>
                        {product.original_price && (
                          <span className="text-muted-foreground line-through ml-2 text-sm">{product.original_price}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{product.rating}</span>
                        <span className="text-muted-foreground text-sm">({product.reviews})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant={product.is_active ? 'default' : 'outline'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.is_featured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(product.id, product.is_active)}
                          disabled={toggleStatusMutation.isPending}
                        >
                          {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Link to={`/admin/products/edit/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
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
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">Create your first product to get started.</p>
              <Link to="/admin/products/new">
                <Button className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
