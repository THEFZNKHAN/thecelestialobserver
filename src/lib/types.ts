export const PRAYER_ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export type PrayerName = (typeof PRAYER_ORDER)[number];

export type LocationPreferences = {
    city: string;
    country: string;
    method: number;
};

export type HijriDate = {
    day: string;
    month: string;
    year: string;
};

export type PrayerTiming = {
    name: PrayerName;
    time24: string;
    date: Date;
};

export type PrayerTimings = {
    prayers: PrayerTiming[];
    hijri: HijriDate;
    readableDate: string;
    timezone: string;
    latitude: number;
    longitude: number;
};

export type QiblaInfo = {
    direction: number;
    latitude: number;
    longitude: number;
};

export type DashboardData = {
    timings: PrayerTimings;
    qibla: QiblaInfo;
};

export type CalendarDay = {
    gregorian: string;
    hijriDay: string;
    hijriMonth: string;
    hijriYear: string;
    fajr: string;
    maghrib: string;
};
