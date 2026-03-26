"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BottomNav } from "@/components/dashboard/bottom-nav";
import { FastingCard } from "@/components/dashboard/fasting-card";
import { FocusCard } from "@/components/dashboard/focus-card";
import { PrayerList } from "@/components/dashboard/prayer-list";
import { PrefsForm } from "@/components/dashboard/prefs-form";
import { TopBar } from "@/components/dashboard/top-bar";
import { getCountdownLabel, getCurrentAndNextPrayer, getFastingProgress } from "@/lib/prayer";
import { defaultPreferences, getStoredPreferences, setStoredPreferences } from "@/lib/storage";
import type { DashboardData, LocationPreferences } from "@/lib/types";

type Status = "idle" | "loading" | "error";

export function DashboardApp() {
    const [prefs, setPrefs] = useState<LocationPreferences>(defaultPreferences);
    const [data, setData] = useState<DashboardData | null>(null);
    const [status, setStatus] = useState<Status>("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [tick, setTick] = useState<number>(Date.now());

    const loadData = useCallback(async (currentPrefs: LocationPreferences) => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const params = new URLSearchParams({
                city: currentPrefs.city,
                country: currentPrefs.country,
                method: String(currentPrefs.method),
            });
            if (
                typeof currentPrefs.latitude === "number" &&
                typeof currentPrefs.longitude === "number"
            ) {
                params.set("latitude", String(currentPrefs.latitude));
                params.set("longitude", String(currentPrefs.longitude));
            }

            const response = await fetch(`/api/dashboard?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Unable to fetch prayer data");
            }

            const payload = (await response.json()) as DashboardData;
            payload.timings.prayers = payload.timings.prayers.map((prayer) => ({
                ...prayer,
                date: new Date(prayer.date),
            }));
            setData(payload);
            setStatus("idle");
        } catch (error) {
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "Unexpected error");
        }
    }, []);

    useEffect(() => {
        const stored = getStoredPreferences();
        setPrefs(stored);
        void loadData(stored);
    }, [loadData]);

    useEffect(() => {
        const timer = window.setInterval(() => setTick(Date.now()), 60_000);
        return () => window.clearInterval(timer);
    }, []);

    const focus = useMemo(() => {
        if (!data) return null;
        return getCurrentAndNextPrayer(data.timings.prayers, new Date(tick));
    }, [data, tick]);

    const fastingLabel = useMemo(() => {
        if (!data) return "";
        const fajr = data.timings.prayers.find((prayer) => prayer.name === "Fajr")?.date;
        const maghrib = data.timings.prayers.find((prayer) => prayer.name === "Maghrib")?.date;
        if (!fajr || !maghrib) return "";
        return getFastingProgress(fajr, maghrib, new Date(tick));
    }, [data, tick]);

    const savePrefs = (nextPrefs: LocationPreferences) => {
        const sanitized = {
            city: nextPrefs.city.trim(),
            country: nextPrefs.country.trim(),
            method: nextPrefs.method,
            latitude: nextPrefs.latitude,
            longitude: nextPrefs.longitude,
        };
        setStoredPreferences(sanitized);
        setPrefs(sanitized);
        void loadData(sanitized);
    };

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 py-4 md:px-6">
            <TopBar
                title={data?.timings.hijri.month ?? "Prayer Timings"}
                dateLabel={
                    data
                        ? `${data.timings.readableDate} | ${data.timings.hijri.day} ${data.timings.hijri.month} ${data.timings.hijri.year} AH`
                        : format(new Date(), "dd MMM yyyy")
                }
                locationLabel={`${prefs.city}, ${prefs.country}`}
            />

            {status === "loading" && (
                <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
                    Loading prayer times...
                </section>
            )}

            {status === "error" && (
                <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 shadow-sm">
                    <p>{errorMessage}</p>
                    <button
                        type="button"
                        className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                        onClick={() => void loadData(prefs)}
                    >
                        Retry
                    </button>
                </section>
            )}

            {status === "idle" && data && focus && (
                <>
                    <FocusCard
                        currentPrayer={focus.current.name}
                        nextPrayer={focus.next.name}
                        nextTime={format(focus.next.date, "HH:mm")}
                        countdown={getCountdownLabel(focus.next.date, new Date(tick))}
                        qiblaDirection={data.qibla.direction}
                    />
                    <PrayerList prayers={data.timings.prayers} activePrayer={focus.current.name} />
                    <FastingCard label={fastingLabel} />
                </>
            )}

            <PrefsForm value={prefs} onSave={savePrefs} />
            <BottomNav />
        </main>
    );
}
