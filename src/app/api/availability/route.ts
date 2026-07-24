import { NextResponse } from "next/server";
import { generateCandidateSlots, filterFreeSlots } from "@/lib/availability";
import { getBusyIntervals } from "@/lib/googleCalendar";

export async function GET() {
  try {
    const candidates = generateCandidateSlots();
    if (candidates.length === 0) {
      return NextResponse.json({ slotsByDate: {} });
    }

    const timeMin = candidates[0].startUtc;
    const timeMax = candidates[candidates.length - 1].endUtc;
    const busy = await getBusyIntervals(timeMin, timeMax);
    const free = filterFreeSlots(candidates, busy);

    const slotsByDate: Record<string, string[]> = {};
    for (const slot of free) {
      if (!slotsByDate[slot.dateKey]) slotsByDate[slot.dateKey] = [];
      slotsByDate[slot.dateKey].push(slot.time);
    }

    return NextResponse.json({ slotsByDate });
  } catch (error) {
    console.error("availability error", error);
    return NextResponse.json(
      { error: "לא ניתן לטעון זמינות כרגע" },
      { status: 500 },
    );
  }
}
