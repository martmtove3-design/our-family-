import { useState, useContext, useMemo, useRef, useEffect } from "react";
import { AuthContext } from "@/App";
import { api } from "@/lib/db";
import { FamilyMember } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  Users,
  Calendar,
  Info,
  User as UserIcon,
  Heart,
  Edit,
  Camera,
  Trash2,
  Loader2,
  X,
  Upload,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import SendWishesModal from "@/components/features/SendWishesModal";

const AVATAR_PLACEHOLDER = "https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/avatar-placeholder-9a8b4217-1777147756527.webp";

export default function Members() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isWishesModalOpen, setIsWishesModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<FamilyMember>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    const data = await api.getMembers();
    setMembers(data);
    setIsLoading(false);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || m.relationship.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [search, filter, members]);

  const relationships = ["all", ...new Set(members.map(m => m.relationship))];

  const handleAddClick = () => {
    setFormData({
      fullName: "",
      relationship: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "male",
      address: "",
      notes: "",
      photoUrl: AVATAR_PLACEHOLDER,
      deathAnniversaryDate: null
    });
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (member: FamilyMember) => {
    setFormData({...member});
    setIsEditing(true);
    setIsFormModalOpen(true);
    setIsViewModalOpen(false);
  };

  const handleWishesClick = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsWishesModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Robust check: Limit size for localStorage simulation
      const MAX_SIZE = 1 * 1024 * 1024; // 1MB
      if (file.size > MAX_SIZE) {
        toast.error("Photo is too large (Max 1MB for secure storage simulation)");
        return;
      }

      setIsUploading(true);
      try {
        const photoUrl = await api.uploadImage(file);
        setFormData(prev => ({ ...prev, photoUrl }));
        toast.success(t('members.form.photo_success') || "Photo uploaded successfully");
      } catch (err) {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const memberToSave = {
        ...formData,
        id: isEditing && formData.id ? formData.id : Math.random().toString(36).substr(2, 9),
      } as FamilyMember;

      await api.saveMember(memberToSave);
      await loadMembers();
      
      toast.success(isEditing ? "Profile updated in PostgreSQL" : "New member added to database");
      setIsFormModalOpen(false);
    } catch (error) {
      toast.error("Database operation failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await api.deleteMember(id);
      await loadMembers();
      toast.success("Record purged from database");
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const canEdit = (member: FamilyMember) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return member.email === user.role + "@family.com";
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="relative rounded-[3.5rem] overflow-hidden bg-primary p-12 lg:p-20 shadow-heritage">
         <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/family-hero-bg-f56e56d6-1777147758367.webp" 
          alt="Hero Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge className="bg-accent text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">
             {t('members.badge')}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-serif font-black text-white leading-[0.9]">{t('members.title')}</h1>
          <p className="text-white/80 font-medium text-lg">
            {t('members.subtitle')}
          </p>
          <div className="pt-6">
            {user?.role === "admin" && (
              <Button 
                onClick={handleAddClick}
                className="bg-accent hover:bg-accent/90 text-white h-16 px-10 rounded-2xl shadow-xl shadow-accent/20 font-black text-lg transition-all active:scale-95 group"
              >
                <Plus size={24} className="mr-2 group-hover:rotate-90 transition-transform duration-500" />
                {t('members.add')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={22} />
          <Input 
            placeholder={t('members.search')} 
            className="pl-16 h-18 bg-white border-border w-full shadow-heritage rounded-[2rem] focus:ring-primary focus:border-primary text-lg transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex overflow-x-auto gap-4 py-2 no-scrollbar px-1">
          {relationships.map(rel => (
            <button 
              key={rel}
              className={cn(
                "capitalize px-8 py-3.5 whitespace-nowrap text-sm font-black transition-all rounded-[1.5rem] border-2 active:scale-95",
                filter === rel 
                  ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                  : "bg-white border-border text-muted-foreground hover:border-primary/20 hover:bg-secondary"
              )}
              onClick={() => setFilter(rel)}
            >
              {rel === 'all' ? t('common.all') : rel}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
           <Loader2 className="animate-spin text-primary" size={64} />
           <p className="text-muted-foreground font-black tracking-[0.2em] uppercase text-xs">{t('members.syncing')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                onClick={() => {
                  setSelectedMember(member);
                  setIsViewModalOpen(true);
                }}
                className="cursor-pointer group"
              >
                <Card className="h-full overflow-hidden border-none shadow-heritage hover:shadow-2xl transition-all duration-700 bg-white rounded-[2.5rem] relative">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="h-40 bg-secondary relative overflow-hidden group-hover:h-44 transition-all duration-700">
                      <div className="absolute inset-0 heritage-gradient opacity-10" />
                      <div className="absolute -bottom-14 left-8 group-hover:-bottom-12 transition-all duration-700">
                        <div className="w-32 h-32 rounded-[2.5rem] border-[6px] border-white overflow-hidden shadow-2xl bg-white group-hover:scale-105 transition-transform duration-700 ring-8 ring-secondary/30">
                          <img 
                            src={member.photoUrl} 
                            alt={member.fullName} 
                            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-20 px-10 pb-10 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-6">
                        <div className="min-w-0">
                          <h3 className="text-2xl font-serif font-black text-primary truncate leading-tight">
                            {member.fullName}
                          </h3>
                          <Badge variant="secondary" className="mt-2 font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-accent/10 text-accent border-none">
                             {member.relationship}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground hover:text-primary hover:bg-secondary rounded-2xl">
                              <MoreVertical size={24} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-3 shadow-2xl border-border">
                            <DropdownMenuItem className="rounded-xl py-4 font-bold cursor-pointer" onClick={() => {
                              setSelectedMember(member);
                              setIsViewModalOpen(true);
                            }}>
                              <Info size={20} className="mr-3 text-primary" />
                              {t('members.profile')}
                            </DropdownMenuItem>
                            {canEdit(member) && (
                              <DropdownMenuItem className="rounded-xl py-4 font-bold cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(member);
                              }}>
                                <Edit size={20} className="mr-3 text-emerald-600" />
                                {t('members.modify')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="rounded-xl py-4 font-bold cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                handleWishesClick(member);
                            }}>
                              <Heart size={20} className="mr-3 text-accent" />
                              {t('members.blessings')}
                            </DropdownMenuItem>
                            {user?.role === "admin" && (
                              <DropdownMenuItem 
                                className="text-red-600 rounded-xl py-4 font-bold cursor-pointer hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMember(member.id);
                                }}
                              >
                                <Trash2 size={20} className="mr-3" />
                                {t('members.purge')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-5 mt-auto">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground group/item">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-all">
                            <Mail size={16} />
                          </div>
                          <span className="truncate font-bold tracking-tight">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground group/item">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-all">
                            <Phone size={16} />
                          </div>
                          <span className="font-bold tracking-tight">{member.phoneNumber}</span>
                        </div>
                      </div>

                      <div className="pt-8 mt-8 flex items-center justify-between border-t border-border">
                         <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t('members.verified')}</span>
                         </div>
                         <ChevronRight size={20} className="text-muted-foreground group-hover:translate-x-2 transition-transform duration-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          <div className="heritage-gradient p-10 text-white relative">
             <DialogTitle className="text-3xl font-serif font-black">
               {isEditing ? t('members.form.title_edit') : t('members.form.title_add')}
             </DialogTitle>
             <p className="text-white/70 text-sm mt-2 font-medium">{t('members.form.subtitle') || "Synchronizing heritage metadata with encrypted vault."}</p>
          </div>
          <form onSubmit={handleFormSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[75vh] no-scrollbar">
             <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative">
                   <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-secondary group relative">
                      <img 
                        src={formData.photoUrl || AVATAR_PLACEHOLDER} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                           <Loader2 className="animate-spin text-white" size={32} />
                        </div>
                      )}
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white gap-1"
                      >
                         <Camera size={24} />
                         <span className="text-[8px] font-black uppercase tracking-widest">{t('members.form.photo_change') || "Change"}</span>
                      </button>
                   </div>
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                   />
                </div>
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">{t('members.form.photo')}</Label>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('members.form.full_name')}</Label>
                   <Input 
                     required 
                     value={formData.fullName} 
                     onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                     className="h-14 rounded-2xl bg-secondary/20 border-border focus:bg-white"
                   />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('members.form.relationship')}</Label>
                   <Input 
                     required 
                     value={formData.relationship} 
                     onChange={(e) => setFormData({...formData, relationship: e.target.value})} 
                     className="h-14 rounded-2xl bg-secondary/20 border-border focus:bg-white"
                   />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('members.form.email')}</Label>
                   <Input 
                     type="email"
                     required 
                     value={formData.email} 
                     onChange={(e) => setFormData({...formData, email: e.target.value})} 
                     className="h-14 rounded-2xl bg-secondary/20 border-border focus:bg-white"
                   />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('members.form.phone')}</Label>
                   <Input 
                     required 
                     value={formData.phoneNumber} 
                     onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                     className="h-14 rounded-2xl bg-secondary/20 border-border focus:bg-white"
                   />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('members.form.dob')}</Label>
                   <Input 
                     type="date"
                     required 
                     value={formData.dateOfBirth} 
                     onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} 
                     className="h-14 rounded-2xl bg-secondary/20 border-border focus:bg-white"
                   />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('members.form.gender')}</Label>
                   <Select 
                      value={formData.gender} 
                      onValueChange={(v: any) => setFormData({...formData, gender: v})}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-secondary/20 border-border focus:bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border">
                        <SelectItem value="male" className="rounded-xl">{t('members.form.male')}</SelectItem>
                        <SelectItem value="female" className="rounded-xl">{t('members.form.female')}</SelectItem>
                        <SelectItem value="other" className="rounded-xl">{t('members.form.other')}</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-3 md:col-span-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('members.form.address')}</Label>
                   <Input 
                     value={formData.address} 
                     onChange={(e) => setFormData({...formData, address: e.target.value})} 
                     className="h-14 rounded-2xl bg-secondary/20 border-border focus:bg-white"
                   />
                </div>
                <div className="space-y-3 md:col-span-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('members.form.notes')}</Label>
                   <Textarea 
                     value={formData.notes} 
                     onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                     className="min-h-[120px] rounded-2xl bg-secondary/20 border-border focus:bg-white resize-none"
                   />
                </div>
             </div>
             <DialogFooter className="pt-8 flex gap-4">
                <Button type="button" variant="ghost" onClick={() => setIsFormModalOpen(false)} className="rounded-2xl h-14 font-black flex-1">{t('common.cancel')}</Button>
                <Button type="submit" disabled={isSaving || isUploading} className="heritage-gradient text-white h-14 px-8 rounded-2xl font-black flex-[2] shadow-xl shadow-primary/20">
                   {isSaving ? (
                     <><Loader2 className="mr-2 animate-spin" /> {t('members.form.saving')}</>
                   ) : (
                     <><ShieldCheck className="mr-2" /> {t('members.form.save')}</>
                   )}
                </Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
           {selectedMember && (
             <div className="flex flex-col h-full">
                <div className="h-64 relative overflow-hidden">
                   <img 
                    src={selectedMember.photoUrl} 
                    className="w-full h-full object-cover"
                    alt={selectedMember.fullName}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                   <button 
                    onClick={() => setIsViewModalOpen(false)}
                    className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all"
                   >
                      <X size={24} />
                   </button>
                   <div className="absolute bottom-8 left-8 text-white">
                      <Badge className="bg-accent text-white border-none mb-3">{selectedMember.relationship}</Badge>
                      <h2 className="text-4xl font-serif font-black">{selectedMember.fullName}</h2>
                   </div>
                </div>
                <div className="p-10 space-y-8 bg-white overflow-y-auto max-h-[50vh] no-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                            <Mail size={20} />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</span>
                            <span className="font-bold">{selectedMember.email}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                            <Phone size={20} />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</span>
                            <span className="font-bold">{selectedMember.phoneNumber}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                            <Calendar size={20} />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Birth Date</span>
                            <span className="font-bold">{selectedMember.dateOfBirth}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                            <MapPin size={20} />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Residence</span>
                            <span className="font-bold">{selectedMember.address}</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                         <FileText size={18} className="text-accent" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary">Historical Notes</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed font-medium bg-secondary/20 p-6 rounded-3xl">
                        {selectedMember.notes || "No archival notes available for this member."}
                      </p>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <Button 
                        className="flex-1 h-14 rounded-2xl heritage-gradient text-white font-black shadow-lg shadow-primary/20"
                        onClick={() => handleWishesClick(selectedMember)}
                      >
                         <Heart size={20} className="mr-2" />
                         Send Blessing
                      </Button>
                      {canEdit(selectedMember) && (
                        <Button 
                          variant="secondary" 
                          className="w-14 h-14 rounded-2xl border-border bg-white p-0"
                          onClick={() => handleEditClick(selectedMember)}
                        >
                           <Edit size={24} />
                        </Button>
                      )}
                   </div>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>

      {/* Wishes Modal */}
      {selectedMember && (
        <SendWishesModal 
          isOpen={isWishesModalOpen}
          onClose={() => setIsWishesModalOpen(false)}
          recipientId={selectedMember.id}
          recipientName={selectedMember.fullName}
          recipientEmail={selectedMember.email}
          recipientPhone={selectedMember.phoneNumber}
        />
      )}
    </div>
  );
}