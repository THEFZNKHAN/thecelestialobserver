import { format } from "date-fns";

import { getCurrentAndNextPrayer, normalizePrayerList } from "@/lib/prayer";
import {
    calendarByCityResponseSchema,
    prayerTimesResponseSchema,
    qiblaResponseSchema,
    type CalendarByCityResponse,
    type PrayerTimesResponse,
} from "@/lib/schemas";
import type { CalendarDay, DashboardData, LocationPreferences } from "@/lib/types";

const BASE_URL = "https://api.aladhan.com/v1";

const fetchJson = async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
        next: { revalidate: 60 },
    });

    if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
    }

    return (await response.json()) as T;
};

const getPrayerTimesByCity = async (prefs: LocationPreferences): Promise<PrayerTimesResponse> => {
    const params = new URLSearchParams({
        city: prefs.city,
        country: prefs.country,
        method: String(prefs.method),
    });

    const payload = await fetchJson<unknown>(`${BASE_URL}/timingsByCity?${params.toString()}`);
    return prayerTimesResponseSchema.parse(payload);
};

const getQiblaDirection = async (latitude: number, longitude: number) => {
    const payload = await fetchJson<unknown>(`${BASE_URL}/qibla/${latitude}/${longitude}`);
    return qiblaResponseSchema.parse(payload);
};

export const getDashboardData = async (prefs: LocationPreferences): Promise<DashboardData> => {
    const prayerResponse = await getPrayerTimesByCity(prefs);
    const { timings, date, meta } = prayerResponse.data;

    const baseDate = new Date();
    const prayers = normalizePrayerList(timings, baseDate);
    const qiblaResponse = await getQiblaDirection(meta.latitude, meta.longitude);

    return {
        timings: {
            prayers,
            hijri: {
                day: date.hijri.day,
                month: date.hijri.month.en,
                year: date.hijri.year,
            },
            readableDate: date.readable || format(baseDate, "dd MMM yyyy"),
            timezone: meta.timezone,
            latitude: meta.latitude,
            longitude: meta.longitude,
        },
        qibla: {
            direction: qiblaResponse.data.direction,
            latitude: qiblaResponse.data.latitude,
            longitude: qiblaResponse.data.longitude,
        },
    };
};

export const getFocusData = (data: DashboardData) =>
    getCurrentAndNextPrayer(data.timings.prayers, new Date());

const getCalendarByCity = async (
    prefs: LocationPreferences,
    month: number,
    year: number,
): Promise<CalendarByCityResponse> => {
    const params = new URLSearchParams({
        city: prefs.city,
        country: prefs.country,
        method: String(prefs.method),
        month: String(month),
        year: String(year),
    });
    const payload = await fetchJson<unknown>(`${BASE_URL}/calendarByCity?${params.toString()}`);
    return calendarByCityResponseSchema.parse(payload);
};

export const getMonthlyCalendar = async (
    prefs: LocationPreferences,
    month: number,
    year: number,
): Promise<CalendarDay[]> => {
    const response = await getCalendarByCity(prefs, month, year);
    return response.data.map((day) => ({
        gregorian: day.date.readable,
        hijriDay: day.date.hijri.day,
        hijriMonth: day.date.hijri.month.en,
        hijriYear: day.date.hijri.year,
        fajr: day.timings.Fajr.split(" ")[0],
        maghrib: day.timings.Maghrib.split(" ")[0],
    }));
};
