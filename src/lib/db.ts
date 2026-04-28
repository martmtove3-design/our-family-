import { FamilyMember, Document, Announcement, Wish, WishAttachment } from "./types";
import { MOCK_MEMBERS, MOCK_ANNOUNCEMENTS } from "./mockData";

const MEMBERS_KEY = "family_hub_members_v2_pg";
const ARCHIVES_KEY = "family_hub_archives_v2_pg";
const ANNOUNCEMENTS_KEY = "family_hub_announcements_v2_pg";
const WISHES_KEY = "family_hub_wishes_v2_pg";

/**
 * UTILITY: Convert File to Base64 for robust localStorage persistence
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * SIMULATED POSTGRESQL API SERVICE
 * In a real application, these would be fetch calls to a REST API.
 */

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Mock REST client that simulates communication with a PostgreSQL backend
export const api = {
  // Members (PostgreSQL)
  getMembers: async (): Promise<FamilyMember[]> => {
    await delay(300);
    const data = localStorage.getItem(MEMBERS_KEY);
    if (!data) {
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(MOCK_MEMBERS));
      return MOCK_MEMBERS;
    }
    return JSON.parse(data);
  },

  saveMember: async (member: FamilyMember): Promise<FamilyMember> => {
    await delay(500);
    const members = await api.getMembers();
    const index = members.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    return member;
  },

  deleteMember: async (id: string): Promise<void> => {
    await delay(400);
    const members = await api.getMembers();
    const filtered = members.filter((m) => m.id !== id);
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(filtered));
  },

  // Archives (PostgreSQL + S3 Storage Simulation)
  getArchives: async (): Promise<Document[]> => {
    await delay(300);
    const data = localStorage.getItem(ARCHIVES_KEY);
    if (!data) {
      const initialArchives: Document[] = [
        {
          id: "doc-1",
          memberId: "1",
          title: "Wedding Certificate 1945",
          url: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/archives-header-bg-3750f730-1777148043607.webp",
          type: "image",
          uploadedAt: "2024-01-15",
        },
        {
          id: "doc-2",
          memberId: "6",
          title: "Military Discharge Papers",
          url: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800",
          type: "pdf",
          uploadedAt: "2024-02-10",
        }
      ];
      localStorage.setItem(ARCHIVES_KEY, JSON.stringify(initialArchives));
      return initialArchives;
    }
    return JSON.parse(data);
  },

  saveArchive: async (doc: Document): Promise<Document> => {
    await delay(600);
    const archives = await api.getArchives();
    archives.push(doc);
    localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archives));
    return doc;
  },

  deleteArchive: async (id: string): Promise<void> => {
    await delay(400);
    const archives = await api.getArchives();
    const filtered = archives.filter((a) => a.id !== id);
    localStorage.setItem(ARCHIVES_KEY, JSON.stringify(filtered));
  },

  /**
   * Secure Server-Side Storage Simulation (e.g., AWS S3 via REST API)
   * Converts to Base64 for actual persistence in the simulated database.
   */
  uploadImage: async (file: File): Promise<string> => {
    await delay(1200); // Simulate upload latency and server processing
    return await fileToBase64(file);
  },

  /**
   * Enhanced generic file upload for documents and attachments
   */
  uploadFile: async (file: File): Promise<WishAttachment> => {
    await delay(1200);
    const base64 = await fileToBase64(file);
    return {
      name: file.name,
      url: base64,
      type: file.type
    };
  },

  // Announcements
  getAnnouncements: async (): Promise<Announcement[]> => {
    await delay(300);
    const data = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (!data) {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(MOCK_ANNOUNCEMENTS));
      return MOCK_ANNOUNCEMENTS;
    }
    return JSON.parse(data);
  },

  saveAnnouncement: async (announcement: Announcement): Promise<Announcement> => {
    await delay(500);
    const announcements = await api.getAnnouncements();
    announcements.unshift(announcement);
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    return announcement;
  },

  // Wishes
  getWishes: async (): Promise<Wish[]> => {
    await delay(300);
    const data = localStorage.getItem(WISHES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveWish: async (wish: Wish): Promise<Wish> => {
    await delay(800);
    const wishes = await api.getWishes();
    wishes.unshift(wish);
    localStorage.setItem(WISHES_KEY, JSON.stringify(wishes));
    return wish;
  }
};

export const db = api;