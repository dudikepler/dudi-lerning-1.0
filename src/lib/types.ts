export type TherapistStatus = "pending" | "approved" | "rejected";
export type ReviewStatus = "pending" | "approved" | "rejected";

export type Therapist = {
  id: string;
  user_id: string;
  slug: string;
  full_name: string;
  title: string;
  bio: string;
  city: string;
  specialties: string[];
  phone: string;
  email: string;
  website: string;
  photo_url: string;
  status: TherapistStatus;
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: string;
  therapist_id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  therapist_id: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  created_at: string;
};
