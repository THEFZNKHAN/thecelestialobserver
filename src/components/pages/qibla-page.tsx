"use client";

import { useEffect, useMemo, useState } from "react";

import { TopNav } from "@/components/site/top-nav";
import { defaultPreferences, getStoredPreferences } from "@/lib/storage";
import type { DashboardData, LocationPreferences } from "@/lib/types";

export function QiblaPage() {
    const [prefs, setPrefs] = useState<LocationPreferences>(defaultPreferences);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

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
                setData(payload);
            })
            .finally(() => setLoading(false));
    }, []);

    const direction = data?.qibla.direction ?? 0;
    const qiblaCardinal = useMemo(() => {
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        return directions[Math.round(direction / 45) % 8];
    }, [direction]);

    const distanceKm = useMemo(() => {
        if (!data) return 0;

        const kaabaLat = 21.4225;
        const kaabaLng = 39.8262;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const earthRadiusKm = 6371;
        const lat1 = toRad(data.qibla.latitude);
        const lat2 = toRad(kaabaLat);
        const dLat = toRad(kaabaLat - data.qibla.latitude);
        const dLng = toRad(kaabaLng - data.qibla.longitude);
        const a =
            Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(earthRadiusKm * c);
    }, [data]);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#11131d] text-[#e1e1f0]">
            <TopNav active="qibla" />

            <main className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-20 pt-32">
                <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    {loading && (
                        <section className="rounded-3xl border border-white/10 bg-[#191b25]/70 p-6 text-center lg:col-span-2">
                            Loading live qibla data...
                        </section>
                    )}

                    {!loading && data && (
                        <>
                            <article className="flex flex-col items-start">
                                <section className="mb-12 w-full">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-[#f9c03d]">
                                            location_on
                                        </span>
                                        <span className="text-[0.75rem] font-bold uppercase tracking-widest text-[#c7c6c6]">
                                            {prefs.city}, {prefs.country}
                                        </span>
                                    </div>
                                    <h1 className="mb-4 text-4xl leading-tight lg:text-5xl">
                                        Qibla Direction
                                    </h1>
                                    <p className="max-w-md text-base leading-relaxed text-[#c7c6c6] opacity-80 lg:text-lg">
                                        Find your sacred alignment with high-precision celestial
                                        tracking, calibrated for your current geographical
                                        coordinates.
                                    </p>
                                </section>

                                <div className="grid w-full grid-cols-2 gap-4">
                                    <div className="col-span-2 flex items-center justify-between rounded-xl border border-[#f9c03d]/20 bg-[#f9c03d]/10 p-6">
                                        <div>
                                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#f9c03d]">
                                                Status
                                            </p>
                                            <h2 className="text-lg font-medium text-[#e1e1f0]">
                                                Perfectly Aligned
                                            </h2>
                                        </div>
                                        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f9c03d]">
                                            <span className="material-symbols-outlined text-[#402d00]">
                                                check_circle
                                            </span>
                                        </div>
                                    </div>

                                    <article className="rounded-xl border border-[#4f4634]/10 bg-[#191b25] p-6">
                                        <span className="material-symbols-outlined mb-2 text-xl text-[#c7c6c6]">
                                            straighten
                                        </span>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#c7c6c6]">
                                            Distance
                                        </p>
                                        <h3 className="text-3xl font-light">
                                            {distanceKm.toLocaleString()}{" "}
                                            <span className="text-sm text-[#c7c6c6]">km</span>
                                        </h3>
                                    </article>

                                    <article className="rounded-xl border border-[#4f4634]/10 bg-[#191b25] p-6">
                                        <span className="material-symbols-outlined mb-2 text-xl text-[#c7c6c6]">
                                            explore
                                        </span>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#c7c6c6]">
                                            Accuracy
                                        </p>
                                        <h3 className="text-3xl font-light">
                                            High <span className="text-sm text-[#c7c6c6]">±1°</span>
                                        </h3>
                                    </article>
                                </div>

                                <p className="mt-12 text-sm italic leading-relaxed text-[#c7c6c6] opacity-60">
                                    "And from wherever you go out, turn your face toward al-Masjid
                                    al-Haram..."
                                </p>
                            </article>

                            <article className="flex items-center justify-center">
                                <div className="relative aspect-square w-full max-w-[420px]">
                                    <div className="absolute inset-0 rounded-full border border-[#4f4634]/20 bg-[#191b25]/40 shadow-[0_0_80px_-10px_rgba(249,192,61,0.2)] backdrop-blur-md" />
                                    <div className="absolute inset-4 rounded-full border border-[#4f4634]/10 opacity-40">
                                        <div className="absolute inset-0 flex justify-center py-4 text-xs font-bold text-[#c7c6c6]">
                                            N
                                        </div>
                                        <div className="absolute inset-0 flex items-end justify-center py-4 text-xs font-bold text-[#c7c6c6]">
                                            S
                                        </div>
                                        <div className="absolute inset-0 flex items-center px-4 text-xs font-bold text-[#c7c6c6]">
                                            W
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-end px-4 text-xs font-bold text-[#c7c6c6]">
                                            E
                                        </div>
                                    </div>

                                    <div
                                        className="absolute inset-12 transition-transform duration-700 ease-out"
                                        style={{ transform: `rotate(${direction}deg)` }}
                                    >
                                        <div className="absolute left-1/2 top-1/2 h-[340px] w-1.5 -translate-x-1/2 -translate-y-1/2">
                                            <div className="relative h-1/2 rounded-t-full bg-gradient-to-t from-[#f9c03d] to-[#ffdea0] shadow-[0_0_15px_rgba(249,192,61,0.5)]">
                                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full border border-[#f9c03d]/30 bg-[#32343f] p-2">
                                                    <span className="material-symbols-outlined text-[#f9c03d]">
                                                        mosque
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-1/2 rounded-b-full bg-[#32343f]/50" />
                                        </div>
                                    </div>

                                    <div className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#4f4634]/30 bg-[#32343f] shadow-2xl">
                                        <span className="text-4xl font-thin tracking-tighter text-[#f9c03d]">
                                            {Math.round(direction)}°
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#c7c6c6]">
                                            {qiblaCardinal}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
