import { addDays, isAfter, parse } from "date-fns";

import { PRAYER_ORDER, type PrayerName, type PrayerTiming } from "@/lib/types";

const cleanTime = (raw: string): string => raw.split(" ")[0];

export const buildPrayerDate = (time24: string, baseDate: Date): Date => {
    const normalized = cleanTime(time24);
    return parse(normalized, "HH:mm", baseDate);
};

export const normalizePrayerList = (
    timings: Record<PrayerName, string>,
    baseDate: Date,
): PrayerTiming[] =>
    PRAYER_ORDER.map((name) => {
        const time24 = cleanTime(timings[name]);
        return {
            name,
            time24,
            date: buildPrayerDate(time24, baseDate),
        };
    });

export const getCurrentAndNextPrayer = (
    prayers: PrayerTiming[],
    now = new Date(),
): { current: PrayerTiming; next: PrayerTiming } => {
    const nextPrayer = prayers.find((prayer) => isAfter(prayer.date, now));

    if (!nextPrayer) {
        const current = prayers[prayers.length - 1];
        const next = { ...prayers[0], date: addDays(prayers[0].date, 1) };
        return { current, next };
    }

    const nextIndex = prayers.findIndex((prayer) => prayer.name === nextPrayer.name);
    const current = nextIndex > 0 ? prayers[nextIndex - 1] : prayers[prayers.length - 1];

    return { current, next: nextPrayer };
};

export const getCountdownLabel = (nextDate: Date, now = new Date()): string => {
    const ms = Math.max(nextDate.getTime() - now.getTime(), 0);
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
};

export const getFastingProgress = (fajrDate: Date, maghribDate: Date, now = new Date()): string => {
    if (isAfter(fajrDate, now)) {
        return "Fasting has not started yet";
    }
    if (isAfter(now, maghribDate)) {
        return "Fasting window ended for today";
    }

    const elapsed = now.getTime() - fajrDate.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m since Fajr`;
};
