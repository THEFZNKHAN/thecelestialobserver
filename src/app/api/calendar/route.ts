import { NextResponse } from "next/server";

import { getMonthlyCalendar } from "@/lib/aladhan";
import type { LocationPreferences } from "@/lib/types";

const parseNumber = (raw: string | null, fallback: number) => {
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
};

const parseCoordinate = (raw: string | null): number | undefined => {
    if (!raw) return undefined;
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city")?.trim() || "New Delhi";
    const country = searchParams.get("country")?.trim() || "India";
    const method = parseNumber(searchParams.get("method"), 2);
    const month = parseNumber(searchParams.get("month"), new Date().getMonth() + 1);
    const year = parseNumber(searchParams.get("year"), new Date().getFullYear());
    const latitude = parseCoordinate(searchParams.get("latitude"));
    const longitude = parseCoordinate(searchParams.get("longitude"));

    const prefs: LocationPreferences = {
        city,
        country,
        method,
        latitude,
        longitude,
    };

    try {
        const data = await getMonthlyCalendar(prefs, month, year);
        return NextResponse.json({ days: data });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load calendar data";
        return NextResponse.json({ message }, { status: 500 });
    }
}
