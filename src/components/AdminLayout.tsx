import { ReactNode, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  LogOut,
  Home,
  PlusCircle,
  Tag,
  Package,
  Settings,
  FileText,
  Image,
  Users,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (prefix: string) => location.pathname.startsWith(prefix);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="font-display text-xl font-medium">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your website</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {/* Dashboard */}
          <Link to="/admin">
            <Button
              variant={isActive('/admin') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          <Separator className="my-3" />
          
          {/* Blog Section */}
          <p className="text-xs font-medium text-muted-foreground px-3 py-2">BLOG</p>
          <Link to="/admin/blog/new">
            <Button
              variant={isActive('/admin/blog/new') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
          <Link to="/admin/categories">
            <Button
              variant={isActive('/admin/categories') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Tag className="mr-2 h-4 w-4" />
              Blog Categories
            </Button>
          </Link>

          <Separator className="my-3" />

          {/* Products Section */}
          <p className="text-xs font-medium text-muted-foreground px-3 py-2">PRODUCTS</p>
          <Link to="/admin/products">
            <Button
              variant={isActivePrefix('/admin/products') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Package className="mr-2 h-4 w-4" />
              All Products
            </Button>
          </Link>
          <Link to="/admin/products/new">
            <Button
              variant={isActive('/admin/products/new') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </Link>

          <Separator className="my-3" />

          {/* Content Section */}
          <p className="text-xs font-medium text-muted-foreground px-3 py-2">CONTENT</p>
          <Link to="/admin/media">
            <Button
              variant={isActive('/admin/media') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Image className="mr-2 h-4 w-4" />
              Media Library
            </Button>
          </Link>
          <Link to="/admin/subscribers">
            <Button
              variant={isActive('/admin/subscribers') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              Subscribers
            </Button>
          </Link>

          <Separator className="my-3" />

          {/* Settings Section */}
          <p className="text-xs font-medium text-muted-foreground px-3 py-2">SETTINGS</p>
          <Link to="/admin/settings">
            <Button
              variant={isActive('/admin/settings') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Site Settings
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
