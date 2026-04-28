import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Heart, 
  ShieldCheck, 
  Loader2, 
  Paperclip, 
  X,
  FileIcon,
  ImageIcon,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/db";
import { WishAttachment } from "@/lib/types";

interface SendWishesModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
}

export default function SendWishesModal({ 
  isOpen, 
  onClose, 
  recipientId,
  recipientName,
  recipientEmail,
  recipientPhone 
}: SendWishesModalProps) {
  const { t } = useTranslation();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [attachments, setAttachments] = useState<WishAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Filter out files that are too large (max 1MB for localStorage simulation)
    const MAX_SIZE = 1 * 1024 * 1024;
    const oversizedFiles = Array.from(files).filter(f => f.size > MAX_SIZE);
    
    if (oversizedFiles.length > 0) {
      toast.error("Some files are too large (Max 1MB for simulated storage)");
      return;
    }

    setIsUploading(true);
    try {
      const newAttachments: WishAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const result = await api.uploadFile(files[i]);
        newAttachments.push(result);
      }
      setAttachments(prev => [...prev, ...newAttachments]);
      toast.success(t('wishes.upload_success') || "Files attached successfully");
    } catch (err) {
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    setIsSending(true);
    try {
      await api.saveWish({
        id: Math.random().toString(36).substr(2, 9),
        recipientId,
        recipientName,
        message,
        method,
        attachments,
        sentAt: new Date().toISOString()
      });
      
      setIsSent(true);
      toast.success(`${t('wishes.success_title')} to ${recipientName.split(' ')[0]}`);
      
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setIsSent(false);
          setMessage("");
          setAttachments([]);
        }, 300);
      }, 2000);
    } catch (err) {
      toast.error("Failed to send wish");
    } finally {
      setIsSending(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={14} className="text-blue-500" />;
    if (type.includes('pdf')) return <FileText size={14} className="text-red-500" />;
    return <FileIcon size={14} className="text-amber-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="relative h-44 heritage-gradient overflow-hidden flex items-center justify-center">
                <img 
                  src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/family-hero-bg-f56e56d6-1777147758367.webp"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                  alt="Wishes banner"
                />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="relative z-10"
                >
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                    <Heart className="text-white w-10 h-10" fill="var(--color-accent)" />
                  </div>
                </motion.div>
              </div>

              <div className="p-8 space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-serif font-black text-primary text-center">{t('wishes.title')}</DialogTitle>
                  <DialogDescription className="text-center font-medium">
                    {t('wishes.subtitle')} <span className="text-primary font-bold">{recipientName}</span>.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMethod("email")}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all gap-2",
                      method === "email" 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-border bg-white text-muted-foreground hover:border-primary/20"
                    )}
                  >
                    <Mail size={22} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t('wishes.method_mail')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("phone")}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all gap-2",
                      method === "phone" 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-border bg-white text-muted-foreground hover:border-primary/20"
                    )}
                  >
                    <MessageSquare size={22} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t('wishes.method_sms')}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('wishes.label_msg')}</Label>
                  <Textarea
                    id="message"
                    placeholder={t('wishes.placeholder_msg')}
                    className="min-h-[140px] rounded-[1.5rem] border-border bg-secondary/20 focus:bg-white transition-all text-base p-5"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('wishes.attachments')}</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 rounded-full text-accent font-black text-[10px] uppercase tracking-wider hover:bg-accent/10"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 size={14} className="animate-spin mr-1" /> : <Paperclip size={14} className="mr-1" />}
                      {t('wishes.add_attachment')}
                    </Button>
                    <input 
                      type="file" 
                      multiple 
                      hidden 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                    />
                  </div>

                  {attachments.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-2xl bg-secondary/10 border border-border/50">
                      {attachments.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-border group hover:border-primary/30 transition-colors shadow-sm">
                          {getFileIcon(file.type)}
                          <span className="text-[10px] font-bold truncate max-w-[120px]">{file.name}</span>
                          <button 
                            onClick={() => removeAttachment(i)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-border/50 rounded-2xl bg-secondary/5 group-hover:border-primary/20 transition-colors">
                      <p className="text-[10px] font-medium text-muted-foreground italic">{t('wishes.no_attachments')}</p>
                    </div>
                  )}
                </div>

                <DialogFooter className="sm:justify-between gap-4 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="rounded-2xl h-14 px-8 font-black"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending || isUploading}
                    className="heritage-gradient text-white rounded-2xl flex-1 h-14 shadow-xl shadow-primary/20 font-black text-lg"
                  >
                    {isSending ? (
                      <><Loader2 className="mr-2 animate-spin" size={20} /> {t('wishes.btn_sending')}</>
                    ) : (
                      <><Send size={20} className="mr-2" /> {t('wishes.btn_send')}</>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-28 h-28 heritage-gradient text-white rounded-full flex items-center justify-center shadow-2xl mb-4">
                <ShieldCheck size={56} />
              </div>
              <h2 className="text-4xl font-serif font-black text-primary">{t('wishes.success_title')}</h2>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                {t('wishes.success_desc')}
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                 <ShieldCheck size={14} />
                 Vault Transaction Authenticated
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}