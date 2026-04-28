import { useMemo, useEffect, useState } from "react";
import { api } from "@/lib/db";
import { FamilyMember } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Network, ShieldCheck, TreePine, ChevronRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface TreeNodeProps {
  memberId: string;
  depth: number;
  members: FamilyMember[];
  t: any;
}

const TreeNode = ({ memberId, depth, members, t }: TreeNodeProps) => {
  const member = members.find(m => m.id === memberId);
  const children = members.filter(m => m.parentId === memberId);

  if (!member) return null;

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.1, duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="bg-white p-6 rounded-[2.5rem] shadow-heritage border-none w-56 text-center group hover:shadow-2xl transition-all duration-500 cursor-pointer">
          <div className="w-20 h-20 rounded-[1.5rem] mx-auto mb-4 border-4 border-secondary shadow-lg overflow-hidden bg-white ring-4 ring-primary/5">
            <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
          </div>
          <h4 className="font-serif font-black text-primary truncate text-lg">{member.fullName}</h4>
          <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mt-2">{member.relationship}</p>
          
          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
             <Badge variant="outline" className="rounded-full border-primary/20 text-primary px-3 py-1">
                <Info size={12} className="mr-1" /> {t('tree.details')}
             </Badge>
          </div>
        </Card>
      </motion.div>

      {children.length > 0 && (
        <div className="relative pt-12 w-full flex justify-center">
          {/* Vertical line from parent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-12 bg-primary/5"></div>
          
          {/* Horizontal connecting line */}
          {children.length > 1 && (
            <div className="absolute top-12 left-[15%] right-[15%] h-1 bg-primary/5 rounded-full"></div>
          )}
          
          <div className="flex gap-16 mt-0">
            {children.map(child => (
              <div key={child.id} className="relative">
                {/* Vertical line to child */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-1 h-12 bg-primary/5"></div>
                <TreeNode memberId={child.id} depth={depth + 1} members={members} t={t} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Tree() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  
  useEffect(() => {
    api.getMembers().then(setMembers);
  }, []);

  const rootMembers = useMemo(() => members.filter(m => !m.parentId), [members]);

  return (
    <div className="min-h-[calc(100vh-12rem)] pb-20">
      <div className="flex flex-col items-center min-w-[1000px] py-12">
        <div className="text-center mb-24 max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 heritage-gradient text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl ring-[12px] ring-primary/5">
            <TreePine size={40} />
          </div>
          <h2 className="text-5xl font-serif font-black text-primary tracking-tighter">{t('tree.title')}</h2>
          <p className="text-muted-foreground text-lg font-medium">
            {t('tree.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
             <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">
                <ShieldCheck size={14} className="mr-2" /> {t('tree.badge')}
             </Badge>
          </div>
        </div>

        <div className="space-y-32 px-20">
          {rootMembers.map(root => (
            <TreeNode key={root.id} memberId={root.id} depth={0} members={members} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}