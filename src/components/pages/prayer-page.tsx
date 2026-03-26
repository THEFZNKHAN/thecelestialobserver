"use client";

import { differenceInMinutes, format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { buildPrayerDate, getCurrentAndNextPrayer, getNowInTimeZone } from "@/lib/prayer";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
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
    const [timezone, setTimezone] = useState("Asia/Kolkata");

    useEffect(() => {
        const stored = getStoredPreferences();
        setPrefs(stored);
        const params = new URLSearchParams({
            city: stored.city,
            country: stored.country,
            method: String(stored.method),
        });
        if (typeof stored.latitude === "number" && typeof stored.longitude === "number") {
            params.set("latitude", String(stored.latitude));
            params.set("longitude", String(stored.longitude));
        }
        fetch(`/api/dashboard?${params.toString()}`)
            .then((res) => res.json())
            .then((payload: DashboardData) => {
                const tz = payload.timings.timezone || "Asia/Kolkata";
                setTimezone(tz);
                const baseDateInTz = getNowInTimeZone(tz);
                payload.timings.prayers = payload.timings.prayers.map((prayer) => ({
                    ...prayer,
                    date: buildPrayerDate(prayer.time24, baseDateInTz),
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
                if (typeof stored.latitude === "number" && typeof stored.longitude === "number") {
                    calendarParams.set("latitude", String(stored.latitude));
                    calendarParams.set("longitude", String(stored.longitude));
                }
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

    const nowInTimezone = useMemo(() => getNowInTimeZone(timezone), [now, timezone]);

    const focus = useMemo(() => {
        if (!data) return null;
        return getCurrentAndNextPrayer(data.timings.prayers, nowInTimezone);
    }, [data, nowInTimezone]);

    const qiblaDirection = data?.qibla.direction ?? 0;
    const qiblaCardinal = (() => {
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        return directions[Math.round(qiblaDirection / 45) % 8];
    })();

    const nextPrayerCountdown = useMemo(() => {
        if (!focus) return "0m";
        const total = Math.max(differenceInMinutes(focus.next.date, nowInTimezone), 0);
        const h = Math.floor(total / 60);
        const m = total % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }, [focus, nowInTimezone]);

    const nextPrayerMinutes = useMemo(() => {
        if (!focus) return 0;
        return Math.max(differenceInMinutes(focus.next.date, nowInTimezone), 0);
    }, [focus, nowInTimezone]);

    const fastingElapsed = useMemo(() => {
        if (!data) return "0h 0m";
        const fajr = data.timings.prayers.find((p) => p.name === "Fajr")?.date;
        if (!fajr) return "0h 0m";
        const mins = Math.max(differenceInMinutes(nowInTimezone, fajr), 0);
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    }, [data, nowInTimezone]);

    return (
        <main className="min-h-screen bg-[#11131d] pb-24 text-[#e1e1f0] md:pb-12">
            <TopNav active="prayer" />

            <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 md:px-8 md:pt-28">
                {loading && (
                    <div className="rounded-3xl bg-[#191b25] p-6 text-center">
                        Loading prayer data...
                    </div>
                )}

                {!loading && data && focus && (
                    <>
                        <div className="mb-10 space-y-8 md:hidden">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f9c03d]">
                                        Next Prayer
                                    </p>
                                    <h2 className="text-5xl font-thin tracking-tighter text-[#e1e1f0]">
                                        {focus.next.name}
                                    </h2>
                                </div>
                                <div className="relative grid h-16 w-16 place-items-center rounded-full border border-[#4f4634]/30 bg-[#191b25]">
                                    <span
                                        className="material-symbols-outlined text-3xl text-[#f9c03d]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        explore
                                    </span>
                                    <div
                                        className="absolute inset-0"
                                        style={{ transform: `rotate(${qiblaDirection}deg)` }}
                                    >
                                        <span className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-[#f9c03d]" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extralight text-[#e1e1f0]">
                                    {nextPrayerCountdown}
                                </span>
                                <span className="text-lg font-light text-[#c7c6c6]">left</span>
                            </div>

                            <article className="relative overflow-hidden rounded-[2rem] bg-[#282934] p-6 shadow-2xl">
                                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#f9c03d]/10 blur-3xl" />
                                <div className="relative z-10 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#f9c03d]">
                                            wb_twilight
                                        </span>
                                        <span className="text-sm font-medium text-[#c7c6c6]">
                                            Today's Focus
                                        </span>
                                    </div>
                                    <p className="text-base font-light italic leading-relaxed text-[#e1e1f0]">
                                        "The most beloved of actions to Allah is the prayer at its
                                        proper time."
                                    </p>
                                </div>
                            </article>

                            <section className="space-y-3">
                                <div className="mb-2 flex items-center justify-between px-1">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#c7c6c6]">
                                        Schedule
                                    </h3>
                                    <span className="text-xs text-[#9c8f7a]">
                                        {format(now, "MMM dd, yyyy")}
                                    </span>
                                </div>
                                {data.timings.prayers.map((prayer) => {
                                    const isCurrent = prayer.name === focus.current.name;
                                    return (
                                        <article
                                            key={prayer.name}
                                            className={
                                                isCurrent
                                                    ? "flex items-center justify-between rounded-[1.25rem] bg-[#32343f] p-5 ring-1 ring-[#f9c03d]/20"
                                                    : "flex items-center justify-between rounded-2xl bg-[#191b25] p-5"
                                            }
                                        >
                                            <div className="flex items-center gap-4">
                                                <span
                                                    className={`material-symbols-outlined ${
                                                        isCurrent
                                                            ? "text-[#f9c03d]"
                                                            : "text-[#8b8f9e]"
                                                    }`}
                                                    style={
                                                        isCurrent
                                                            ? { fontVariationSettings: "'FILL' 1" }
                                                            : undefined
                                                    }
                                                >
                                                    {iconByPrayer[prayer.name] ?? "schedule"}
                                                </span>
                                                <span
                                                    className={
                                                        isCurrent
                                                            ? "font-bold text-[#f9c03d]"
                                                            : "font-medium text-[#e1e1f0]"
                                                    }
                                                >
                                                    {prayer.name}
                                                </span>
                                            </div>
                                            <span
                                                className={
                                                    isCurrent
                                                        ? "text-xl font-medium text-[#f9c03d]"
                                                        : "text-base font-light text-[#c7c6c6]"
                                                }
                                            >
                                                {prayer.time24}
                                            </span>
                                        </article>
                                    );
                                })}
                            </section>

                            <article className="mt-2 flex items-center gap-5 rounded-3xl bg-[#191b25] p-5">
                                <div className="relative h-14 w-14">
                                    <svg className="h-full w-full" viewBox="0 0 36 36">
                                        <circle
                                            className="stroke-[#32343f]"
                                            cx="18"
                                            cy="18"
                                            fill="none"
                                            r="16"
                                            strokeWidth="2.5"
                                        />
                                        <circle
                                            className="stroke-[#f9c03d]"
                                            cx="18"
                                            cy="18"
                                            fill="none"
                                            r="16"
                                            strokeDasharray="75, 100"
                                            strokeLinecap="round"
                                            strokeWidth="2.5"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 grid place-items-center">
                                        <span className="material-symbols-outlined text-xs text-[#f9c03d]">
                                            timer
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-[#e1e1f0]">
                                        Fasting Progress
                                    </h4>
                                    <p className="mt-1 text-xs text-[#c7c6c6]">
                                        {fastingElapsed} since Fajr
                                    </p>
                                </div>
                            </article>
                        </div>

                        <div className="mb-10 hidden flex-col gap-8 md:flex lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="mb-1 flex items-center gap-2 text-2xl text-[#e1e1f0] sm:text-3xl">
                                    <span className="material-symbols-outlined text-[#f9c03d]">
                                        location_on
                                    </span>
                                    {prefs.city}, {prefs.country}
                                </p>
                                <p className="text-5xl font-thin tracking-tight sm:text-6xl lg:text-8xl">
                                    {format(nowInTimezone, "HH:mm")}
                                </p>
                                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#f9c03d]">
                                    NEXT {focus.next.name} IN {nextPrayerCountdown}
                                </p>
                            </div>
                            <div className="text-center lg:min-w-[220px]">
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
                                <p className="mt-3 text-base font-semibold uppercase tracking-[0.22em] text-[#d3d7df] sm:text-xl">
                                    Qibla {qiblaDirection.toFixed(0)}° {qiblaCardinal}
                                </p>
                            </div>
                        </div>

                        <div className="hidden grid-cols-1 gap-5 md:grid lg:grid-cols-12">
                            <article className="relative overflow-hidden rounded-3xl bg-[#282934] p-8 lg:col-span-8 lg:h-[353px]">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_40%,rgba(249,192,61,0.13),transparent_45%)]" />
                                <div className="relative z-10">
                                    <span className="rounded-full bg-[#f9c03d]/20 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#f9c03d]">
                                        Current Focus
                                    </span>
                                    <h3 className="mt-5 text-3xl font-light sm:text-4xl lg:text-5xl">
                                        {focus.current.name} Prayer
                                    </h3>
                                    <p className="mt-3 max-w-xl text-base text-[#c7c6c6] sm:text-lg">
                                        The Middle Prayer. "Guard strictly your habit of prayers,
                                        especially the Middle Prayer."
                                    </p>
                                    <div className="mt-8 flex items-end gap-4 sm:mt-10">
                                        <span className="text-5xl font-thin sm:text-6xl lg:text-7xl">
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

                        <div className="mt-5 hidden grid-cols-1 gap-5 md:grid lg:grid-cols-12">
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

                        <section className="mt-14 hidden md:block">
                            <div className="mb-4 flex items-end justify-between gap-3">
                                <h2 className="text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl">
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
                                <div className="overflow-x-auto">
                                    <div className="min-w-[760px]">
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
                                                        day.gregorian ===
                                                        format(nowInTimezone, "dd MMM yyyy");
                                                    const currentPrayerName = focus.current.name;

                                                    const timeCellClass = (prayerName: string) =>
                                                        isTodayRow &&
                                                        prayerName === currentPrayerName
                                                            ? "text-[#f9c03d]"
                                                            : "";

                                                    return (
                                                        <div
                                                            key={day.gregorian}
                                                            className="grid grid-cols-7 rounded-2xl bg-[#191b25] px-6 py-5 text-base sm:text-lg"
                                                        >
                                                            <span className="font-medium text-[#e1e1f0]">
                                                                {day.gregorian.split(" ")[0]}{" "}
                                                                {day.gregorian.split(" ")[1]}
                                                            </span>
                                                            <span className={timeCellClass("Fajr")}>
                                                                {day.fajr}
                                                            </span>
                                                            <span
                                                                className={timeCellClass("Sunrise")}
                                                            >
                                                                {data.timings.prayers.find(
                                                                    (p) => p.name === "Sunrise",
                                                                )?.time24 ?? "--:--"}
                                                            </span>
                                                            <span
                                                                className={timeCellClass("Dhuhr")}
                                                            >
                                                                {data.timings.prayers.find(
                                                                    (p) => p.name === "Dhuhr",
                                                                )?.time24 ?? "--:--"}
                                                            </span>
                                                            <span className={timeCellClass("Asr")}>
                                                                {data.timings.prayers.find(
                                                                    (p) => p.name === "Asr",
                                                                )?.time24 ?? "--:--"}
                                                            </span>
                                                            <span
                                                                className={timeCellClass("Maghrib")}
                                                            >
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
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </section>
            <MobileBottomNav />
        </main>
    );
}
