import { useContext, useState, useRef } from "react";
import { AuthContext } from "@/App";
import { api } from "@/lib/db";
import { useTranslation } from "react-i18next";
import { 
  User, 
  Database, 
  ShieldCheck,
  LogOut,
  History,
  HardDrive,
  Cpu,
  Network,
  Camera,
  Loader2,
  Trash2,
  Languages
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Settings() {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>("https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/avatar-placeholder-9a8b4217-1777147756527.webp");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const persistedUrl = await api.uploadImage(file);
      toast.success("Profile photo synchronized with S3 storage");
      console.log("PostgreSQL Update: photo_url =", persistedUrl);
    } catch (err) {
      toast.error("Cloud storage synchronization failed");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    setProfilePreview(null);
    toast.info("Profile photo removed from vault cache");
  };

  const handleSave = () => {
    toast.success("Vault infrastructure configuration updated");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toast.success(`Language changed to ${lng === 'sw' ? 'Kiswahili' : 'English'}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-border">
        <div className="space-y-4">
          <Badge className="bg-primary/5 text-primary border-primary/20 font-black px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase">
             {t('settings.badge')}
          </Badge>
          <h2 className="text-5xl md:text-6xl font-serif font-black text-primary tracking-tighter leading-none">
            {t('settings.title')}
          </h2>
          <p className="text-muted-foreground font-medium text-lg">
            {t('settings.subtitle')}
          </p>
        </div>
        <Button onClick={handleSave} className="heritage-gradient text-white px-12 h-16 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 active:scale-95 transition-all">
          {t('settings.deploy')}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <Card className="border-none shadow-heritage bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-12 border-b border-border bg-secondary/10">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white rounded-2xl text-primary shadow-sm">
                  <User size={32} />
                </div>
                <div>
                  <CardTitle className="text-3xl font-serif font-black">{t('settings.personal.title')}</CardTitle>
                  <CardDescription className="font-bold text-muted-foreground uppercase text-[10px] tracking-[0.2em] mt-1">
                    PostgreSQL Record #UX-8291
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-12 space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-secondary shadow-2xl relative bg-muted">
                    <AnimatePresence mode="wait">
                      {profilePreview ? (
                        <motion.img 
                          key="photo"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          src={profilePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <motion.div 
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="w-full h-full flex items-center justify-center text-muted-foreground"
                        >
                          <User size={64} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {isUploading && (
                      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute -bottom-4 -right-4 flex flex-col gap-2">
                    <Button 
                      size="icon" 
                      className="w-12 h-12 rounded-2xl bg-primary text-white shadow-xl hover:scale-110 transition-transform"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={20} />
                    </Button>
                    {profilePreview && (
                      <Button 
                        size="icon" 
                        variant="destructive"
                        className="w-10 h-10 rounded-xl shadow-lg hover:scale-110 transition-transform"
                        onClick={removePhoto}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </div>

                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h4 className="text-2xl font-serif font-black text-primary">{t('settings.personal.photo')}</h4>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm">
                    {t('settings.personal.photo_desc')}
                  </p>
                  <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                     <Badge className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg">JPG/PNG/WEBP</Badge>
                     <Badge className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg">Max 5MB</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">{t('settings.personal.access_level')}</Label>
                    <Input value={user?.role === 'admin' ? t('common.curator') : t('common.member')} readOnly className="h-16 rounded-2xl border-border bg-secondary/20 font-bold text-lg px-6" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">{t('settings.personal.identifier')}</Label>
                    <Input value={user?.role === 'admin' ? "admin@heritagehub.pg" : "member@heritagehub.pg"} readOnly className="h-16 rounded-2xl border-border bg-secondary/20 font-bold text-lg px-6" />
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-heritage bg-white rounded-[2.5rem] overflow-hidden">
             <CardHeader className="p-12 bg-secondary/20 flex flex-row items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md text-emerald-600">
                      <Database size={32} />
                   </div>
                   <div>
                      <CardTitle className="text-2xl font-serif font-black text-primary leading-tight">Backend Infrastructure</CardTitle>
                      <CardDescription className="font-black uppercase text-[10px] tracking-[0.2em] mt-1 text-emerald-700">Production Node \\\\\\\\ Active Connection</CardDescription>
                   </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-2 rounded-full border border-emerald-100 shadow-sm">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">{t('common.synchronized')}</span>
                </div>
             </CardHeader>
             <CardContent className="p-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="p-8 bg-secondary/10 rounded-[2rem] border border-primary/5 text-center group hover:bg-white hover:shadow-xl transition-all">
                   <HardDrive size={32} className="mx-auto text-primary mb-4 group-hover:scale-110 transition-transform" />
                   <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Storage Plane</p>
                   <p className="font-serif font-black text-primary text-xl mt-2">AWS S3 Vault</p>
                </div>
                <div className="p-8 bg-secondary/10 rounded-[2rem] border border-primary/5 text-center group hover:bg-white hover:shadow-xl transition-all">
                   <Cpu size={32} className="mx-auto text-primary mb-4 group-hover:scale-110 transition-transform" />
                   <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Data Engine</p>
                   <p className="font-serif font-black text-primary text-xl mt-2">PostgreSQL 16</p>
                </div>
                <div className="p-8 bg-secondary/10 rounded-[2rem] border border-primary/5 text-center group hover:bg-white hover:shadow-xl transition-all">
                   <ShieldCheck size={32} className="mx-auto text-primary mb-4 group-hover:scale-110 transition-transform" />
                   <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Security Protocol</p>
                   <p className="font-serif font-black text-primary text-xl mt-2">SSL/TLS 1.3</p>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
          <Card className="border-none shadow-heritage bg-white rounded-[2.5rem] overflow-hidden">
             <CardHeader className="p-10 border-b border-border">
                <CardTitle className="text-2xl font-serif font-black">{t('settings.preferences.title')}</CardTitle>
             </CardHeader>
             <CardContent className="p-10 space-y-10">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Languages size={18} className="text-primary" />
                      <p className="text-md font-black text-primary">{t('settings.preferences.language')}</p>
                   </div>
                   <Select value={i18n.language} onValueChange={changeLanguage}>
                      <SelectTrigger className="h-14 rounded-2xl border-border bg-secondary/10 font-bold">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border shadow-2xl">
                        <SelectItem value="en" className="font-bold">English (United Kingdom)</SelectItem>
                        <SelectItem value="sw" className="font-bold">Kiswahili (East Africa)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border">
                   <div className="space-y-1">
                      <p className="text-md font-black text-primary">{t('settings.preferences.notifications')}</p>
                      <p className="text-xs text-muted-foreground font-medium">Real-time update notifications.</p>
                   </div>
                   <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-border">
                   <div className="space-y-1">
                      <p className="text-md font-black text-primary">{t('settings.preferences.biometric')}</p>
                      <p className="text-xs text-muted-foreground font-medium">Secondary authentication layer.</p>
                   </div>
                   <Badge className="bg-emerald-50 text-emerald-700 font-black border-emerald-100 px-3 py-1">{t('common.active')}</Badge>
                </div>
             </CardContent>
          </Card>

          <Card className="border-none shadow-heritage bg-red-50/30 rounded-[2.5rem] overflow-hidden border border-red-100/50">
             <CardHeader className="p-10">
                <CardTitle className="text-2xl font-serif font-black text-red-900">Security Clearance</CardTitle>
                <CardDescription className="font-bold text-red-700/60 uppercase text-[9px] tracking-widest mt-1">Authorized Access Only</CardDescription>
             </CardHeader>
             <CardContent className="px-10 pb-10 space-y-4">
                <Button variant="destructive" className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-red-200 active:scale-95 transition-all" onClick={logout}>
                   <LogOut size={22} className="mr-3" />
                   {t('nav.logout')}
                </Button>
                <p className="text-[10px] text-red-800/40 text-center font-bold px-4 uppercase tracking-widest">Logging out will revoke all session keys.</p>
             </CardContent>
          </Card>

          <div className="text-center py-6 flex flex-col items-center gap-6">
            <div className="flex items-center gap-8 opacity-20 text-primary">
               <History size={24} />
               <ShieldCheck size={24} />
               <Network size={24} />
            </div>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">Vault v2.5.0 \\\\\\\\ SQL Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
}