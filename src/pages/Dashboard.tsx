import { useContext, useState, useMemo, useEffect } from "react";
import { AuthContext } from "@/App";
import { api } from "@/lib/db";
import { useTranslation } from "react-i18next";
import { 
  Users, 
  Cake, 
  Heart, 
  Calendar as CalendarIcon, 
  ArrowUpRight,
  ShieldCheck,
  History,
  Network,
  Fingerprint
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FamilyMember } from "@/lib/types";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import SendWishesModal from "@/components/features/SendWishesModal";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string; email: string; phone: string } | null>(null);
  
  useEffect(() => {
    api.getMembers().then(setMembers);
  }, []);

  const stats = [
    { label: t('dashboard.stats.records'), value: members.length, icon: Users, color: "bg-primary" },
    { label: t('dashboard.stats.documents'), value: "1,248", icon: History, color: "bg-emerald-800" },
    { label: t('dashboard.stats.generations'), value: "4", icon: Network, color: "bg-accent" },
    { label: t('dashboard.stats.clusters'), value: "Primary", icon: Fingerprint, color: "bg-primary/90" },
  ];

  const upcomingBirthdays = useMemo(() => {
    return members
      .filter(m => !m.deathAnniversaryDate)
      .map(m => ({
        id: m.id,
        name: m.fullName,
        date: m.dateOfBirth,
        type: "Birthday",
        email: m.email,
        phone: m.phoneNumber
      }))
      .sort((a, b) => new Date(a.date).getMonth() - new Date(b.date).getMonth())
      .slice(0, 3);
  }, [members]);

  return (
    <div className="space-y-16 pb-20">
      {/* Welcome Hero - Modern Heritage Style */}
      <section className="relative rounded-[4rem] overflow-hidden bg-primary p-12 lg:p-20 shadow-heritage min-h-[480px] flex items-center">
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/dashboard-hero-bg-0b1359ca-1777148042440.webp" 
          alt="Family Tree Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-soft-light scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-transparent" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 w-full">
           <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-2 rounded-full border border-white/20 shadow-2xl">
                 <ShieldCheck size={16} className="text-accent" />
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t('common.vault_encrypted')}</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif font-black text-white leading-[0.85] tracking-tighter">
                {t('dashboard.hero.title')}
              </h1>
              <p className="text-white/70 font-medium text-xl max-w-xl leading-relaxed mx-auto lg:mx-0">
                {t('dashboard.hero.subtitle')}
              </p>
              <div className="pt-6 flex flex-wrap justify-center lg:justify-start gap-6">
                <Button asChild className="bg-accent hover:bg-accent/90 text-white h-18 px-12 rounded-2xl font-black text-lg shadow-2xl shadow-accent/30 transition-all active:scale-95">
                  <Link to="/archives">{t('dashboard.hero.access')}</Link>
                </Button>
                {user?.role === "admin" && (
                  <Button variant="outline" asChild className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-18 px-10 rounded-2xl font-black text-lg backdrop-blur-md">
                    <Link to="/members">{t('dashboard.hero.register')}</Link>
                  </Button>
                )}
              </div>
           </div>
           
           <div className="hidden xl:block relative group">
              <div className="absolute -inset-4 bg-accent/20 rounded-[4rem] blur-2xl group-hover:bg-accent/30 transition-all duration-1000" />
              <div className="relative w-[420px] h-[520px] rounded-[3.5rem] overflow-hidden border-[12px] border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rotate-2 group-hover:rotate-0 transition-all duration-1000 ease-out">
                <img 
                  src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/archives-header-bg-3750f730-1777148043607.webp" 
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" 
                  alt="Ancestral Records" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              </div>
           </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
          >
            <Card className="border-none shadow-heritage hover:shadow-2xl transition-all duration-700 rounded-[2.5rem] bg-white group p-3">
              <CardContent className="p-8 flex flex-col items-center text-center gap-6">
                <div className={cn("w-20 h-20 rounded-3xl text-white flex items-center justify-center shadow-xl transition-all group-hover:scale-110 group-hover:-rotate-6 duration-500", stat.color)}>
                  <stat.icon size={32} />
                </div>
                <div>
                  <p className="text-4xl font-serif font-black text-primary leading-none">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.25em] mt-3">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Feed Section */}
        <div className="lg:col-span-2 space-y-10">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-3xl font-serif font-black text-primary">{t('dashboard.milestones.title')}</h3>
              <Button variant="ghost" className="text-accent hover:text-accent/80 font-black text-sm tracking-widest uppercase flex items-center gap-3" asChild>
                 <Link to="/calendar">{t('dashboard.milestones.view')} <ArrowUpRight size={20} /></Link>
              </Button>
           </div>
           
           <div className="grid gap-8">
              {upcomingBirthdays.map((event, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col sm:flex-row items-center justify-between p-10 rounded-[3rem] bg-white border border-border hover:border-accent/30 hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-accent opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="flex items-center gap-10">
                    <div className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500",
                      event.type === "Birthday" ? "bg-accent/5 text-accent" : "bg-primary/5 text-primary"
                    )}>
                      {event.type === "Birthday" ? <Cake size={36} /> : <Heart size={36} />}
                    </div>
                    <div>
                      <p className="text-2xl font-serif font-black text-primary">{event.name}'s {event.type === "Birthday" ? t('calendar.birthdays') : t('calendar.memorials')}</p>
                      <div className="flex items-center gap-3 mt-2">
                         <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                            {format(parseISO(event.date), "MMMM do")}
                         </p>
                         <div className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                         <p className="text-xs font-bold text-accent">{t('members.verified')}</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedMember({ id: event.id, name: event.name, email: event.email, phone: event.phone })}
                    className="mt-6 sm:mt-0 rounded-2xl border-2 border-primary/10 text-primary font-black px-10 h-14 hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    {t('dashboard.milestones.send')}
                  </Button>
                </motion.div>
              ))}
              {upcomingBirthdays.length === 0 && (
                 <div className="text-center py-28 bg-white rounded-[3.5rem] border-2 border-dashed border-border flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mb-6 text-muted-foreground/30">
                       <CalendarIcon size={40} />
                    </div>
                    <h4 className="text-xl font-serif font-black text-primary">{t('dashboard.milestones.empty')}</h4>
                    <p className="text-muted-foreground font-medium max-w-xs mt-2">{t('dashboard.milestones.empty_desc')}</p>
                 </div>
              )}
           </div>
        </div>

        {/* Sidebar Mini Directory */}
        <div className="space-y-10">
           <div className="px-2">
              <h3 className="text-3xl font-serif font-black text-primary">{t('dashboard.registry.title')}</h3>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">{t('dashboard.registry.subtitle')}</p>
           </div>
           <Card className="border-none shadow-heritage rounded-[3rem] bg-white overflow-hidden p-4">
              <CardContent className="p-8 space-y-10">
                {members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-5 group cursor-pointer">
                    <div className="relative shrink-0">
                       <div className="w-16 h-16 rounded-[1.5rem] p-1 bg-secondary group-hover:bg-accent/20 transition-all duration-500">
                          <img src={member.photoUrl} alt={member.fullName} className="w-full h-full rounded-[1.25rem] object-cover shadow-sm" />
                       </div>
                       <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-black text-primary truncate tracking-tight">{member.fullName}</p>
                      <p className="text-[9px] text-accent font-black uppercase tracking-[0.2em] mt-1">{member.relationship}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-secondary text-primary/40 hover:text-primary transition-all active:scale-90" asChild>
                      <Link to="/members">
                        <ArrowUpRight size={22} />
                      </Link>
                    </Button>
                  </div>
                ))}
                <div className="pt-6">
                  <Button className="w-full h-16 rounded-2xl bg-secondary text-primary hover:bg-primary hover:text-white border-none font-black text-lg shadow-sm transition-all group active:scale-95" asChild>
                    <Link to="/members">
                      {t('dashboard.registry.complete')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
           </Card>

           <div className="p-10 bg-accent/5 rounded-[3rem] border border-accent/10 flex flex-col items-center text-center gap-4">
              <ShieldCheck size={40} className="text-accent" />
              <h4 className="font-serif font-black text-xl text-primary">{t('dashboard.security.verified')}</h4>
              <p className="text-xs text-muted-foreground font-medium">{t('dashboard.security.desc')}</p>
           </div>
        </div>
      </div>

      <SendWishesModal 
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        recipientId={selectedMember?.id || ""}
        recipientName={selectedMember?.name || ""}
        recipientEmail={selectedMember?.email}
        recipientPhone={selectedMember?.phone}
      />
    </div>
  );
}