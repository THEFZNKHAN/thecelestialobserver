"use client";

import type { LocationPreferences } from "@/lib/types";

const STORAGE_KEY = "celestial_observer_prefs";

export const defaultPreferences: LocationPreferences = {
    city: "New Delhi",
    country: "India",
    method: 2,
};

export const getStoredPreferences = (): LocationPreferences => {
    if (typeof window === "undefined") {
        return defaultPreferences;
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return defaultPreferences;
        }
        const parsed = JSON.parse(raw) as Partial<LocationPreferences>;
        return {
            city: parsed.city?.trim() || defaultPreferences.city,
            country: parsed.country?.trim() || defaultPreferences.country,
            method: Number(parsed.method) || defaultPreferences.method,
        };
    } catch {
        return defaultPreferences;
    }
};

export const setStoredPreferences = (prefs: LocationPreferences): void => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};
