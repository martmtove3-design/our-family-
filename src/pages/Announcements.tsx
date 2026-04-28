import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/App";
import { api } from "@/lib/db";
import { Announcement } from "@/lib/types";
import { 
  Megaphone, 
  Plus, 
  Search, 
  Bell, 
  Calendar, 
  ShieldCheck,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function Announcements() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: "",
    content: "",
    priority: "medium"
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    const data = await api.getAnnouncements();
    setAnnouncements(data);
    setIsLoading(false);
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAnnouncement: Announcement = {
      ...formData as Announcement,
      id: editingAnnouncement?.id || Math.random().toString(36).substr(2, 9),
      date: editingAnnouncement?.date || new Date().toISOString().split('T')[0],
      author: editingAnnouncement?.author || (user?.role === 'admin' ? 'Curator' : 'Family Member')
    };
    
    await api.saveAnnouncement(newAnnouncement);
    await loadAnnouncements();
    toast.success(editingAnnouncement ? "Heritage dispatch updated" : "Heritage dispatch broadcasted");
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", priority: "medium" });
    setEditingAnnouncement(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      image: announcement.image
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await api.deleteAnnouncement(deletingId);
    await loadAnnouncements();
    toast.success("Dispatch removed from archives");
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high': return <Badge className="bg-accent text-white border-none"><AlertTriangle size={12} className="mr-1" /> {t('announcements.urgent')}</Badge>;
      case 'medium': return <Badge className="bg-primary text-white border-none"><Bell size={12} className="mr-1" /> {t('announcements.notice')}</Badge>;
      default: return <Badge className="bg-secondary text-primary border-none"><CheckCircle2 size={12} className="mr-1" /> {t('announcements.update')}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-black text-primary tracking-tighter">{t('announcements.title')}</h1>
          <p className="text-muted-foreground font-medium">{t('announcements.subtitle')}</p>
        </div>
        {user?.role === "admin" && (
          <Button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 font-black"
          >
            <Plus size={20} className="mr-2" />
            {t('announcements.broadcast')}
          </Button>
        )}
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={22} />
        <Input 
          placeholder={t('announcements.search')} 
          className="pl-14 h-16 bg-white border-border w-full shadow-heritage rounded-2xl text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-8">
        <AnimatePresence mode="popLayout">
          {filteredAnnouncements.map((announcement, idx) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden border-none shadow-heritage hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white group">
                <div className="flex flex-col md:flex-row">
                  {announcement.image && (
                    <div className="md:w-72 h-56 md:h-auto overflow-hidden">
                      <img 
                        src={announcement.image} 
                        alt={announcement.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {getPriorityBadge(announcement.priority)}
                        <span className="text-[10px] font-black text-muted-foreground flex items-center uppercase tracking-widest">
                          <Calendar size={12} className="mr-2" /> 
                          {announcement.date}
                        </span>
                      </div>
                      {user?.role === "admin" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                              <MoreVertical size={20} className="text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 border-border shadow-2xl">
                            <DropdownMenuItem 
                              onClick={() => handleEdit(announcement)}
                              className="rounded-xl py-3 font-bold cursor-pointer flex items-center gap-3"
                            >
                              <Edit size={16} />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => { setDeletingId(announcement.id); setIsDeleteDialogOpen(true); }}
                              className="rounded-xl py-3 font-bold cursor-pointer flex items-center gap-3 text-red-600 focus:text-red-600"
                            >
                              <Trash2 size={16} />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <h2 className="text-2xl font-serif font-black text-primary mb-4 leading-tight">{announcement.title}</h2>
                    <p className="text-muted-foreground leading-relaxed font-medium mb-8 text-lg">
                      {announcement.content}
                    </p>
                    <div className="flex items-center justify-between pt-8 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 heritage-gradient rounded-xl flex items-center justify-center text-white font-black text-sm">
                          {announcement.author.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-primary uppercase tracking-widest">{announcement.author}</span>
                           <span className="text-[10px] text-muted-foreground font-bold">{t('announcements.verified')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <ShieldCheck size={18} className="text-emerald-500" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t('announcements.authenticated')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {!isLoading && filteredAnnouncements.length === 0 && (
          <div className="text-center py-24 bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Megaphone size={40} className="text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-xl font-serif font-black text-primary">{t('announcements.no_dispatches')}</h3>
            <p className="text-muted-foreground font-medium">{t('announcements.no_dispatches_desc')}</p>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if(!open) resetForm(); }}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          <div className="heritage-gradient p-10 text-white">
            <DialogTitle className="text-3xl font-serif font-black">
              {editingAnnouncement ? t('announcements.modal.title_edit') : t('announcements.modal.title')}
            </DialogTitle>
            <p className="text-white/70 mt-2">{t('announcements.modal.subtitle')}</p>
          </div>
          <form onSubmit={handlePost} className="p-10 space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('announcements.modal.label_title')}</Label>
              <Input 
                required 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder={t('announcements.modal.placeholder_title')}
                className="h-14 rounded-2xl border-border bg-secondary/10"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('announcements.modal.label_priority')}</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(val) => setFormData({...formData, priority: val as any})}
              >
                <SelectTrigger className="h-14 rounded-2xl border-border">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('announcements.update')}</SelectItem>
                  <SelectItem value="medium">{t('announcements.notice')}</SelectItem>
                  <SelectItem value="high">{t('announcements.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('announcements.modal.label_content')}</Label>
              <Textarea 
                required 
                className="min-h-[160px] rounded-2xl border-border bg-secondary/10 text-lg" 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder={t('announcements.modal.placeholder_content')}
              />
            </div>
            <DialogFooter className="gap-4 flex-col sm:flex-row">
              <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); resetForm(); }} className="rounded-2xl h-14 font-black">{t('common.cancel')}</Button>
              <Button type="submit" className="heritage-gradient text-white h-14 px-10 rounded-2xl font-black shadow-xl shadow-primary/20 flex-1">
                {editingAnnouncement ? t('announcements.modal.btn_update') : t('announcements.modal.btn')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-serif font-black text-primary">{t('common.confirm_delete_title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium text-lg pt-4">
              {t('common.confirm_delete_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-10 gap-4">
            <AlertDialogCancel className="h-14 rounded-2xl font-black border-border">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="h-14 rounded-2xl font-black bg-red-600 hover:bg-red-700 text-white border-none shadow-xl shadow-red-100 flex-1">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}