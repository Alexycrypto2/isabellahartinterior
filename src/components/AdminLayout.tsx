import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  LogOut,
  Home,
  PlusCircle,
  Tag,
  Package,
  Settings,
  Image,
  Users,
  Palette,
  Menu,
  MessageSquare,
  Camera,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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

  const sidebarContent = (
    <>
      <div className="p-6 border-b">
        <h1 className="font-display text-xl font-medium">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your website</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        <Link to="/admin">
          <Button variant={isActive('/admin') ? 'secondary' : 'ghost'} className="w-full justify-start">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>

        <Separator className="my-3" />
        <p className="text-xs font-medium text-muted-foreground px-3 py-2">BLOG</p>
        <Link to="/admin/blog/new">
          <Button variant={isActive('/admin/blog/new') ? 'secondary' : 'ghost'} className="w-full justify-start">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
        <Link to="/admin/categories">
          <Button variant={isActive('/admin/categories') ? 'secondary' : 'ghost'} className="w-full justify-start">
            <Tag className="mr-2 h-4 w-4" />
            Blog Categories
          </Button>
        </Link>

        <Separator className="my-3" />
        <p className="text-xs font-medium text-muted-foreground px-3 py-2">PRODUCTS</p>
        <Link to="/admin/products">
          <Button variant={isActivePrefix('/admin/products') ? 'secondary' : 'ghost'} className="w-full justify-start">
            <Package className="mr-2 h-4 w-4" />
            All Products
          </Button>
        </Link>
        <Link to="/admin/products/new">
          <Button variant={isActive('/admin/products/new') ? 'secondary' : 'ghost'} className="w-full justify-start">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </Link>

        <Separator className="my-3" />
        <p className="text-xs font-medium text-muted-foreground px-3 py-2">CONTENT</p>
        <Link to="/admin/media">
          <Button variant={isActive('/admin/media') ? 'secondary' : 'ghost'} className="w-full justify-start">
            <Image className="mr-2 h-4 w-4" />
            Media Library
          </Button>
        </Link>
        <Link to="/admin/subscribers">
          <Button variant={isActive('/admin/subscribers') ? 'secondary' : 'ghost'} className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Subscribers
          </Button>
        </Link>
        <Link to="/admin/contact-submissions">
          <Button variant={isActive('/admin/contact-submissions') ? 'secondary' : 'ghost'} className="w-full justify-start">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Messages
          </Button>
        </Link>
        <Link to="/admin/photo-submissions">
          <Button variant={isActive('/admin/photo-submissions') ? 'secondary' : 'ghost'} className="w-full justify-start">
            <Camera className="mr-2 h-4 w-4" />
            Photo Submissions
          </Button>
        </Link>

        <Separator className="my-3" />
        <p className="text-xs font-medium text-muted-foreground px-3 py-2">SETTINGS</p>
        <Link to="/admin/appearance">
          <Button variant={isActive('/admin/appearance') ? 'secondary' : 'ghost'} className="w-full justify-start">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </Button>
        </Link>
        <Link to="/admin/settings">
          <Button variant={isActive('/admin/settings') ? 'secondary' : 'ghost'} className="w-full justify-start">
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
    </>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b px-4 py-3 flex items-center justify-between bg-muted/30">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <h1 className="font-display text-lg font-medium">Admin</h1>
          <div className="w-10" />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        {sidebarContent}
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
