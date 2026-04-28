import { FamilyMember, Announcement } from "./types";

export const MOCK_MEMBERS: FamilyMember[] = [
  {
    id: "1",
    fullName: "John Doe",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
    gender: "male",
    dateOfBirth: "1975-05-15",
    anniversary: "2000-06-20",
    anniversaries: [
      {
        id: "anniv-1",
        title: "Wedding Anniversary",
        date: "2000-06-20",
        type: "wedding"
      }
    ],
    phoneNumber: "+1 234 567 890",
    email: "john@example.com",
    address: "123 Family Lane, Springfield",
    relationship: "Head of House",
    notes: "The patriarch of the family.",
  },
  {
    id: "2",
    fullName: "Jane Doe",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
    gender: "female",
    dateOfBirth: "1978-08-22",
    anniversary: "2000-06-20",
    anniversaries: [
      {
        id: "anniv-2",
        title: "Wedding Anniversary",
        date: "2000-06-20",
        type: "wedding"
      }
    ],
    phoneNumber: "+1 234 567 891",
    email: "jane@example.com",
    address: "123 Family Lane, Springfield",
    relationship: "Wife",
    notes: "The matriarch of the family.",
    parentId: "1",
  },
  {
    id: "3",
    fullName: "Robert Doe",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
    gender: "male",
    dateOfBirth: "2005-03-10",
    phoneNumber: "+1 234 567 892",
    email: "robert@example.com",
    address: "123 Family Lane, Springfield",
    relationship: "Son",
    notes: "Studying computer science.",
    parentId: "1",
  },
  {
    id: "4",
    fullName: "Alice Doe",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    gender: "female",
    dateOfBirth: "2008-11-05",
    phoneNumber: "+1 234 567 893",
    email: "alice@example.com",
    address: "123 Family Lane, Springfield",
    relationship: "Daughter",
    notes: "Loves painting and music.",
    parentId: "1",
  },
  {
    id: "5",
    fullName: "Michael Smith",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
    gender: "male",
    dateOfBirth: "1980-12-12",
    anniversaries: [
      {
        id: "anniv-3",
        title: "Wedding Anniversary",
        date: "2010-07-15",
        type: "wedding"
      }
    ],
    phoneNumber: "+1 234 567 894",
    email: "michael@example.com",
    address: "456 Relative Road, Metropolis",
    relationship: "Uncle",
    notes: "Avid gardener.",
  },
  {
    id: "6",
    fullName: "William Doe",
    photoUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=200&h=200",
    gender: "male",
    dateOfBirth: "1940-03-12",
    deathAnniversaryDate: "2015-04-10",
    phoneNumber: "N/A",
    email: "william.legacy@example.com",
    address: "Springfield Cemetery",
    relationship: "Grandfather",
    notes: "A wise and kind soul who started our family legacy.",
  },
  {
    id: "7",
    fullName: "Eleanor Doe",
    photoUrl: "https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?auto=format&fit=crop&q=80&w=200&h=200",
    gender: "female",
    dateOfBirth: "1945-06-25",
    deathAnniversaryDate: "2018-11-12",
    phoneNumber: "N/A",
    email: "eleanor.legacy@example.com",
    address: "Springfield Cemetery",
    relationship: "Grandmother",
    notes: "Always remembered for her delicious pies and storytelling.",
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "Family Reunion 2024",
    content: "We are planning our annual family reunion in the mountain resort this July. Please save the dates from July 15th to 20th.",
    author: "Admin",
    date: "2024-03-01",
    priority: "high",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/d564fc62-b30e-4d82-b83a-2c24a7acad52/announcement-banner-4ccfac38-1777143719793.webp"
  },
  {
    id: "2",
    title: "New Family Member!",
    content: "Congratulations to Michael and Sarah on the arrival of baby Leo! Born yesterday at 2:00 PM.",
    author: "Michael Smith",
    date: "2024-02-28",
    priority: "medium"
  },
  {
    id: "3",
    title: "Digital Archive Update",
    content: "We've added 50+ new old photos to the gallery. Feel free to check the Documents section for the scanned legacy album.",
    author: "Admin",
    date: "2024-02-15",
    priority: "low"
  }
];