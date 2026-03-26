import { NextResponse } from "next/server";

import { getDashboardData } from "@/lib/aladhan";
import type { LocationPreferences } from "@/lib/types";

const parseMethod = (raw: string | null): number => {
    const method = Number(raw);
    return Number.isFinite(method) && method > 0 ? method : 2;
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
    const method = parseMethod(searchParams.get("method"));
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
        const data = await getDashboardData(prefs);
        return NextResponse.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load dashboard data";
        return NextResponse.json({ message }, { status: 500 });
    }
}
