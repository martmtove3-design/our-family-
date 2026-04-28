import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  ShieldCheck, 
  History, 
  Lock, 
  Mail, 
  User, 
  Fingerprint,
  Languages,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function AuthPage() {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("curator@heritage.pg");
  const [password, setPassword] = useState("********");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate PostgreSQL-backed Auth API
    login(email.includes("curator") || email.includes("admin") ? "admin" : "member");
    navigate("/");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toast.success(t('common.language_switched', { lang: lng === 'sw' ? 'Kiswahili' : 'English' }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans selection:bg-accent/30 selection:text-primary">
      {/* Left Visual Side - Modern Heritage Design */}
      <div className="hidden md:flex flex-col justify-between w-[42%] heritage-gradient p-20 text-white relative overflow-hidden">
         {/* Subtle pattern overlay */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
         
         <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/dashboard-hero-bg-0b1359ca-1777148042440.webp" 
          className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-soft-light"
          alt="Heritage Background"
        />
        
        <div className="relative z-10 space-y-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
            <Network size={32} className="text-accent" />
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl lg:text-8xl font-serif font-black tracking-tighter leading-[0.8] animate-in fade-in slide-in-from-left-8 duration-700">
              {t('auth.heritage_hub').split(' ').map((word, i) => (<span key={i}>{word} <br/></span>))}
            </h1>
            <p className="text-white/60 text-xl font-medium max-w-sm leading-relaxed">
              {t('auth.enterprise_grade')}
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
           <div className="flex items-center gap-6 bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <div className="p-4 bg-accent/20 rounded-2xl text-accent shadow-inner">
                <ShieldCheck size={28} />
              </div>
              <div>
                 <p className="font-black text-sm uppercase tracking-[0.3em]">{t('auth.encrypted_vault')}</p>
                 <p className="text-xs text-white/40 font-bold uppercase mt-1">{t('auth.mirroring')}</p>
              </div>
           </div>
           <div className="flex items-center justify-between px-4">
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">Vault v2.5.0-SQL</p>
              <Fingerprint size={16} className="text-white/20" />
           </div>
        </div>
      </div>

      {/* Right Auth Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white lg:p-24 relative">
        {/* Language Switcher - Auth Top Right */}
        <div className="absolute top-8 right-8 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-12 px-6 border-border font-bold gap-3 hover:bg-secondary transition-all">
                <Languages size={18} className="text-primary" />
                {i18n.language === 'sw' ? 'Kiswahili' : 'English'}
                <ChevronDown size={14} className="opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl border-border p-2 shadow-2xl">
              <DropdownMenuItem className="rounded-xl py-3 font-bold cursor-pointer" onClick={() => changeLanguage('en')}>
                🇺🇸 English
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-3 font-bold cursor-pointer" onClick={() => changeLanguage('sw')}>
                🇹🇿 Kiswahili
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg space-y-12"
        >
          <div className="space-y-4 text-center md:text-left">
            <Badge className="bg-primary/5 text-primary border-primary/10 font-black px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase">
               {t('auth.badge')}
            </Badge>
            <h2 className="text-5xl font-serif font-black text-primary tracking-tighter leading-tight">
              {isLogin ? t('auth.title_login') : t('auth.title_register')}
            </h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              {isLogin 
                ? t('auth.subtitle_login') 
                : t('auth.subtitle_register')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">{t('auth.email_label')}</Label>
                <div className="relative group">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
                   <Input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-18 rounded-[1.5rem] border-border bg-secondary/20 pl-16 text-xl font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                   />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">{t('auth.password_label')}</Label>
                <div className="relative group">
                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
                   <Input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-18 rounded-[1.5rem] border-border bg-secondary/20 pl-16 text-xl font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                   />
                </div>
              </div>
            </div>

            <Button className="w-full h-20 rounded-[2rem] heritage-gradient text-white font-black text-2xl shadow-[0_25px_50px_-12px_rgba(6,78,59,0.3)] active:scale-[0.98] transition-all duration-300">
              {isLogin ? t('auth.btn_login') : t('auth.btn_register')}
            </Button>
          </form>

          <div className="text-center space-y-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-6 text-muted-foreground font-black tracking-widest">Registry Options</span>
              </div>
            </div>

            <p className="text-muted-foreground font-bold text-lg">
              {isLogin ? t('auth.switch_register') : t('auth.switch_login')}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)} 
                className="ml-3 text-primary hover:text-accent font-black underline decoration-2 underline-offset-8 transition-colors"
              >
                {isLogin ? t('auth.link_register') : t('auth.link_login')}
              </button>
            </p>
            
            <div className="pt-12 flex items-center justify-center gap-12 opacity-20 text-primary">
               <History size={32} />
               <User size={32} />
               <Network size={32} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}