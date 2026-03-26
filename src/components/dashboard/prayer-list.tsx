import { clsx } from "clsx";
import { CloudSun, MoonStar, Sunrise, Sunset, Sun } from "lucide-react";
import type { ComponentType } from "react";

import type { PrayerTiming } from "@/lib/types";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
    Fajr: Sunrise,
    Sunrise: CloudSun,
    Dhuhr: Sun,
    Asr: Sun,
    Maghrib: Sunset,
    Isha: MoonStar,
};

type PrayerListProps = {
    prayers: PrayerTiming[];
    activePrayer: string;
};

export function PrayerList({ prayers, activePrayer }: PrayerListProps) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-md">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Prayer Times</h3>
                <span className="text-xs text-slate-500">Today</span>
            </div>

            <ul className="space-y-2">
                {prayers.map((prayer) => {
                    const Icon = ICONS[prayer.name];
                    const isActive = prayer.name === activePrayer;

                    return (
                        <li
                            key={prayer.name}
                            className={clsx(
                                "flex items-center justify-between rounded-2xl border px-4 py-3 transition",
                                isActive
                                    ? "border-indigo-300 bg-indigo-50 shadow-sm"
                                    : "border-slate-200 bg-slate-50 hover:bg-slate-100",
                            )}
                        >
                            <span className="inline-flex items-center gap-3 font-medium text-slate-800">
                                <span
                                    className={clsx(
                                        "inline-flex h-9 w-9 items-center justify-center rounded-full",
                                        isActive
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white text-slate-500",
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                </span>
                                {prayer.name}
                            </span>
                            <span
                                className={clsx(
                                    "text-sm font-semibold",
                                    isActive ? "text-indigo-700" : "text-slate-700",
                                )}
                            >
                                {prayer.time24}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
