import { useState, useEffect, useContext } from "react";
import { api } from "@/lib/db";
import { Document, FamilyMember } from "@/lib/types";
import { 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Filter,
  User, 
  ExternalLink,
  Loader2,
  Upload,
  FolderOpen,
  History,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileSearch,
  BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AuthContext } from "@/App";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function Archives() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [archives, setArchives] = useState<Document[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const COLLECTIONS = [
    { id: "all", label: t('archives.types.all'), icon: FolderOpen },
    { id: "photos", label: t('archives.types.photos'), icon: ImageIcon },
    { id: "documents", label: t('archives.types.documents'), icon: FileText },
    { id: "certificates", label: t('archives.types.certificates'), icon: History },
  ];

  // Form state for PostgreSQL migration
  const [formData, setFormData] = useState<Partial<Document>>({
    title: "",
    type: "image",
    memberId: "",
    url: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docs, mems] = await Promise.all([
        api.getArchives(),
        api.getMembers()
      ]);
      setArchives(docs);
      setMembers(mems);
    } catch (err) {
      toast.error("Failed to sync with PostgreSQL backend");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArchives = archives.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCollection = 
      selectedCollection === "all" || 
      (selectedCollection === "photos" && item.type === "image") ||
      (selectedCollection === "documents" && item.type === "pdf") ||
      (selectedCollection === "certificates" && item.type === "certificate");
    return matchesSearch && matchesCollection;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      toast.error("Missing required metadata");
      return;
    }

    setIsSaving(true);
    try {
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title || "Untitled",
        url: formData.url || "",
        type: formData.type as any || "image",
        memberId: formData.memberId || "",
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      await api.saveArchive(newDoc);
      await loadData();
      setIsUploadModalOpen(false);
      setFormData({ title: "", type: "image", memberId: "", url: "" });
      toast.success("Record persisted in PostgreSQL vault");
    } catch (err) {
      toast.error("Database storage failure");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteArchive(id);
      await loadData();
      toast.success("Record expunged from database");
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const getMemberName = (id: string) => {
    return members.find(m => m.id === id)?.fullName || "General Family";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[calc(100vh-10rem)]">
      {/* Responsive & Accessible Collapsible Sidebar */}
      <motion.aside 
        role="navigation"
        aria-label="Archive Collections"
        animate={{ width: isSidebarCollapsed ? 80 : 320 }}
        className={cn(
          "hidden lg:flex flex-col shrink-0 bg-white rounded-[2rem] border border-border shadow-heritage p-6 space-y-8 relative transition-all duration-300",
          isSidebarCollapsed && "items-center"
        )}
      >
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-expanded={!isSidebarCollapsed}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-10 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10 border-2 border-white"
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="space-y-6 w-full">
          {!isSidebarCollapsed && (
            <div className="px-2">
               <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">{t('archives.sidebar.explorer')}</h3>
               <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                    <FileSearch size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-primary">PostgreSQL</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{t('archives.sidebar.cloud_sync')}</p>
                  </div>
               </div>
            </div>
          )}

          <div className="space-y-2">
            {!isSidebarCollapsed && <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 mb-2">{t('archives.sidebar.collections')}</p>}
            {COLLECTIONS.map(coll => (
              <button
                key={coll.id}
                onClick={() => setSelectedCollection(coll.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group",
                  selectedCollection === coll.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-primary"
                )}
              >
                <coll.icon size={22} className={cn("shrink-0", selectedCollection === coll.id ? "" : "group-hover:scale-110 transition-transform")} />
                {!isSidebarCollapsed && <span className="font-bold text-sm tracking-tight">{coll.label}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-5 bg-accent/5 rounded-[1.5rem] border border-accent/10">
           <div className="flex items-center gap-3 mb-3">
              <ShieldCheck size={20} className="text-accent" />
              {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t('archives.sidebar.encrypted')}</span>}
           </div>
           {!isSidebarCollapsed && (
             <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
               {t('archives.sidebar.encrypted_desc')}
             </p>
           )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-10">
        {/* Header Section */}
        <section className="relative rounded-[3rem] overflow-hidden shadow-2xl group min-h-[340px] flex flex-col justify-end p-10 lg:p-16">
           <img 
            src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/archives-header-bg-3750f730-1777148043607.webp" 
            alt="Archive Room" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
          
          <div className="relative z-10 space-y-6">
            <Badge className="bg-accent text-white border-none px-6 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-accent/20">
              {t('archives.badge')}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tighter leading-none">
              {t('archives.title')}
            </h1>
            <p className="text-white/80 font-medium max-w-xl text-lg lg:text-xl leading-relaxed">
              {t('archives.subtitle')}
            </p>
          </div>
        </section>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
            <Input 
              placeholder={t('archives.search')} 
              className="pl-16 h-18 rounded-[1.5rem] bg-white border-border shadow-heritage text-lg font-medium focus:ring-4 focus:ring-primary/5 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="h-18 rounded-[1.5rem] px-8 bg-white min-w-[240px] lg:hidden shadow-heritage border-border font-bold">
                  <div className="flex items-center gap-3">
                    <Filter size={20} className="text-primary" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                   {COLLECTIONS.map(c => (
                     <SelectItem key={c.id} value={c.id} className="py-3 font-bold text-sm">
                       {c.label}
                     </SelectItem>
                   ))}
                </SelectContent>
             </Select>

            {user?.role === "admin" && (
              <Button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white h-18 px-10 rounded-[1.5rem] shadow-2xl shadow-primary/20 font-black text-lg flex-1 md:flex-none transition-all active:scale-95"
              >
                <Upload size={22} className="mr-3" />
                {t('archives.store')}
              </Button>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-48 space-y-6">
            <div className="relative">
               <Loader2 className="animate-spin text-primary" size={64} />
               <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/40" size={24} />
            </div>
            <p className="text-muted-foreground font-black tracking-[0.3em] uppercase text-xs animate-pulse">{t('archives.syncing')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredArchives.map((doc, idx) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                >
                  <Card className="group overflow-hidden rounded-[2.5rem] border-none bg-white shadow-heritage hover:shadow-2xl transition-all duration-700 h-full flex flex-col p-2">
                    <CardContent className="p-0 flex flex-col h-full rounded-[2rem] overflow-hidden">
                      <div className="aspect-[5/4] relative overflow-hidden bg-secondary/20">
                        {doc.type === 'image' ? (
                          <img 
                            src={doc.url} 
                            alt={doc.title} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText size={80} className="text-primary/10" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6 flex gap-2">
                          <Badge className="bg-white/95 backdrop-blur-md text-primary font-black border-none rounded-full px-5 py-1 text-[10px] tracking-widest shadow-lg">
                            {doc.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[4px]">
                           <Button variant="secondary" className="rounded-full font-black px-8 py-6 h-auto shadow-2xl" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                 <ExternalLink size={20} className="mr-2" /> View Original
                              </a>
                           </Button>
                        </div>
                      </div>
                      
                      <div className="p-10 flex-1 flex flex-col bg-white">
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                          <History size={14} className="text-accent" />
                          <span>Archived {doc.uploadedAt}</span>
                        </div>
                        <h3 className="text-2xl font-serif font-black text-primary mb-8 line-clamp-2 leading-tight">{doc.title}</h3>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary shadow-inner">
                                <User size={18} />
                             </div>
                             <div>
                               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Associated with</p>
                               <p className="text-sm font-bold text-primary">{getMemberName(doc.memberId)}</p>
                             </div>
                          </div>
                          
                          {user?.role === "admin" && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-12 w-12 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                              onClick={() => handleDelete(doc.id)}
                              aria-label="Delete archive record"
                            >
                              <Trash2 size={24} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredArchives.length === 0 && !isLoading && (
              <div className="col-span-full py-32 text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-border">
                <FolderOpen size={64} className="mx-auto text-muted-foreground/20 mb-6" />
                <h3 className="text-2xl font-serif font-black text-primary mb-2">{t('archives.no_records')}</h3>
                <p className="text-muted-foreground font-medium">{t('archives.no_records_desc')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl bg-white">
          <div className="heritage-gradient p-12">
            <DialogTitle className="text-4xl font-serif font-black text-white flex items-center gap-4">
              <ShieldCheck size={40} className="text-accent" />
              {t('archives.modal.title')}
            </DialogTitle>
            <p className="text-white/70 mt-3 font-medium text-lg leading-relaxed">{t('archives.modal.subtitle')}</p>
          </div>
          <form onSubmit={handleUpload}>
            <div className="p-12 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">{t('archives.modal.label_title')}</Label>
                <Input 
                  required
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. 1928 Ancestral Land Deed"
                  className="h-16 rounded-2xl border-border bg-secondary/20 px-6 text-lg font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">{t('archives.modal.label_type')}</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as any})}>
                    <SelectTrigger className="h-16 rounded-2xl border-border font-bold">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="image" className="font-bold">Visual Media</SelectItem>
                      <SelectItem value="pdf" className="font-bold">Legal PDF</SelectItem>
                      <SelectItem value="certificate" className="font-bold">Official Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">{t('archives.modal.label_member')}</Label>
                  <Select value={formData.memberId} onValueChange={(v) => setFormData({...formData, memberId: v})}>
                    <SelectTrigger className="h-16 rounded-2xl border-border font-bold">
                      <SelectValue placeholder="Select Member" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl max-h-80">
                      <SelectItem value="general" className="font-bold">General Collection</SelectItem>
                      {members.map(m => (
                        <SelectItem key={m.id} value={m.id} className="font-bold">{m.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">{t('archives.modal.label_url')}</Label>
                <div className="relative group">
                   <Input 
                    required
                    value={formData.url} 
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://s3.amazonaws.com/heritage-hub/..." 
                    className="h-16 rounded-2xl border-border bg-secondary/20 px-6 font-mono text-sm group-focus-within:border-primary transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <History size={20} className="text-muted-foreground/30" />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="p-12 bg-secondary/30 flex-col sm:flex-row gap-6 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)} className="rounded-2xl h-16 font-black text-lg px-10">{t('common.cancel')}</Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="heritage-gradient text-white h-16 px-14 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 flex-1 active:scale-95 transition-all"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : t('archives.modal.btn')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}