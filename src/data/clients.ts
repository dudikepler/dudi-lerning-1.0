export type Client = {
  name: string;
  domain: string;
};

// רשימת החברות שכבר עבדו עם דודי, להצגה בסקציית "עובדים איתי".
// כדי להוסיף חברה: name = שם החברה, domain = הדומיין שלה (לוגו נשלף אוטומטית לפי הדומיין).
// דוגמה: { name: "אקמי", domain: "acme.co.il" }
export const clients: Client[] = [];
