import { useContext, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Megaphone,
  Flower2,
  Library,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/App";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function AppLayout() {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: "/" },
    { icon: Users, label: t('nav.members'), path: "/members" },
    { icon: Network, label: t('nav.tree'), path: "/tree" },
    { icon: Megaphone, label: t('nav.announcements'), path: "/announcements" },
    { icon: Flower2, label: t('nav.memorials'), path: "/death-anniversaries" },
    { icon: Library, label: t('nav.archives'), path: "/archives" },
    { icon: Calendar, label: t('nav.calendar'), path: "/calendar" },
    { icon: Settings, label: t('nav.settings'), path: "/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toast.success(t('common.language_switched', { lang: lng === 'sw' ? 'Kiswahili' : 'English' }));
  };

  const getCurrentLabel = () => {
    return navItems.find(item => item.path === location.pathname)?.label || t('nav.dashboard');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-background overflow-hidden selection:bg-accent/30 selection:text-primary">
        {/* Sidebar - Desktop */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarCollapsed ? 88 : 300 }}
          className="hidden md:flex flex-col bg-white border-r border-border shadow-heritage z-30 transition-all duration-300 relative"
        >
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3.5 top-12 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-40 border-2 border-white"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <div className={cn("p-8 flex items-center gap-4 overflow-hidden", isSidebarCollapsed && "justify-center px-0")}>
            <div className="w-12 h-12 heritage-gradient rounded-2xl flex items-center justify-center text-white shadow-2xl shrink-0 ring-4 ring-primary/5">
              <Network size={26} />
            </div>
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="font-serif font-black text-2xl text-primary tracking-tighter leading-none">
                  HeritageHub
                </span>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest mt-0.5">{t('common.session')}</span>
              </motion.div>
            )}
          </div>

          <nav className="flex-1 px-4 py-10 space-y-2.5 overflow-y-auto no-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-5 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
                    isActive 
                      ? "bg-primary text-white shadow-2xl shadow-primary/20" 
                      : "text-muted-foreground hover:bg-secondary hover:text-primary"
                  )
                }
              >
                <item.icon size={22} className={cn("shrink-0", location.pathname === item.path ? "" : "group-hover:scale-110 transition-transform duration-300")} />
                {!isSidebarCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-bold text-sm tracking-tight"
                  >
                    {item.label}
                  </motion.span>
                )}
                {location.pathname === item.path && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute left-0 w-1.5 h-7 bg-accent rounded-r-full"
                  />
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-6 border-t border-border mt-auto bg-secondary/5">
            <div className={cn(
              "flex items-center gap-4 p-4 bg-white rounded-2xl mb-6 shadow-sm border border-border transition-all overflow-hidden", 
              isSidebarCollapsed && "justify-center px-0 border-none bg-transparent shadow-none"
            )}>
              <div className="w-11 h-11 rounded-2xl border-2 border-primary/10 shadow-sm overflow-hidden shrink-0 bg-muted">
                <img 
                  src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/avatar-placeholder-9a8b4217-1777147756527.webp" 
                  alt="Curator" 
                  className="w-full h-full object-cover" 
                />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] truncate">{t('common.session')}</p>
                  <p className="text-sm font-black text-primary truncate">{user?.role === 'admin' ? t('common.curator') : t('common.member')}</p>
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl h-14 transition-all group",
                isSidebarCollapsed ? "justify-center px-0" : "justify-start px-5"
              )}
            >
              <LogOut size={22} className={cn("transition-transform", isSidebarCollapsed ? "" : "mr-4 group-hover:-translate-x-1")} />
              {!isSidebarCollapsed && <span className="font-black text-sm tracking-tight">{t('nav.logout')}</span>}
            </Button>
          </div>
        </motion.aside>

        {/* Main View Container */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

          {/* Top Navbar */}
          <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-10 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-6">
              <button 
                className="md:hidden heritage-gradient w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-95 transition-all" 
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div className="flex flex-col">
                <h1 className="text-3xl font-serif font-black text-primary tracking-tighter leading-tight">{getCurrentLabel()}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">PostgreSQL Pipeline Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-8">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-3 text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-90 bg-secondary/30 rounded-2xl h-12 w-12">
                    <Languages size={24} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl border-border p-2 shadow-2xl">
                  <DropdownMenuItem className="rounded-xl py-3 font-bold cursor-pointer" onClick={() => changeLanguage('en')}>
                    🇬🇧 English
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl py-3 font-bold cursor-pointer" onClick={() => changeLanguage('sw')}>
                    🇹🇿 Kiswahili
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="hidden sm:flex items-center gap-3 bg-secondary/50 px-5 py-2.5 rounded-2xl border border-primary/5 shadow-inner">
                 <ShieldCheck size={18} className="text-emerald-600" />
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('common.vault_encrypted')}</span>
              </div>
              
              <button className="relative p-3 text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-90 bg-secondary/30 rounded-2xl h-12 w-12">
                <Bell size={24} />
                <span className="absolute top-2 right-2 w-3 h-3 bg-accent rounded-full border-2 border-white shadow-sm" />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto no-scrollbar relative p-8 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-7xl mx-auto"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-primary/60 backdrop-blur-md z-50 md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[60] shadow-[30px_0_60px_-15px_rgba(0,0,0,0.3)] flex flex-col md:hidden rounded-r-[3rem] overflow-hidden"
              >
                <div className="p-10 flex items-center justify-between border-b border-border bg-secondary/5">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 heritage-gradient rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <Network size={26} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif font-black text-2xl text-primary tracking-tighter leading-none">HeritageHub</span>
                        <span className="text-[9px] font-black text-accent uppercase tracking-widest mt-0.5">Mobile Vault</span>
                      </div>
                   </div>
                   <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-secondary/30 rounded-2xl text-muted-foreground active:scale-90 transition-all">
                      <X size={24} />
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-3 no-scrollbar">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-5 px-6 py-5 rounded-[1.5rem] font-black transition-all",
                          isActive ? "bg-primary text-white shadow-2xl shadow-primary/30" : "text-muted-foreground hover:bg-secondary/50"
                        )
                      }
                    >
                      <item.icon size={24} />
                      <span className="text-lg tracking-tight">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
                <div className="p-10 border-t border-border bg-secondary/5 flex flex-col gap-4">
                   <div className="flex items-center justify-center gap-4">
                      <Button 
                        variant="outline" 
                        className={cn("flex-1 rounded-xl h-12 font-bold", i18n.language === 'en' && "bg-primary text-white border-primary")}
                        onClick={() => changeLanguage('en')}
                      >
                        English
                      </Button>
                      <Button 
                        variant="outline" 
                        className={cn("flex-1 rounded-xl h-12 font-bold", i18n.language === 'sw' && "bg-primary text-white border-primary")}
                        onClick={() => changeLanguage('sw')}
                      >
                        Kiswahili
                      </Button>
                   </div>
                   <Button variant="destructive" className="w-full rounded-[1.5rem] h-16 font-black text-lg shadow-xl shadow-red-100 active:scale-95 transition-all" onClick={handleLogout}>
                      <LogOut size={22} className="mr-3" /> {t('nav.logout')}
                   </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}