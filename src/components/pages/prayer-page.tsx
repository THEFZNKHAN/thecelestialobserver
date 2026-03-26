"use client";

import { differenceInMinutes, format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { getCurrentAndNextPrayer } from "@/lib/prayer";
import { TopNav } from "@/components/site/top-nav";
import { defaultPreferences, getStoredPreferences } from "@/lib/storage";
import type { CalendarDay, DashboardData, LocationPreferences } from "@/lib/types";

const iconByPrayer: Record<string, string> = {
    Fajr: "nights_stay",
    Sunrise: "wb_sunny",
    Dhuhr: "light_mode",
    Asr: "wb_twilight",
    Maghrib: "flare",
    Isha: "dark_mode",
};

export function PrayerPage() {
    const [prefs, setPrefs] = useState<LocationPreferences>(defaultPreferences);
    const [data, setData] = useState<DashboardData | null>(null);
    const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const stored = getStoredPreferences();
        setPrefs(stored);
        const params = new URLSearchParams({
            city: stored.city,
            country: stored.country,
            method: String(stored.method),
        });
        fetch(`/api/dashboard?${params.toString()}`)
            .then((res) => res.json())
            .then((payload: DashboardData) => {
                payload.timings.prayers = payload.timings.prayers.map((prayer) => ({
                    ...prayer,
                    date: new Date(prayer.date),
                }));
                setData(payload);
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();
                const calendarParams = new URLSearchParams({
                    city: stored.city,
                    country: stored.country,
                    method: String(stored.method),
                    month: String(currentMonth),
                    year: String(currentYear),
                });
                return fetch(`/api/calendar?${calendarParams.toString()}`);
            })
            .then((res) => (res ? res.json() : Promise.resolve({ days: [] })))
            .then((payload: { days?: CalendarDay[] }) => {
                const days = payload.days ?? [];
                const todayLabel = format(now, "dd MMM yyyy");
                const todayIndex = days.findIndex((day) => day.gregorian === todayLabel);

                if (todayIndex === -1) {
                    setCalendarDays(days.slice(0, 4));
                    return;
                }

                const start = Math.max(todayIndex - 1, 0);
                const end = Math.min(start + 4, days.length);
                setCalendarDays(days.slice(start, end));
            })
            .finally(() => setLoading(false));
    }, [now]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(timer);
    }, []);

    const focus = useMemo(() => {
        if (!data) return null;
        return getCurrentAndNextPrayer(data.timings.prayers, now);
    }, [data, now]);

    const qiblaDirection = data?.qibla.direction ?? 0;
    const qiblaCardinal = (() => {
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        return directions[Math.round(qiblaDirection / 45) % 8];
    })();

    const nextPrayerCountdown = useMemo(() => {
        if (!focus) return "0m";
        const total = Math.max(differenceInMinutes(focus.next.date, now), 0);
        const h = Math.floor(total / 60);
        const m = total % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }, [focus, now]);

    return (
        <main className="min-h-screen bg-[#11131d] pb-12 text-[#e1e1f0]">
            <TopNav active="prayer" />

            <section className="mx-auto w-full max-w-7xl px-6 pt-28 md:px-8">
                {loading && (
                    <div className="rounded-3xl bg-[#191b25] p-6 text-center">
                        Loading prayer data...
                    </div>
                )}

                {!loading && data && focus && (
                    <>
                        <div className="mb-10 flex items-start justify-between">
                            <div>
                                <p className="mb-1 flex items-center gap-2 text-3xl text-[#e1e1f0]">
                                    <span className="material-symbols-outlined text-[#f9c03d]">
                                        location_on
                                    </span>
                                    {prefs.city}, {prefs.country}
                                </p>
                                <p className="text-8xl font-thin tracking-tight">
                                    {format(now, "HH:mm")}
                                </p>
                                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#f9c03d]">
                                    NEXT {focus.next.name} IN {nextPrayerCountdown}
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="relative mx-auto grid h-[160px] w-[160px] place-items-center rounded-full border border-[#2a2f3b] bg-[#181d2b]">
                                    <span className="absolute top-[16px] text-[12px] font-semibold tracking-[0.2em] text-[#545b70]">
                                        N
                                    </span>
                                    <span className="absolute bottom-[16px] text-[12px] font-semibold tracking-[0.2em] text-[#545b70]">
                                        S
                                    </span>
                                    <span className="absolute left-[18px] text-[12px] font-semibold tracking-[0.2em] text-[#545b70]">
                                        W
                                    </span>
                                    <span className="absolute right-[18px] text-[12px] font-semibold tracking-[0.2em] text-[#545b70]">
                                        E
                                    </span>

                                    <div className="relative grid h-[110px] w-[110px] place-items-center rounded-full border border-[#6f5624]/50">
                                        <div
                                            className="absolute inset-0"
                                            style={{ transform: `rotate(${qiblaDirection}deg)` }}
                                        >
                                            <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f7c43f] shadow-[0_0_14px_rgba(249,192,61,0.65)]" />
                                        </div>
                                        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f7c43f]">
                                            <span
                                                className="material-symbols-outlined text-2xl text-[#151925]"
                                                style={{ fontVariationSettings: "'FILL' 1" }}
                                            >
                                                explore
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-3 text-xl font-semibold uppercase tracking-[0.22em] text-[#d3d7df]">
                                    Qibla {qiblaDirection.toFixed(0)}° {qiblaCardinal}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                            <article className="relative overflow-hidden rounded-3xl bg-[#282934] p-8 lg:col-span-8 lg:h-[353px]">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_40%,rgba(249,192,61,0.13),transparent_45%)]" />
                                <div className="relative z-10">
                                    <span className="rounded-full bg-[#f9c03d]/20 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#f9c03d]">
                                        Current Focus
                                    </span>
                                    <h3 className="mt-5 text-5xl font-light">
                                        {focus.current.name} Prayer
                                    </h3>
                                    <p className="mt-3 max-w-xl text-lg text-[#c7c6c6]">
                                        The Middle Prayer. "Guard strictly your habit of prayers,
                                        especially the Middle Prayer."
                                    </p>
                                    <div className="mt-10 flex items-end gap-4">
                                        <span className="text-7xl font-thin">
                                            {format(focus.current.date, "HH:mm")}
                                        </span>
                                        <span className="pb-2 text-sm font-bold uppercase tracking-widest text-[#f9c03d]">
                                            Today
                                        </span>
                                    </div>
                                </div>
                            </article>

                            <div className="space-y-4 lg:col-span-4">
                                {data.timings.prayers.slice(0, 3).map((prayer) => (
                                    <article
                                        key={prayer.name}
                                        className="rounded-3xl bg-[#191b25] p-6 lg:h-[107px]"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#c7c6c6]">
                                            {prayer.name}
                                        </p>
                                        <p className="mt-1 text-4xl font-light">{prayer.time24}</p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
                            {data.timings.prayers
                                .filter((p) => p.name === "Maghrib" || p.name === "Isha")
                                .map((prayer) => (
                                    <article
                                        key={prayer.name}
                                        className="rounded-3xl bg-[#191b25] p-6 lg:col-span-4 lg:h-[107px]"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#c7c6c6]">
                                            {prayer.name}
                                        </p>
                                        <p className="mt-1 text-4xl font-light">{prayer.time24}</p>
                                    </article>
                                ))}
                            <button className="flex w-full items-center justify-between rounded-3xl bg-[#f9c03d] p-6 text-[#402d00] lg:col-span-4 lg:h-[107px]">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest">
                                        Alerts
                                    </p>
                                    <p className="text-3xl font-medium">Set All Athan</p>
                                </div>
                                <span className="material-symbols-outlined">add_circle</span>
                            </button>
                        </div>

                        <section className="mt-14">
                            <div className="mb-4 flex items-end justify-between">
                                <h2 className="text-5xl font-light tracking-tight">
                                    Weekly Schedule
                                </h2>
                                <Link
                                    href="/calendar"
                                    className="text-xs font-bold uppercase tracking-widest text-[#f9c03d]"
                                >
                                    Full Calendar
                                </Link>
                            </div>
                            <div className="overflow-hidden rounded-3xl bg-[#151825]">
                                <div className="grid grid-cols-7 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#c7c6c6]/70">
                                    <span>Day</span>
                                    <span>Fajr</span>
                                    <span>Sunrise</span>
                                    <span>Dhuhr</span>
                                    <span>Asr</span>
                                    <span>Maghrib</span>
                                    <span>Isha</span>
                                </div>
                                <div className="space-y-2 p-2">
                                    {calendarDays.map((day) =>
                                        (() => {
                                            const isTodayRow =
                                                day.gregorian === format(now, "dd MMM yyyy");
                                            const currentPrayerName = focus.current.name;

                                            const timeCellClass = (prayerName: string) =>
                                                isTodayRow && prayerName === currentPrayerName
                                                    ? "text-[#f9c03d]"
                                                    : "";

                                            return (
                                                <div
                                                    key={day.gregorian}
                                                    className="grid grid-cols-7 rounded-2xl bg-[#191b25] px-6 py-5 text-lg"
                                                >
                                                    <span className="font-medium text-[#e1e1f0]">
                                                        {day.gregorian.split(" ")[0]}{" "}
                                                        {day.gregorian.split(" ")[1]}
                                                    </span>
                                                    <span className={timeCellClass("Fajr")}>
                                                        {day.fajr}
                                                    </span>
                                                    <span className={timeCellClass("Sunrise")}>
                                                        {data.timings.prayers.find(
                                                            (p) => p.name === "Sunrise",
                                                        )?.time24 ?? "--:--"}
                                                    </span>
                                                    <span className={timeCellClass("Dhuhr")}>
                                                        {data.timings.prayers.find(
                                                            (p) => p.name === "Dhuhr",
                                                        )?.time24 ?? "--:--"}
                                                    </span>
                                                    <span className={timeCellClass("Asr")}>
                                                        {data.timings.prayers.find(
                                                            (p) => p.name === "Asr",
                                                        )?.time24 ?? "--:--"}
                                                    </span>
                                                    <span className={timeCellClass("Maghrib")}>
                                                        {day.maghrib}
                                                    </span>
                                                    <span className={timeCellClass("Isha")}>
                                                        {data.timings.prayers.find(
                                                            (p) => p.name === "Isha",
                                                        )?.time24 ?? "--:--"}
                                                    </span>
                                                </div>
                                            );
                                        })(),
                                    )}
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </section>
        </main>
    );
}
