import { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/db";
import { FamilyMember } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cake, Heart, ChevronRight, Bell, Calendar as CalendarIcon, Flower2, ShieldCheck, History } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function CalendarPage() {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    api.getMembers().then(setMembers);
  }, []);

  const events = useMemo(() => {
    const list: any[] = [];
    members.forEach(m => {
      if (m.dateOfBirth) {
        list.push({
          id: `b-${m.id}`,
          title: `${m.fullName}'s ${t('calendar.birthdays')}`,
          date: parseISO(m.dateOfBirth),
          type: "birthday",
          member: m
        });
      }
      const deathDate = m.deathAnniversaryDate || m.dateOfDeath;
      if (deathDate) {
        list.push({
          id: `d-${m.id}`,
          title: `${t('calendar.memorials')}: ${m.fullName}`,
          date: parseISO(deathDate),
          type: "death_anniversary",
          member: m
        });
      }
      if (m.anniversaries && m.anniversaries.length > 0) {
        m.anniversaries.forEach(anniv => {
          list.push({
            id: `a-${anniv.id}`,
            title: `${m.fullName}'s ${anniv.title}`,
            date: parseISO(anniv.date),
            type: "anniversary",
            member: m
          });
        });
      }
    });
    return list;
  }, [members, t]);

  const selectedDateEvents = useMemo(() => {
    if (!date) return [];
    return events.filter(e => {
       const eventDate = new Date(e.date);
       return eventDate.getDate() === date.getDate() && eventDate.getMonth() === date.getMonth();
    });
  }, [date, events]);

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Calendar Card */}
        <Card className="flex-1 border-none shadow-heritage bg-white rounded-[3rem] overflow-hidden">
          <CardHeader className="p-10 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-6 bg-secondary/30">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 heritage-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <CalendarIcon size={24} />
               </div>
               <div>
                  <CardTitle className="text-3xl font-serif font-black text-primary">
                    {t('calendar.title')}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm font-medium">{t('calendar.subtitle')}</p>
               </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-accent/10 text-accent border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{t('calendar.birthdays')}</Badge>
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{t('calendar.memorials')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-[2.5rem] border-none shadow-sm w-full"
              onMonthChange={setCurrentMonth}
              modifiers={{
                event: (d) => events.some(e => e.date.getDate() === d.getDate() && e.date.getMonth() === d.getMonth())
              }}
              modifiersClassNames={{
                event: "font-black text-primary ring-2 ring-accent/30 rounded-full bg-accent/5"
              }}
            />
          </CardContent>
        </Card>

        {/* Events Sidebar */}
        <div className="w-full lg:w-[400px] space-y-8">
          <Card className="border-none shadow-heritage heritage-gradient text-white rounded-[2.5rem] overflow-hidden p-2">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-serif font-black">{t('calendar.ledger')}</h3>
                 <div className="p-2 bg-white/10 rounded-xl">
                    <Bell size={24} />
                 </div>
              </div>
              
              <div className="space-y-4">
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map(e => (
                    <div key={e.id} className="p-6 bg-white/10 rounded-[1.5rem] border border-white/20 backdrop-blur-md">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-primary">
                           {e.type === 'birthday' ? <Cake size={24} /> : <Heart size={24} />}
                         </div>
                         <div className="min-w-0">
                           <p className="font-serif font-black text-lg leading-tight">{e.title}</p>
                           <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-1">{e.member.relationship}</p>
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-white/50 space-y-3">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mx-auto">
                      <CalendarIcon size={24} />
                    </div>
                    <p className="font-bold italic">{t('calendar.no_records')}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                 <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('calendar.secure_reminders')}</span>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-heritage bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4 border-b border-border bg-secondary/20">
              <CardTitle className="text-xl font-serif font-black flex items-center gap-3">
                <History className="text-primary" size={22} />
                {format(currentMonth, "MMMM")} {t('calendar.heritage')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {events
                    .filter(e => e.date.getMonth() === currentMonth.getMonth())
                    .sort((a, b) => a.date.getDate() - b.date.getDate())
                    .map(e => (
                    <div key={e.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/50 transition-all cursor-pointer group">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform",
                        e.type === 'birthday' ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                      )}>
                        {e.type === 'birthday' ? <Cake size={20} /> : <Flower2 size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-md font-bold text-primary group-hover:text-accent transition-colors truncate">
                          {e.title}
                        </p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {format(e.date, "MMMM do")} • {e.member.relationship}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}