import { ReactNode } from "react";

export type Role = "admin" | "member";

export interface Anniversary {
  id: string;
  title: string;
  date: string;
  type: "wedding" | "other";
}

export interface FamilyMember {
  id: string;
  fullName: string;
  photoUrl: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  dateOfDeath?: string; // Legacy
  deathAnniversaryDate?: string | null; // New field
  anniversary?: string; 
  anniversaries?: Anniversary[]; 
  phoneNumber: string;
  email: string;
  address: string;
  relationship: string;
  notes: string;
  parentId?: string; 
}

export interface Document {
  id: string;
  memberId: string;
  title: string;
  url: string;
  type: "pdf" | "image" | "certificate";
  uploadedAt: string;
}

export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  type: "birthday" | "anniversary" | "death_anniversary" | "other";
  memberId?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: "low" | "medium" | "high";
  image?: string;
}

export interface WishAttachment {
  name: string;
  url: string;
  type: string;
}

export interface Wish {
  id: string;
  recipientId: string;
  recipientName: string;
  message: string;
  method: "email" | "phone";
  attachments: WishAttachment[];
  sentAt: string;
}