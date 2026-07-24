"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const SERVICES = [
  "צילום תוכן ממותג",
  "קמפיין פרסום ממומן",
  "שיתוף פעולה מתמשך",
  "אחר",
];

type SlotsByDate = Record<string, string[]>;

function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    timeZone: "Asia/Jerusalem",
  }).format(date);
}

export default function BookPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [slotsByDate, setSlotsByDate] = useState<SlotsByDate>({});
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: SERVICES[0],
    message: "",
  });
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);
  const selectedDate = pickedDate && dates.includes(pickedDate) ? pickedDate : (dates[0] ?? null);

  async function loadAvailability() {
    setStatus("loading");
    try {
      const res = await fetch("/api/availability");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setSlotsByDate(data.slotsByDate ?? {});
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount
    loadAvailability();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setSubmitState("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "משהו השתבש");
        setSubmitState("error");
        if (res.status === 409) {
          setSelectedTime(null);
          loadAvailability();
        }
        return;
      }
      setSubmitState("done");
    } catch {
      setSubmitError("משהו השתבש, נסה/י שוב");
      setSubmitState("error");
    }
  }

  if (submitState === "done") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="text-sm uppercase tracking-[0.3em] text-gold-soft">
          נקבע בהצלחה
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          <span className="text-gradient-gold">הפגישה נקבעה!</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-foreground/70">
          נקבע ל-{selectedDate && formatDateLabel(selectedDate)} בשעה{" "}
          {selectedTime}. אחזור אליך בקרוב לאישור סופי.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full border border-gold/40 px-8 py-3 font-semibold transition hover:border-gold"
        >
          חזרה לעמוד הבית
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-6 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-gold-soft">
            קביעת פגישה
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            <span className="text-gradient-gold">בחר/י מועד</span> פנוי ביומן
          </h1>
        </div>

        {status === "loading" && (
          <p className="mt-12 text-center text-foreground/60">טוען זמינות...</p>
        )}

        {status === "error" && (
          <div className="mt-12 text-center text-foreground/60">
            <p>לא הצלחנו לטעון את הזמינות כרגע.</p>
            <button
              onClick={loadAvailability}
              className="mt-4 rounded-full border border-gold/40 px-6 py-2 font-semibold transition hover:border-gold"
            >
              נסה/י שוב
            </button>
          </div>
        )}

        {status === "ready" && dates.length === 0 && (
          <p className="mt-12 text-center text-foreground/60">
            אין כרגע מועדים פנויים בטווח הקרוב, נסו שוב בקרוב.
          </p>
        )}

        {status === "ready" && dates.length > 0 && (
          <>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {dates.map((dateKey) => (
                <button
                  key={dateKey}
                  onClick={() => {
                    setPickedDate(dateKey);
                    setSelectedTime(null);
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selectedDate === dateKey
                      ? "border-gold bg-gold text-black"
                      : "border-gold/30 text-foreground/80 hover:border-gold"
                  }`}
                >
                  {formatDateLabel(dateKey)}
                </button>
              ))}
            </div>

            {selectedDate && (
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {slotsByDate[selectedDate].map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      selectedTime === time
                        ? "border-gold bg-gold text-black"
                        : "border-gold/30 text-foreground/80 hover:border-gold"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}

            {selectedDate && selectedTime && (
              <form
                onSubmit={handleSubmit}
                className="mt-12 space-y-4 rounded-2xl border border-gold/20 bg-panel p-6 sm:p-8"
              >
                <h2 className="text-xl font-semibold text-gold-soft">
                  {formatDateLabel(selectedDate)} · {selectedTime} - פרטים
                  ליצירת קשר
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    required
                    placeholder="שם מלא"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="rounded-lg border border-gold/30 bg-background px-4 py-2 outline-none focus:border-gold"
                  />
                  <input
                    required
                    placeholder="טלפון"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="rounded-lg border border-gold/30 bg-background px-4 py-2 outline-none focus:border-gold"
                  />
                  <input
                    type="email"
                    placeholder="אימייל (לא חובה)"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="rounded-lg border border-gold/30 bg-background px-4 py-2 outline-none focus:border-gold"
                  />
                  <select
                    value={form.service}
                    onChange={(e) =>
                      setForm({ ...form, service: e.target.value })
                    }
                    className="rounded-lg border border-gold/30 bg-background px-4 py-2 outline-none focus:border-gold"
                  >
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  placeholder="ספר/י לי קצת על הפרויקט (לא חובה)"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gold/30 bg-background px-4 py-2 outline-none focus:border-gold"
                />

                {submitError && (
                  <p className="text-sm text-red-400">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitState === "submitting"}
                  className="w-full rounded-full bg-gold px-8 py-3 text-base font-semibold text-black transition hover:bg-gold-soft disabled:opacity-60"
                >
                  {submitState === "submitting" ? "קובע פגישה..." : "אישור קביעת פגישה"}
                </button>
              </form>
            )}
          </>
        )}

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-foreground/60 hover:text-gold-soft">
            חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
