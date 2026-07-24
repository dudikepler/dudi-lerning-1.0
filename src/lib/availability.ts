import { fromZonedTime } from "date-fns-tz";

export const TIME_ZONE = "Asia/Jerusalem";
export const WORK_DAYS = [0, 1, 2, 3, 4]; // Sunday-Thursday (JS getDay())
export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 18;
export const SLOT_MINUTES = 60;
export const BOOKING_WINDOW_DAYS = 21;

export type Slot = {
  dateKey: string; // YYYY-MM-DD (local)
  time: string; // HH:mm (local)
  startUtc: Date;
  endUtc: Date;
};

function localDateKey(year: number, month: number, day: number) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/** Candidate slots for the booking window, in Asia/Jerusalem business hours. */
export function generateCandidateSlots(from: Date = new Date()): Slot[] {
  const slots: Slot[] = [];

  for (let dayOffset = 0; dayOffset < BOOKING_WINDOW_DAYS; dayOffset++) {
    const day = new Date(from);
    day.setDate(day.getDate() + dayOffset);

    const localDay = new Date(
      day.toLocaleString("en-US", { timeZone: TIME_ZONE }),
    );
    if (!WORK_DAYS.includes(localDay.getDay())) continue;

    const year = localDay.getFullYear();
    const month = localDay.getMonth() + 1;
    const date = localDay.getDate();
    const dateKey = localDateKey(year, month, date);

    for (
      let hour = WORK_START_HOUR;
      hour + SLOT_MINUTES / 60 <= WORK_END_HOUR;
      hour += SLOT_MINUTES / 60
    ) {
      const time = `${String(hour).padStart(2, "0")}:00`;
      const startUtc = fromZonedTime(`${dateKey}T${time}:00`, TIME_ZONE);
      const endUtc = new Date(startUtc.getTime() + SLOT_MINUTES * 60_000);

      if (startUtc.getTime() <= Date.now()) continue;

      slots.push({ dateKey, time, startUtc, endUtc });
    }
  }

  return slots;
}

/** Validates a requested date/time against business rules and builds its UTC range. */
export function buildRequestedSlot(
  dateKey: string,
  time: string,
): { startUtc: Date; endUtc: Date } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !/^\d{2}:00$/.test(time)) {
    return null;
  }

  const hour = Number(time.slice(0, 2));
  if (hour < WORK_START_HOUR || hour + SLOT_MINUTES / 60 > WORK_END_HOUR) {
    return null;
  }

  const startUtc = fromZonedTime(`${dateKey}T${time}:00`, TIME_ZONE);
  const localDay = new Date(
    startUtc.toLocaleString("en-US", { timeZone: TIME_ZONE }),
  );
  if (!WORK_DAYS.includes(localDay.getDay())) return null;
  if (startUtc.getTime() <= Date.now()) return null;

  const endUtc = new Date(startUtc.getTime() + SLOT_MINUTES * 60_000);
  return { startUtc, endUtc };
}

export function filterFreeSlots(
  slots: Slot[],
  busyIntervals: { start: string; end: string }[],
): Slot[] {
  return slots.filter((slot) => {
    return !busyIntervals.some((busy) => {
      const busyStart = new Date(busy.start).getTime();
      const busyEnd = new Date(busy.end).getTime();
      return slot.startUtc.getTime() < busyEnd && slot.endUtc.getTime() > busyStart;
    });
  });
}
