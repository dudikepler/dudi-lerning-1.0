import { z } from "zod";

export const RegisterSchema = z.object({
  fullName: z.string().min(2, "יש להזין שם מלא").trim(),
  email: z.string().email("כתובת אימייל לא תקינה").trim(),
  password: z
    .string()
    .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
    .regex(/[0-9]/, "הסיסמה חייבת להכיל לפחות ספרה אחת"),
  title: z.string().min(2, "יש להזין תואר מקצועי (למשל: פסיכולוג קליני)").trim(),
});

export const LoginSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה").trim(),
  password: z.string().min(1, "יש להזין סיסמה"),
});

export const ProfileSchema = z.object({
  fullName: z.string().min(2, "יש להזין שם מלא").trim(),
  title: z.string().min(2, "יש להזין תואר מקצועי").trim(),
  city: z.string().trim().max(100).optional().default(""),
  bio: z.string().trim().max(4000).optional().default(""),
  specialties: z.string().trim().max(500).optional().default(""),
  phone: z.string().trim().max(30).optional().default(""),
  email: z.union([z.literal(""), z.string().email("כתובת אימייל לא תקינה")]).optional().default(""),
  website: z.string().trim().max(300).optional().default(""),
});

export const ArticleSchema = z.object({
  title: z.string().min(2, "יש להזין כותרת").max(200).trim(),
  content: z.string().min(10, "התוכן קצר מדי").max(20000),
  published: z.boolean().default(false),
});

export const ReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "יש לבחור דירוג").max(5, "דירוג לא תקין"),
  body: z
    .string()
    .trim()
    .min(20, "אנא כתבו לפחות כמה משפטים (20 תווים לפחות)")
    .max(4000, "חוות הדעת ארוכה מדי"),
  honeypot: z.string().max(0, "שליחה נחסמה").optional().default(""),
});
