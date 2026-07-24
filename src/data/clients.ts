export type Client = {
  name: string;
  // דומיין ידוע ומאומת - משמש לשליפת לוגו אוטומטית. השאר ריק אם לא בטוח.
  domain?: string;
  // סמן ידני: true אם המקור הוא רשימת "מחקר" שלא אומתה במלואה מול מסמך/צילום מסך.
  needsReview?: boolean;
};

// רשימה מלאה כפי שסופקה על ידי דודי (כולל שיתופי פעולה, פרויקטים וכיסוי תקשורתי).
// ⚠️ לפני פרסום חי: עברו על כל שורה עם needsReview=true ואמתו (חשבונית/הסכם/פוסט מתויג),
// או הסירו לפי הצורך. שורות עם domain ריק מוצגות כתגית טקסט בלבד (בלי לוגו מנוחש).
export const clients: Client[] = [
  { name: "בזק", domain: "bezeq.co.il", needsReview: true },
  { name: "GOTSEL", needsReview: true },
  { name: "יטבתה", domain: "yotvata.co.il", needsReview: true },
  { name: "תנובה", domain: "tnuva.co.il", needsReview: true },
  { name: "אלפרו", needsReview: true },
  { name: "יש חסד", needsReview: true },
  { name: "קוקה קולה", domain: "coca-cola.co.il", needsReview: true },
  { name: "מוטי'ס", domain: "motisvip.co.il" },
  { name: "יקב טפרברג", domain: "teperberg1870.com", needsReview: true },
  { name: "הגורן", needsReview: true },
  { name: "FLY CARD", needsReview: true },
  { name: "אל על", domain: "elal.co.il" },
  { name: "Kids Basic", needsReview: true },
  { name: "KB", needsReview: true },
  { name: "Blush Fashion", needsReview: true },
  { name: "אפילוג'יק", needsReview: true },
  { name: "לוריאל פריז", domain: "lorealparis.com", needsReview: true },
  { name: "Stand Up (לוריאל)", needsReview: true },
  { name: "איגוד מרכזי הסיוע לנפגעי תקיפה מינית", needsReview: true },
  { name: "קמאטק (KamaTech)", domain: "kamatech.org.il" },
  { name: "COL - מרכז התקשורת החב\"די", domain: "col.org.il", needsReview: true },
  { name: "פיפל דיגיטל", needsReview: true },
  { name: "שלוחים סטורי", needsReview: true },
  { name: "הסוכנות היהודית", domain: "jewishagency.org", needsReview: true },
  { name: "ההסתדרות הציונית העולמית", domain: "wzo.org.il", needsReview: true },
  { name: "Israel Entertainment Group", needsReview: true },
  { name: "המשרד לשיתוף פעולה אזורי", needsReview: true },
  { name: "המשרד לשירותי דת", needsReview: true },
  { name: "קופת העיר", needsReview: true },
  { name: "Metchy", domain: "metchy.com" },
  { name: "Hermolis & Co.", domain: "hermolis.com", needsReview: true },
  { name: "Charles Tyrwhitt", domain: "ctshirts.com", needsReview: true },
  { name: "Mydar", needsReview: true },
  { name: "תיאטרון אורנה פורת", needsReview: true },
  { name: "לשון הרע לא מדבר אלי", needsReview: true },
  { name: "Ynet", domain: "ynet.co.il", needsReview: true },
  { name: "ידיעות אחרונות", needsReview: true },
  { name: "מקור ראשון", domain: "makorrishon.co.il", needsReview: true },
  { name: "וואלה", domain: "walla.co.il", needsReview: true },
  { name: "כיכר השבת", domain: "kikar.co.il", needsReview: true },
  { name: "בחדרי חרדים", domain: "bhol.co.il", needsReview: true },
  { name: "קול חי", domain: "kolchai.co.il", needsReview: true },
  { name: "המחדש", needsReview: true },
  { name: "מגזין כפר חב\"ד", needsReview: true },
];
