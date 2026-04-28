import { useMemo, useEffect, useState } from "react";
import { api } from "@/lib/db";
import { FamilyMember } from "@/lib/types";
import { 
  Flower2, 
  Calendar, 
  Heart, 
  ChevronRight, 
  MapPin,
  ExternalLink,
  ShieldCheck,
  History,
  Bell
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, differenceInYears } from "date-fns";
import { useTranslation } from "react-i18next";

export default function DeathAnniversaries() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  
  useEffect(() => {
    api.getMembers().then(setMembers);
  }, []);

  const memorials = useMemo(() => {
    return members.filter(m => m.deathAnniversaryDate || m.dateOfDeath)
      .sort((a, b) => {
        const dateA = new Date(a.deathAnniversaryDate || a.dateOfDeath!);
        const dateB = new Date(b.deathAnniversaryDate || b.dateOfDeath!);
        return dateA.getMonth() - dateB.getMonth() || dateA.getDate() - dateB.getDate();
      });
  }, [members]);

  const upcomingMemorials = useMemo(() => {
    const today = new Date();
    return memorials.filter(m => {
      const deathDate = new Date(m.deathAnniversaryDate || m.dateOfDeath!);
      const anniversaryThisYear = new Date(today.getFullYear(), deathDate.getMonth(), deathDate.getDate());
      return anniversaryThisYear >= today;
    }).slice(0, 3);
  }, [memorials]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <div className="relative rounded-[3.5rem] overflow-hidden h-72 shadow-heritage group">
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/memorial-header-63db63d9-1777143721493.webp" 
          alt="Memorial Header" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent flex flex-col justify-end p-12 lg:p-16">
          <Badge className="bg-accent text-white border-none px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 w-fit">
             {t('memorials.badge')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-none">{t('memorials.title')}</h1>
          <p className="text-white/70 max-w-2xl text-lg font-medium mt-4">{t('memorials.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
             <h2 className="text-3xl font-serif font-black text-primary flex items-center gap-4">
               <Flower2 className="text-accent" size={32} />
               {t('memorials.records')}
             </h2>
          </div>
          
          <div className="grid gap-8">
            <AnimatePresence mode="popLayout">
              {memorials.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <Card className="group overflow-hidden border-none shadow-heritage hover:shadow-2xl transition-all duration-700 rounded-[2.5rem] bg-white">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-56 h-56 md:h-auto overflow-hidden relative">
                          <img 
                            src={member.photoUrl} 
                            alt={member.fullName} 
                            className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                          />
                          <div className="absolute inset-0 heritage-gradient opacity-10" />
                        </div>
                        <div className="flex-1 p-10 flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-2xl font-serif font-black text-primary">{member.fullName}</h3>
                              <p className="text-xs font-black text-accent uppercase tracking-widest mt-1">{member.relationship}</p>
                            </div>
                            <Badge variant="secondary" className="bg-secondary/50 text-primary border-none px-4 py-1.5 font-black text-[10px] uppercase">
                              {t('memorials.solar_years', { count: differenceInYears(new Date(member.deathAnniversaryDate || member.dateOfDeath!), new Date(member.dateOfBirth)) })}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mt-6 mb-8">
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                                <Calendar size={18} />
                              </div>
                              <span className="text-sm font-bold">{format(parseISO(member.deathAnniversaryDate || member.dateOfDeath!), "MMMM do")} {t('memorials.anniversary')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                                <History size={18} />
                              </div>
                              <span className="text-sm font-bold">{t('memorials.passed_in', { year: format(parseISO(member.deathAnniversaryDate || member.dateOfDeath!), "yyyy") })}</span>
                            </div>
                          </div>

                          <div className="bg-secondary/20 p-6 rounded-2xl border-l-4 border-accent shadow-inner flex-1">
                             <p className="text-muted-foreground italic font-medium leading-relaxed">
                               "{member.notes || "A cherished part of our family heritage, remembered for a life well-lived and stories that will endure forever."}"
                             </p>
                          </div>
                          
                          <div className="mt-8 flex justify-end gap-4">
                            <Button variant="ghost" className="rounded-xl font-black text-primary">
                               <ExternalLink size={18} className="mr-2" /> {t('memorials.historical_context')}
                            </Button>
                            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-black px-6 h-12">
                               {t('memorials.tribute')} <ChevronRight size={18} className="ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {memorials.length === 0 && (
               <div className="text-center py-24 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border">
                  <History size={64} className="mx-auto text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground font-black tracking-widest uppercase text-xs">{t('memorials.no_records')}</p>
               </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <Card className="border-none shadow-heritage heritage-gradient text-white rounded-[2.5rem] overflow-hidden p-2">
            <CardContent className="p-10 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-white/10 rounded-2xl">
                    <Bell size={28} />
                 </div>
                 <h3 className="text-2xl font-serif font-black">{t('memorials.remembrance')}</h3>
              </div>
              <p className="text-white/70 font-medium">{t('memorials.remembrance_desc')}</p>
              
              <div className="space-y-4">
                {upcomingMemorials.map(m => (
                  <div key={m.id} className="flex items-center gap-5 p-5 bg-white/10 rounded-2xl border border-white/20">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Flower2 size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif font-black text-lg truncate leading-tight">{m.fullName}</p>
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">{format(parseISO(m.deathAnniversaryDate || m.dateOfDeath!), "MMMM do")}</p>
                    </div>
                  </div>
                ))}
                {upcomingMemorials.length === 0 && (
                   <div className="py-6 text-center">
                      <p className="text-sm italic text-white/50">The coming month is clear of anniversaries.</p>
                   </div>
                )}
              </div>
              <div className="pt-4 border-t border-white/10">
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Vault Records Secured</span>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-heritage bg-white rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                 <History size={22} className="text-primary" />
                 <h3 className="text-xl font-serif font-black text-primary">{t('memorials.archive_title')}</h3>
              </div>
              <p className="text-sm text-muted-foreground font-medium">{t('memorials.archive_desc')}</p>
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-square bg-secondary rounded-2xl overflow-hidden group cursor-pointer shadow-sm ring-1 ring-border">
                    <img src={`https://picsum.photos/seed/memorial${i}/300`} alt="Legacy" className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full h-12 rounded-xl font-black text-primary border-primary/10 hover:bg-secondary">
                {t('memorials.open_vault')} <ExternalLink size={16} className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}