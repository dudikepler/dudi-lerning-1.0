import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "דודי קפלר | הפרופסור - צילום ופרסום",
  description:
    "דודי קפלר, \"הפרופסור\" - יוצר תוכן ומרצה עם מאות אלפי עוקבים. הזמינו שירותי צילום ופרסום ותיאמו פגישה בהתאם ליומן הפנוי שלי.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
