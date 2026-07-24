import { google } from "googleapis";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    );
  }
  return new google.auth.JWT({
    email,
    key: rawKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

export async function getBusyIntervals(timeMin: Date, timeMax: Date) {
  const calendar = google.calendar({ version: "v3", auth: getAuth() });
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: CALENDAR_ID }],
    },
  });
  const busy = res.data.calendars?.[CALENDAR_ID]?.busy ?? [];
  return busy
    .filter((b) => b.start && b.end)
    .map((b) => ({ start: b.start as string, end: b.end as string }));
}

export type BookingDetails = {
  name: string;
  phone: string;
  email?: string;
  service: string;
  message?: string;
};

export async function createBookingEvent(
  startUtc: Date,
  endUtc: Date,
  details: BookingDetails,
) {
  const calendar = google.calendar({ version: "v3", auth: getAuth() });
  const description = [
    `שירות: ${details.service}`,
    `טלפון: ${details.phone}`,
    details.email ? `אימייל: ${details.email}` : null,
    details.message ? `הודעה: ${details.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // הערה: לא מוסיפים attendees - service account בחשבון Gmail אישי (לא
  // Google Workspace) לא יכול להזמין משתתפים חיצוניים ללא domain-wide
  // delegation, פרטי הקשר נשמרים בתיאור האירוע במקום זאת.
  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: `${details.service} - ${details.name}`,
      description,
      start: { dateTime: startUtc.toISOString() },
      end: { dateTime: endUtc.toISOString() },
    },
  });

  return res.data;
}
