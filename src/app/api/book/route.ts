import { NextResponse } from "next/server";
import { buildRequestedSlot } from "@/lib/availability";
import { createBookingEvent, getBusyIntervals } from "@/lib/googleCalendar";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const { date, time, name, phone, email, service, message } = body ?? {};

  if (!date || !time || !name || !phone || !service) {
    return NextResponse.json({ error: "חסרים פרטים בטופס" }, { status: 400 });
  }

  const slot = buildRequestedSlot(date, time);
  if (!slot) {
    return NextResponse.json(
      { error: "מועד לא תקין או שאינו בשעות הפעילות" },
      { status: 400 },
    );
  }

  try {
    const busy = await getBusyIntervals(slot.startUtc, slot.endUtc);
    const isTaken = busy.some((b) => {
      const busyStart = new Date(b.start).getTime();
      const busyEnd = new Date(b.end).getTime();
      return slot.startUtc.getTime() < busyEnd && slot.endUtc.getTime() > busyStart;
    });
    if (isTaken) {
      return NextResponse.json(
        { error: "המועד הזה כבר נתפס, בחר/י מועד אחר" },
        { status: 409 },
      );
    }

    await createBookingEvent(slot.startUtc, slot.endUtc, {
      name,
      phone,
      email,
      service,
      message,
    });

    const { error: dbError } = await supabase.from("bookings").insert({
      name,
      phone,
      email: email ?? null,
      service,
      message: message ?? null,
      slot_date: date,
      slot_time: time,
    });
    if (dbError) console.error("supabase insert error", dbError);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("booking error", error);
    return NextResponse.json(
      { error: "קביעת הפגישה נכשלה, נסה/י שוב" },
      { status: 500 },
    );
  }
}
