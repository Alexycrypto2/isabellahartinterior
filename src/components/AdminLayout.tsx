import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  FileText,
  Calendar,
  Shield,
  Crown,
  UserCog,
  ChevronRight,
  Sparkles,
  Flame,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: '',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/blog', icon: FileText, label: 'All Posts', exact: true },
      { to: '/admin/blog/new', icon: PlusCircle, label: 'New Post', exact: true },
      { to: '/admin/categories', icon: Tag, label: 'Categories', exact: true },
      { to: '/admin/blog/calendar', icon: Calendar, label: 'Calendar', exact: true },
      { to: '/admin/pin-generator', icon: Sparkles, label: 'Pin Generator', exact: true },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { to: '/admin/products', icon: Package, label: 'Products' },
      { to: '/admin/products/new', icon: PlusCircle, label: 'New Product', exact: true },
      { to: '/admin/product-categories', icon: Tag, label: 'Room Categories', exact: true },
      { to: '/admin/trending', icon: Flame, label: 'Trending', exact: true },
    ],
  },
  {
    title: 'Engage',
    items: [
      { to: '/admin/comments', icon: MessageSquare, label: 'Comments', exact: true },
      { to: '/admin/media', icon: Image, label: 'Media Library', exact: true },
      { to: '/admin/subscribers', icon: Users, label: 'Subscribers', exact: true },
      { to: '/admin/contact-submissions', icon: MessageSquare, label: 'Messages', exact: true },
      { to: '/admin/photo-submissions', icon: Camera, label: 'Photos', exact: true },
    ],
  },
  {
    title: 'Configure',
    items: [
      { to: '/admin/seasonal-banners', icon: Calendar, label: 'Banners', exact: true },
      { to: '/admin/appearance', icon: Palette, label: 'Appearance', exact: true },
      { to: '/admin/settings', icon: Settings, label: 'Settings', exact: true },
    ],
  },
  {
    title: 'Team & Security',
    items: [
      { to: '/admin/account', icon: UserCog, label: 'Account', exact: true },
      { to: '/admin/team', icon: Users, label: 'Team', exact: true },
      { to: '/admin/security', icon: Shield, label: 'Security', exact: true },
      { to: '/admin/ownership', icon: Crown, label: 'Ownership', exact: true },
      { to: '/admin/developer', icon: Settings, label: 'Developer', exact: true },
    ],
  },
];

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>
        </div>
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

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const userInitial = user.email?.charAt(0).toUpperCase() || 'A';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display text-base font-semibold tracking-tight">Admin</h1>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Command Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-3 overflow-auto space-y-5">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-1.5">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.to, item.exact);
                return (
                  <Link key={item.to} to={item.to}>
                    <button
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group ${
                        active
                          ? 'bg-accent/15 text-accent shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {active && <ChevronRight className="h-3 w-3 text-accent/60" />}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/40 space-y-1">
        <Link to="/">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            <Home className="h-4 w-4" />
            View Site
          </button>
        </Link>

        <div className="flex items-center gap-2 px-3 py-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-accent/15 text-accent text-xs font-semibold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium truncate">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border/40 px-4 py-3 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-background/95 backdrop-blur-xl">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <h1 className="font-display text-base font-semibold">Admin</h1>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent/15 text-accent text-xs font-semibold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-[260px] border-r border-border/40 bg-muted/20 flex flex-col shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
