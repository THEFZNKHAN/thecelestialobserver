"use client";

import { useEffect, useMemo, useState } from "react";

import { getCurrentAndNextPrayer } from "@/lib/prayer";
import { defaultPreferences, getStoredPreferences, setStoredPreferences } from "@/lib/storage";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { TopNav } from "@/components/site/top-nav";
import type { DashboardData, LocationPreferences } from "@/lib/types";

export function LandingPage() {
    const [prefs, setPrefs] = useState<LocationPreferences>(defaultPreferences);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());
    const [locationModal, setLocationModal] = useState<"search" | "geo" | null>(null);
    const [cityInput, setCityInput] = useState("");
    const [countryInput, setCountryInput] = useState("");
    const [locationMessage, setLocationMessage] = useState<string | null>(null);
    const [citySuggestions, setCitySuggestions] = useState<
        Array<{
            city: string;
            country: string;
            latitude: number;
            longitude: number;
            timezone?: string;
        }>
    >([]);
    const [searchingCities, setSearchingCities] = useState(false);

    const fetchDashboard = (nextPrefs: LocationPreferences) => {
        const params = new URLSearchParams({
            city: nextPrefs.city,
            country: nextPrefs.country,
            method: String(nextPrefs.method),
        });
        if (typeof nextPrefs.latitude === "number" && typeof nextPrefs.longitude === "number") {
            params.set("latitude", String(nextPrefs.latitude));
            params.set("longitude", String(nextPrefs.longitude));
        }
        return fetch(`/api/dashboard?${params.toString()}`)
            .then((res) => res.json())
            .then((payload: DashboardData) => {
                payload.timings.prayers = payload.timings.prayers.map((prayer) => ({
                    ...prayer,
                    date: new Date(prayer.date),
                }));
                setData(payload);
            });
    };

    useEffect(() => {
        const stored = getStoredPreferences();
        setPrefs(stored);
        setCityInput(stored.city);
        setCountryInput(stored.country);
        setLoading(true);
        fetchDashboard(stored).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (locationModal !== "search") return;
        const query = cityInput.trim();
        if (query.length < 2) {
            setCitySuggestions([]);
            return;
        }

        const controller = new AbortController();
        setSearchingCities(true);
        fetch(`/api/search-city?q=${encodeURIComponent(query)}`, { signal: controller.signal })
            .then((res) => res.json())
            .then((payload: unknown) => {
                if (Array.isArray(payload)) {
                    setCitySuggestions(
                        payload.filter(
                            (
                                item,
                            ): item is {
                                city: string;
                                country: string;
                                latitude: number;
                                longitude: number;
                                timezone?: string;
                            } => {
                                return (
                                    typeof item === "object" &&
                                    item !== null &&
                                    "city" in item &&
                                    "country" in item
                                );
                            },
                        ),
                    );
                    return;
                }
                setCitySuggestions([]);
            })
            .catch(() => {})
            .finally(() => setSearchingCities(false));

        return () => controller.abort();
    }, [cityInput, locationModal]);

    const focus = useMemo(() => {
        if (!data) return null;
        return getCurrentAndNextPrayer(data.timings.prayers, now);
    }, [data, now]);

    const fastingPercent = useMemo(() => {
        if (!data) return 0;
        const fajr = data.timings.prayers.find((p) => p.name === "Fajr")?.date;
        const maghrib = data.timings.prayers.find((p) => p.name === "Maghrib")?.date;

        if (!fajr || !maghrib) return 0;
        if (now <= fajr) return 0;
        if (now >= maghrib) return 100;

        const total = maghrib.getTime() - fajr.getTime();
        const elapsed = now.getTime() - fajr.getTime();
        return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
    }, [data, now]);

    const heroImage =
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDrhYPiUeYxA3H-JuKLabCABCpmE3ttUJqV7vTNxEc9Tnb9u0I0cVN1xrIxTiM4uGMHsIAa4YOouWmo45qvRx4pfNhMpfb3n46GiG33I6SWAdWIMkRkY0pSErGcJdWz7Csntd2EPaeopC5J_4s87Rbhh8i8nHjDDxJXf4V3KpoR2ehOfMX8YXLtMMlJd_jY5f_g25zGDmHhmVGGTxnOm9HIQ0uCX8cM8NJwG858G4jNHy-ePXsusloJBTL3BzZh2TCrBroYUF6uDHk";

    const quotes = [
        '"Indeed, in the remembrance of Allah do hearts find rest. Those who believe and do righteous deeds - a good state is theirs and a good return." - Surah Ar-Ra\'d 13:28-29',
        '"And whoever is mindful of Allah, He will make a way out for them, and provide for them from where they never expected. Whoever puts their trust in Allah, He is sufficient for them." - Surah At-Talaq 65:2-3',
        '"So be patient with gracious patience. Surely, with hardship comes ease; surely, with that hardship comes more ease. So when you are done, strive, and to your Lord turn all your attention." - Surah Ash-Sharh 94:5-8',
        '"Allah does not burden a soul beyond what it can bear. It will have the reward of what good it has earned, and it will bear the consequence of what evil it has done." - Surah Al-Baqarah 2:286',
    ];

    const dailyQuote = useMemo(() => {
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const dayOfYear = Math.floor(diff / 86_400_000);
        return quotes[dayOfYear % quotes.length];
    }, [now]);

    const formatCountdown = (target: Date) => {
        const ms = target.getTime() - now.getTime();
        if (ms <= 0) return "0M";
        const totalMinutes = Math.floor(ms / 60000);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return h > 0 ? `${h}H ${m}M` : `${m}M`;
    };

    const getNextOccurrence = (name: "Fajr" | "Maghrib") => {
        const base = data?.timings.prayers.find((p) => p.name === name)?.date;
        if (!base) return null;
        if (base > now) return base;
        const next = new Date(base);
        next.setDate(next.getDate() + 1);
        return next;
    };

    const applyLocation = async (nextPrefs: LocationPreferences) => {
        setPrefs(nextPrefs);
        setStoredPreferences(nextPrefs);
        setLoading(true);
        await fetchDashboard(nextPrefs).finally(() => setLoading(false));
    };

    const handleSearchCity = () => {
        setLocationModal("search");
        setLocationMessage(null);
        setCitySuggestions([]);
    };

    const handleSaveLocation = async () => {
        const city = cityInput.trim();
        const country = countryInput.trim();
        if (!city || !country) {
            setLocationMessage("Please enter both city and country.");
            return;
        }
        const nextPrefs: LocationPreferences = {
            ...prefs,
            city,
            country,
            latitude: undefined,
            longitude: undefined,
        };
        await applyLocation(nextPrefs);
        setLocationMessage("Location updated.");
    };

    const handleUseMyLocation = () => {
        setLocationModal("geo");
        setLocationMessage("Detecting your current location...");
        if (!navigator.geolocation) {
            setLocationMessage("Geolocation is not supported in this browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const url = new URL("https://nominatim.openstreetmap.org/reverse");
                    url.searchParams.set("format", "json");
                    url.searchParams.set("lat", String(coords.latitude));
                    url.searchParams.set("lon", String(coords.longitude));
                    const res = await fetch(url.toString());
                    const payload = await res.json();
                    const city =
                        payload.address?.city ||
                        payload.address?.town ||
                        payload.address?.village ||
                        prefs.city;
                    const country = payload.address?.country || prefs.country;
                    const nextPrefs: LocationPreferences = {
                        ...prefs,
                        city,
                        country,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                    };
                    setCityInput(city);
                    setCountryInput(country);
                    await applyLocation(nextPrefs);
                    setLocationMessage("Location updated from your device.");
                } catch {
                    setLocationMessage("Could not detect location. Enter city manually.");
                }
            },
            () => setLocationMessage("Location permission denied. Enter city manually."),
        );
    };

    const handleDetectByIp = async () => {
        setLocationModal("geo");
        setLocationMessage("Detecting from network location...");
        try {
            const res = await fetch("/api/geo");
            const payload = (await res.json()) as {
                city?: string;
                country?: string;
                latitude?: number;
                longitude?: number;
                detected?: boolean;
                error?: string;
            };
            if (!payload.detected || !payload.city || !payload.country) {
                setLocationMessage(payload.error ?? "Could not detect location.");
                return;
            }
            setCityInput(payload.city);
            setCountryInput(payload.country);
            await applyLocation({
                ...prefs,
                city: payload.city,
                country: payload.country,
                latitude:
                    typeof (payload as { latitude?: number }).latitude === "number"
                        ? (payload as { latitude?: number }).latitude
                        : prefs.latitude,
                longitude:
                    typeof (payload as { longitude?: number }).longitude === "number"
                        ? (payload as { longitude?: number }).longitude
                        : prefs.longitude,
            });
            setLocationMessage("Location detected from network.");
        } catch {
            setLocationMessage("Could not detect location.");
        }
    };

    const handlePickSuggestion = async (
        city: string,
        country: string,
        latitude: number,
        longitude: number,
    ) => {
        setCityInput(city);
        setCountryInput(country);
        setCitySuggestions([]);
        await applyLocation({ ...prefs, city, country, latitude, longitude });
        setLocationModal(null);
    };

    return (
        <div className="bg-[#11131d] text-[#e1e1f0]">
            <TopNav active="home" transparentOnTop />

            <main className="pb-24 md:pb-0">
                <section className="relative flex min-h-[760px] items-center justify-center overflow-hidden px-4 pb-8 pt-6 sm:px-6 md:min-h-[860px] md:pt-24 lg:px-8">
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="night sky with crescent moon"
                            className="h-full w-full object-cover opacity-40 mix-blend-screen"
                            src={heroImage}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#11131d]/50 to-[#11131d]" />
                    </div>

                    <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
                        <div className="space-y-8 lg:col-span-7">
                            <div className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f9c03d]">
                                    Sacred Precision
                                </span>
                                <h1 className="text-4xl font-light leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                                    Align with the <br />
                                    <span className="font-normal italic text-[#f9c03d]">
                                        Celestial
                                    </span>{" "}
                                    Rhythm.
                                </h1>
                            </div>
                            <p className="max-w-xl text-base leading-relaxed text-[#c7c6c6] md:text-lg">
                                {dailyQuote}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    onClick={handleUseMyLocation}
                                    className="flex items-center gap-3 rounded-xl bg-[#f9c03d] px-8 py-4 font-semibold text-[#402d00] shadow-lg shadow-[#f9c03d]/20"
                                >
                                    <span className="material-symbols-outlined">my_location</span>
                                    Use my location
                                </button>
                                <button
                                    onClick={handleSearchCity}
                                    className="flex items-center gap-3 rounded-xl border border-[#4f4634]/20 bg-[rgba(50,52,63,0.6)] px-8 py-4 font-medium text-white"
                                >
                                    <span className="material-symbols-outlined">search</span>
                                    Search City
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="relative overflow-hidden rounded-3xl border border-[#4f4634]/10 bg-[rgba(50,52,63,0.6)] p-5 shadow-2xl sm:p-6 lg:p-8">
                                <div className="absolute right-0 top-0 p-6 opacity-20">
                                    <span
                                        className="material-symbols-outlined text-8xl text-[#f9c03d]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        nights_stay
                                    </span>
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#c7c6c6]">
                                                Current Location
                                            </h3>
                                            <p className="text-xl font-medium text-white">
                                                {prefs.city}, {prefs.country}
                                            </p>
                                        </div>
                                        <span className="inline-block rounded-full border border-[#f9c03d]/20 bg-[#f9c03d]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-tighter text-[#f9c03d]">
                                            Live Status
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="rounded-2xl bg-[#191b25] p-6">
                                            <p className="mb-1 text-xs font-bold uppercase text-[#c7c6c6]">
                                                Sehr Ends
                                            </p>
                                            <p className="text-3xl font-light tracking-tighter text-white">
                                                {data?.timings.prayers.find(
                                                    (p) => p.name === "Fajr",
                                                )?.time24 ?? "--:--"}
                                            </p>
                                            <p className="mt-2 text-[10px] font-medium text-[#f9c03d]">
                                                {loading
                                                    ? "LOADING"
                                                    : getNextOccurrence("Fajr")
                                                      ? formatCountdown(getNextOccurrence("Fajr")!)
                                                      : "--"}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-[#32343f] p-6">
                                            <p className="mb-1 text-xs font-bold uppercase text-[#c7c6c6]">
                                                Iftar Starts
                                            </p>
                                            <p className="text-3xl font-light tracking-tighter text-white">
                                                {data?.timings.prayers.find(
                                                    (p) => p.name === "Maghrib",
                                                )?.time24 ?? "--:--"}
                                            </p>
                                            <p className="mt-2 text-[10px] font-medium text-[#c7c6c6]">
                                                {getNextOccurrence("Maghrib")
                                                    ? formatCountdown(getNextOccurrence("Maghrib")!)
                                                    : "--"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold uppercase text-[#c7c6c6]/60">
                                            <span>Fasting Progress</span>
                                            <span>{fastingPercent}%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#191b25]">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-[#daa520] to-[#f9c03d]"
                                                style={{ width: `${fastingPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl space-y-10 px-4 py-16 sm:px-6 md:space-y-12 lg:space-y-16 lg:px-8 lg:py-24">
                    <div className="max-w-2xl">
                        <h2 className="mb-4 text-4xl font-light leading-tight text-white">
                            Precision crafted for your{" "}
                            <span className="text-[#f9c03d]">spiritual focus</span>.
                        </h2>
                        <p className="text-[#c7c6c6]">
                            We&apos;ve removed the noise to give you a tool that respects your time
                            and your devotion.
                        </p>
                    </div>
                    <div className="grid h-auto grid-cols-1 gap-4 md:h-[600px] md:grid-cols-12 md:gap-6">
                        <div className="group relative overflow-hidden rounded-3xl bg-[#191b25] p-10 md:col-span-8">
                            <div className="relative z-10 max-w-sm">
                                <span className="material-symbols-outlined mb-6 text-4xl text-[#f9c03d]">
                                    query_stats
                                </span>
                                <h3 className="mb-4 text-2xl font-medium text-white">
                                    Hyper-Local Accuracy
                                </h3>
                                <p className="leading-relaxed text-[#c7c6c6]">
                                    Using high-precision astronomical algorithms used by leading
                                    observatories to ensure your timings are accurate to your exact
                                    coordinates.
                                </p>
                            </div>
                            <div className="absolute bottom-0 right-0 h-full w-1/2 opacity-30 transition-opacity group-hover:opacity-50">
                                <img
                                    alt="earth satellite view"
                                    className="h-full w-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbhgntOf4MiZOt3diraYdd8Jj-Hil0iGQ1P2laxj__eJGjrCaiVjUpTfm0FrbZV3JCOROkmoL6Z1Eqh3ohNKuv3Mzvfi6EceXKElfj4_0x3G_-_osMggBIuCLKno6y65Zi_Y4BNisUhlwRZZRWEitV4fix2vT4lLksOf3jZDjTaOD5tjgpRMRYDbvr5Ai3Icwccy26vLOWUIc_oFjGfxlU_I3nA-mqCkd_zwrJghYzJEQHztWUnberW63CZBb9LWOhh7_ycvJWQNg"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center space-y-6 rounded-3xl bg-[#282934] p-10 text-center md:col-span-4">
                            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-[#11131d] to-[#f9c03d]/20 shadow-[0_0_50px_rgba(249,192,61,0.1)]">
                                <span
                                    className="material-symbols-outlined text-6xl text-white"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    brightness_2
                                </span>
                            </div>
                            <div>
                                <h3 className="mb-2 text-xl font-medium text-white">
                                    Lunar Cycles
                                </h3>
                                <p className="text-sm text-[#c7c6c6]">
                                    Visualize the current moon phase and track the Hijri calendar
                                    with ease.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between rounded-3xl bg-[#282934] p-10 md:col-span-4">
                            <span className="material-symbols-outlined text-3xl text-[#f9c03d]">
                                notifications_active
                            </span>
                            <div>
                                <h3 className="mb-2 text-xl font-medium text-white">
                                    Smart Alerts
                                </h3>
                                <p className="text-sm leading-relaxed text-[#c7c6c6]">
                                    Gentle haptic reminders for Suhoor, Iftar, and all five daily
                                    prayers.
                                </p>
                            </div>
                        </div>
                        <div className="group flex items-center justify-between rounded-3xl bg-[#191b25] p-10 md:col-span-8">
                            <div className="max-w-xs">
                                <h3 className="mb-4 text-2xl font-medium text-white">
                                    Dark Mode Sanctuary
                                </h3>
                                <p className="leading-relaxed text-[#c7c6c6]">
                                    A visual experience designed to be easy on the eyes during late
                                    night and early morning hours.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-24 w-12 rounded-full border border-[#4f4634]/20 bg-[#11131d]" />
                                <div className="mt-8 h-24 w-12 rounded-full bg-[#daa520]" />
                                <div className="h-24 w-12 rounded-full bg-[#32343f]" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-y border-[#4f4634]/10 bg-[#0c0e18] px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 md:flex-row">
                        <div className="space-y-4 text-center md:text-left">
                            <h2 className="text-3xl font-light text-white">Ready to observe?</h2>
                            <p className="text-[#c7c6c6]">
                                Join thousands of observers worldwide aligning their time with the
                                stars.
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <div className="mb-1 text-4xl font-light tracking-tighter text-[#f9c03d]">
                                    24/7
                                </div>
                                <div className="text-[10px] font-bold uppercase text-[#c7c6c6]">
                                    Real-time Data
                                </div>
                            </div>
                            <div className="h-12 w-px bg-[#4f4634]/30" />
                            <div className="text-center">
                                <div className="mb-1 text-4xl font-light tracking-tighter text-[#f9c03d]">
                                    100%
                                </div>
                                <div className="text-[10px] font-bold uppercase text-[#c7c6c6]">
                                    Privacy Focused
                                </div>
                            </div>
                            <div className="h-12 w-px bg-[#4f4634]/30" />
                            <div className="text-center">
                                <div className="mb-1 text-4xl font-light tracking-tighter text-[#f9c03d]">
                                    5k+
                                </div>
                                <div className="text-[10px] font-bold uppercase text-[#c7c6c6]">
                                    Cities Covered
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {locationModal && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 px-4">
                    <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#4f4634]/20 bg-[#191b25] p-5 shadow-2xl">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-white">
                                    {locationModal === "geo"
                                        ? "Use Current Location"
                                        : "Search by City"}
                                </h3>
                                <p className="mt-1 text-sm text-[#c7c6c6]">
                                    {locationModal === "geo"
                                        ? "Confirm detected city and country."
                                        : "Set your city and country for prayer timings."}
                                </p>
                            </div>
                            <button
                                onClick={() => setLocationModal(null)}
                                aria-label="Close modal"
                                className="grid h-7 w-7 place-items-center rounded-full text-[#8e93a7] transition-colors hover:bg-[#2a2d3a] hover:text-white"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        {locationModal === "search" ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 rounded-xl border border-[#4f4634]/30 bg-[#11131d] px-3 py-2 focus-within:border-[#f9c03d]/40">
                                    <span className="material-symbols-outlined text-[#8e93a7]">
                                        search
                                    </span>
                                    <input
                                        value={cityInput}
                                        onChange={(e) => setCityInput(e.target.value)}
                                        placeholder="Search city or country..."
                                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8e93a7]"
                                    />
                                    <button
                                        onClick={() => setLocationModal(null)}
                                        aria-label="Close search"
                                        className="grid h-6 w-6 place-items-center rounded-full text-[#8e93a7] transition-colors hover:bg-[#2a2d3a] hover:text-white"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            close
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 rounded-xl border border-[#4f4634]/30 bg-[#11131d] px-3 py-2">
                                    <span className="material-symbols-outlined text-[#8e93a7]">
                                        my_location
                                    </span>
                                    <p className="w-full text-sm text-white">
                                        {cityInput && countryInput
                                            ? `${cityInput}, ${countryInput}`
                                            : "Detecting your location..."}
                                    </p>
                                </div>
                                <button
                                    onClick={handleSaveLocation}
                                    className="w-full rounded-lg bg-[#f9c03d] px-3 py-2 text-sm font-semibold text-[#402d00]"
                                >
                                    Use this location
                                </button>
                                <button
                                    onClick={handleDetectByIp}
                                    className="w-full rounded-lg border border-[#4f4634]/30 px-3 py-2 text-sm text-[#c7c6c6]"
                                >
                                    Detect via network (IP)
                                </button>
                            </div>
                        )}

                        {locationModal === "search" && (
                            <div className="mt-3 max-h-56 overflow-auto rounded-xl border border-[#4f4634]/20 bg-[#11131d]">
                                {searchingCities && (
                                    <p className="px-3 py-2 text-xs text-[#c7c6c6]">
                                        Searching cities...
                                    </p>
                                )}
                                {!searchingCities &&
                                    citySuggestions.length === 0 &&
                                    cityInput.trim().length >= 2 && (
                                        <p className="px-3 py-2 text-xs text-[#c7c6c6]">
                                            No cities found.
                                        </p>
                                    )}
                                {!searchingCities &&
                                    citySuggestions.map((item) => (
                                        <button
                                            key={`${item.city}-${item.country}-${item.latitude}`}
                                            onClick={() =>
                                                handlePickSuggestion(
                                                    item.city,
                                                    item.country,
                                                    item.latitude,
                                                    item.longitude,
                                                )
                                            }
                                            className="block w-full border-b border-[#4f4634]/10 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-[#1d1f2a]"
                                        >
                                            {item.city}, {item.country}
                                        </button>
                                    ))}
                            </div>
                        )}

                        {locationMessage && (
                            <p className="mt-3 text-xs text-[#c7c6c6]">{locationMessage}</p>
                        )}
                    </div>
                </div>
            )}
            <MobileBottomNav />
        </div>
    );
}
