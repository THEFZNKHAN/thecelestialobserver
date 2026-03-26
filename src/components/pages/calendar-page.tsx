"use client";

import { useEffect, useMemo, useState } from "react";

import { TopNav } from "@/components/site/top-nav";
import { defaultPreferences, getStoredPreferences } from "@/lib/storage";
import type { CalendarDay, LocationPreferences } from "@/lib/types";

export function CalendarPage() {
    const [prefs, setPrefs] = useState<LocationPreferences>(defaultPreferences);
    const [days, setDays] = useState<CalendarDay[]>([]);
    const [eventDays, setEventDays] = useState<CalendarDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewDate, setViewDate] = useState(() => new Date());

    const now = new Date();
    const month = viewDate.getMonth() + 1;
    const year = viewDate.getFullYear();

    useEffect(() => {
        const stored = getStoredPreferences();
        setPrefs(stored);
        const params = new URLSearchParams({
            city: stored.city,
            country: stored.country,
            method: String(stored.method),
            month: String(month),
            year: String(year),
        });

        fetch(`/api/calendar?${params.toString()}`)
            .then((res) => res.json())
            .then((payload: { days: CalendarDay[] }) => {
                const currentMonthDays = payload.days ?? [];
                setDays(currentMonthDays);

                const nextMonthDate = new Date(year, month, 1);
                const nextMonth = nextMonthDate.getMonth() + 1;
                const nextYear = nextMonthDate.getFullYear();
                const nextParams = new URLSearchParams({
                    city: stored.city,
                    country: stored.country,
                    method: String(stored.method),
                    month: String(nextMonth),
                    year: String(nextYear),
                });

                return fetch(`/api/calendar?${nextParams.toString()}`)
                    .then((res) => res.json())
                    .then((nextPayload: { days?: CalendarDay[] }) => {
                        setEventDays([...currentMonthDays, ...(nextPayload.days ?? [])]);
                    })
                    .catch(() => {
                        setEventDays(currentMonthDays);
                    });
            })
            .finally(() => setLoading(false));
    }, [month, year]);

    const todayLabel = useMemo(
        () =>
            now
                .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                .replace(/ /g, " "),
        [now],
    );

    const isViewingCurrentMonth = useMemo(() => {
        return month === now.getMonth() + 1 && year === now.getFullYear();
    }, [month, year, now]);

    const activeDay = useMemo(() => {
        if (!days.length) return null;
        if (isViewingCurrentMonth) {
            return days.find((d) => d.gregorian === todayLabel) ?? days[days.length - 1];
        }
        return days[0];
    }, [days, todayLabel, isViewingCurrentMonth]);

    const summary = useMemo(() => {
        if (!activeDay) return "--";
        return `${activeDay.hijriMonth} ${activeDay.hijriYear} AH`;
    }, [activeDay]);

    const firstGregorianDate = useMemo(() => {
        if (!days.length) return null;
        return new Date(days[0].gregorian);
    }, [days]);

    const monthLabel = useMemo(() => {
        return viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }, [viewDate]);

    const leadingBlankDays = useMemo(() => {
        if (!firstGregorianDate) return 0;
        return firstGregorianDate.getDay();
    }, [firstGregorianDate]);

    const monthCompletion = useMemo(() => {
        if (!activeDay) return 0;
        const hijriDay = Number(activeDay.hijriDay);
        if (Number.isNaN(hijriDay)) return 0;
        // Use lunar-month progress so insight aligns with Hijri cycle.
        return Math.max(0, Math.min(100, Math.round((hijriDay / 30) * 100)));
    }, [activeDay]);

    const lunarPhase = useMemo(() => {
        if (!activeDay) return "--";
        const hijriDay = Number(activeDay.hijriDay);
        if (Number.isNaN(hijriDay)) return "--";

        if (hijriDay === 1 || hijriDay === 30) return "New Crescent";
        if (hijriDay >= 2 && hijriDay <= 7) return "Waxing Crescent";
        if (hijriDay >= 8 && hijriDay <= 14) return "First Quarter";
        if (hijriDay >= 15 && hijriDay <= 16) return "Full Moon";
        if (hijriDay >= 17 && hijriDay <= 22) return "Waning Gibbous";
        if (hijriDay >= 23 && hijriDay <= 27) return "Last Quarter";
        return "Waning Crescent";
    }, [activeDay]);

    const monthInsight = useMemo(() => {
        const monthName = (activeDay?.hijriMonth ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

        if (monthName.includes("ramadan")) {
            return "A month of fasting, prayer, and reflection. Track major nights and maintain spiritual consistency throughout Ramadan.";
        }
        if (monthName.includes("shawwal")) {
            return "The month of Eid al-Fitr and continued devotion, including the recommended six fasts of Shawwal.";
        }
        if (monthName.includes("muharram")) {
            return "The opening month of the Hijri year, honored as a sacred time with the day of Ashura.";
        }
        if (
            (monthName.includes("dhu") || monthName.includes("zul")) &&
            monthName.includes("hijjah")
        ) {
            return "A sacred month marked by Hajj, the Day of Arafah, and Eid al-Adha in its opening days.";
        }

        return "Follow this month's Hijri rhythm with daily date progression, prayer windows, and upcoming sacred milestones.";
    }, [activeDay]);

    const upcomingEvents = useMemo(() => {
        if (!eventDays.length || !activeDay) return [];

        const todayDate = new Date(activeDay.gregorian);

        const normalizeMonth = (raw: string) =>
            raw
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();

        const getSpecialEvent = (day: CalendarDay): string | null => {
            const monthName = normalizeMonth(day.hijriMonth);
            const dayNum = Number(day.hijriDay);

            if (monthName.includes("ramadan") && dayNum === 17) return "Nuzul Al-Qur'an";
            if (monthName.includes("ramadan") && dayNum === 27) return "Laylat al-Qadr";
            if (monthName.includes("shawwal") && dayNum === 1) return "Eid-ul-Fitr";
            if (
                (monthName.includes("dhu") || monthName.includes("zul")) &&
                monthName.includes("hijjah") &&
                dayNum === 9
            ) {
                return "Day of Arafah";
            }
            if (
                (monthName.includes("dhu") || monthName.includes("zul")) &&
                monthName.includes("hijjah") &&
                dayNum === 10
            ) {
                return "Eid-ul-Adha";
            }
            if (monthName.includes("muharram") && dayNum === 10) return "Ashura";
            if (monthName.includes("rabi") && dayNum === 12) return "Mawlid al-Nabi";

            return null;
        };

        const futureDays = eventDays
            .filter((d) => new Date(d.gregorian).getTime() > todayDate.getTime())
            .map((day) => ({
                title: getSpecialEvent(day),
                subtitle: `${day.hijriDay} ${day.hijriMonth} ${day.hijriYear}`,
                gregorian: day.gregorian,
            }))
            .filter((event) => Boolean(event.title))
            .slice(0, 3);

        return futureDays as Array<{ title: string; subtitle: string; gregorian: string }>;
    }, [eventDays, activeDay]);

    return (
        <main className="min-h-screen bg-[#0b1020] text-[#e1e1f0]">
            <TopNav active="calendar" />

            <div className="mx-auto max-w-[1240px] px-4 pb-8 pt-28 md:px-6">
                <section className="grid gap-6 lg:grid-cols-12">
                    <article className="lg:col-span-8">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f9c03d]">
                            Current Cycle
                        </p>
                        <h1 className="mt-1 text-5xl font-light">{summary}</h1>

                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center gap-8 rounded-2xl bg-[#181d2b] px-7 py-3 text-sm font-semibold">
                                <button
                                    type="button"
                                    aria-label="Previous month"
                                    onClick={() =>
                                        setViewDate(
                                            (prev) =>
                                                new Date(
                                                    prev.getFullYear(),
                                                    prev.getMonth() - 1,
                                                    1,
                                                ),
                                        )
                                    }
                                    className="text-[#f9c03d] transition hover:opacity-80"
                                >
                                    ‹
                                </button>
                                <span>{monthLabel}</span>
                                <button
                                    type="button"
                                    aria-label="Next month"
                                    onClick={() =>
                                        setViewDate(
                                            (prev) =>
                                                new Date(
                                                    prev.getFullYear(),
                                                    prev.getMonth() + 1,
                                                    1,
                                                ),
                                        )
                                    }
                                    className="text-[#f9c03d] transition hover:opacity-80"
                                >
                                    ›
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 rounded-3xl bg-[#181d2b] p-4 md:p-6">
                            <div className="grid grid-cols-7 gap-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-[#8b8f9e]">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                    <span key={d}>{d}</span>
                                ))}
                            </div>

                            <div className="mt-4 grid grid-cols-7 gap-3">
                                {Array.from({ length: leadingBlankDays }).map((_, i) => (
                                    <div key={`blank-${i}`} className="h-20 rounded-2xl" />
                                ))}
                                {days.map((day) => {
                                    const isToday =
                                        isViewingCurrentMonth && day.gregorian === todayLabel;
                                    return (
                                        <article
                                            key={day.gregorian}
                                            className={`h-20 rounded-2xl p-3 ${
                                                isToday
                                                    ? "bg-[#7b6634]/90 text-[#f9c03d]"
                                                    : "bg-[#1f2333] text-[#e1e1f0]"
                                            }`}
                                        >
                                            <p className="text-xs opacity-80">
                                                {day.gregorian.split(" ")[0]}
                                            </p>
                                            <p className="mt-1 text-xl leading-none">
                                                {day.hijriDay}
                                            </p>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </article>

                    <aside className="space-y-4 lg:col-span-4">
                        <article className="rounded-3xl bg-[#1a1f2f] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f9c03d]">
                                Month Insight
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#2d3347] text-[#f9c03d]">
                                    ☪
                                </span>
                                <div>
                                    <h3 className="text-3xl font-medium">
                                        {activeDay?.hijriMonth ?? "--"}
                                    </h3>
                                    <p className="text-sm italic text-[#c7c6c6]">
                                        {activeDay?.hijriYear
                                            ? `Hijri Year ${activeDay.hijriYear}`
                                            : "Islamic lunar cycle"}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-[#c7c6c6]">
                                {monthInsight}
                            </p>
                            <div className="mt-8 flex items-center justify-between text-xs text-[#8b8f9e]">
                                <span>Completion</span>
                                <span className="font-bold text-[#f9c03d]">{monthCompletion}%</span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#32343f]">
                                <div
                                    className="h-full bg-gradient-to-r from-[#f9c03d] to-[#daa520]"
                                    style={{ width: `${monthCompletion}%` }}
                                />
                            </div>
                        </article>

                        <div className="space-y-3">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <article
                                        key={event.gregorian}
                                        className="flex items-center justify-between rounded-2xl bg-[#1a1f2f] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#2b3145] text-center">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#f9c03d]">
                                                    {event.gregorian.split(" ")[1]}
                                                </span>
                                                <span className="text-lg leading-none">
                                                    {event.gregorian.split(" ")[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-lg">{event.title}</p>
                                                <p className="text-sm text-[#8b8f9e]">
                                                    {event.subtitle}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[#6f768b]">›</span>
                                    </article>
                                ))
                            ) : (
                                <article className="rounded-2xl bg-[#1a1f2f] p-4">
                                    <p className="text-lg">No upcoming dates in this month</p>
                                    <p className="text-sm text-[#8b8f9e]">
                                        Calendar data will refresh with the next month cycle.
                                    </p>
                                </article>
                            )}
                        </div>

                        <article className="relative overflow-hidden rounded-2xl bg-[#1a1f2f] p-5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(249,192,61,0.25),transparent_40%)]" />
                            <div className="absolute right-4 top-3 flex gap-2 opacity-55">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <span
                                        key={i}
                                        className="h-3 w-3 rounded-full bg-[#c7c6c6]"
                                        style={{ opacity: (i + 1) / 6 }}
                                    />
                                ))}
                            </div>
                            <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-[#f9c03d]">
                                Current Phase
                            </p>
                            <p className="relative mt-2 text-2xl">{lunarPhase}</p>
                            <p className="relative mt-1 text-xs uppercase tracking-[0.12em] text-[#8b8f9e]">
                                Hijri day {activeDay?.hijriDay ?? "--"}
                            </p>
                        </article>
                    </aside>
                </section>

                {loading && (
                    <section className="mt-6 rounded-2xl border border-white/10 bg-[#191b25]/65 p-6 text-center text-[#c7c6c6]">
                        Loading calendar...
                    </section>
                )}
            </div>
        </main>
    );
}
