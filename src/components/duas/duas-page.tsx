"use client";

import { Moon, Settings, Sparkles, Sunrise, Sunset } from "lucide-react";

import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { TopNav } from "@/components/site/top-nav";
const heroBg = "https://www.figma.com/api/mcp/asset/d28c4e71-33e1-41be-9078-230c14f8d5d3";

const categories = [
    { title: "Morning", count: "24 Adhkar", active: true, icon: Sunrise },
    { title: "Evening", count: "18 Adhkar", active: false, icon: Sunset },
    { title: "Post Prayer", count: "12 Adhkar", active: false, icon: Sparkles },
    { title: "Before Sleep", count: "10 Adhkar", active: false, icon: Moon },
];

const cards = [
    {
        step: "1 / 24",
        rep: "Repetitions: 1x",
        count: "0/1",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        translit:
            "Asbahna wa-asbahal-mulku lillahi, wal-hamdu lillahi, la ilaha illallahu wahdahu la sharika lahu...",
        english:
            '"We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah..."',
    },
    {
        step: "2 / 24",
        rep: "Repetitions: 3x",
        count: "2/3",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        translit:
            "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
        english:
            '"In the Name of Allah with Whose Name there is protection against every kind of harm..."',
    },
    {
        step: "3 / 24",
        rep: "Repetitions: 1x",
        count: "0/1",
        arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        translit:
            "Raditu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin (sallallahu 'alayhi wa sallam) nabiyyan.",
        english:
            '"I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad as my Prophet."',
    },
];

export function DuasPage() {
    const sessionTotal = cards.reduce((sum, card) => {
        const parts = card.count.split("/");
        const total = Number(parts[1] ?? 0);
        return sum + total;
    }, 0);
    const sessionCompleted = cards.reduce((sum, card) => {
        const parts = card.count.split("/");
        const completed = Number(parts[0] ?? 0);
        return sum + completed;
    }, 0);
    const sessionPercent =
        sessionTotal > 0 ? Math.round((sessionCompleted / sessionTotal) * 100) : 0;
    const featuredCards = cards.slice(0, 2);

    return (
        <main className="min-h-screen bg-[#0b1020] pb-24 text-[#e1e1f0] md:pb-0">
            <TopNav active="duas" />

            <div className="mx-auto flex w-full max-w-[1088px] flex-col gap-8 px-4 pb-8 pt-6 md:hidden">
                <section className="relative h-64 w-full overflow-hidden rounded-[2rem] bg-[#191b25]">
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="mosque silhouette at night"
                            className="h-full w-full object-cover opacity-60"
                            src={heroBg}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#191b25] via-transparent to-transparent" />
                    </div>
                    <div className="relative z-10 flex h-full flex-col justify-end space-y-2 p-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#f9c03d]">
                            Daily Spiritual Practice
                        </p>
                        <h2 className="text-3xl font-thin tracking-tight text-[#e1e1f0]">
                            Duas & Adhkar
                        </h2>
                    </div>
                </section>

                <section className="relative overflow-hidden rounded-[2rem] bg-[#282934] p-6 shadow-2xl">
                    <div className="absolute right-0 top-0 p-2 opacity-10">
                        <span className="material-symbols-outlined text-8xl">bolt</span>
                    </div>
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-tighter text-[#c7c6c6]">
                                Consistency Streak
                            </h3>
                            <p className="mt-1 text-3xl font-light text-[#f9c03d]">12 Days</p>
                        </div>
                        <div className="relative grid h-14 w-14 place-items-center rounded-full border-2 border-[#f9c03d]/20">
                            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    className="text-[#f9c03d]"
                                    cx="50"
                                    cy="50"
                                    fill="none"
                                    r="45"
                                    stroke="currentColor"
                                    strokeDasharray="283"
                                    strokeDashoffset="70"
                                    strokeWidth="4"
                                />
                            </svg>
                            <span
                                className="material-symbols-outlined text-[#f9c03d]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                workspace_premium
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between gap-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${i < 4 ? "bg-[#f9c03d]" : "bg-[#32343f]"}`}
                            />
                        ))}
                    </div>
                </section>

                <section className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex gap-3">
                        {categories.map((item) => (
                            <button
                                key={item.title}
                                className={`shrink-0 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest ${
                                    item.active
                                        ? "bg-[#f9c03d] text-[#402d00]"
                                        : "bg-[#282934] text-[#d3c5ae]"
                                }`}
                            >
                                {item.title}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="space-y-6 pb-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-light tracking-tight">Today's Focus</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#f9c03d]">
                            2 of 3 Completed
                        </span>
                    </div>

                    {featuredCards.map((card, index) => (
                        <article
                            key={card.step}
                            className={`space-y-6 rounded-[2rem] p-6 ${
                                index === 0
                                    ? "bg-[#191b25]"
                                    : "bg-[#282934] ring-1 ring-[#f9c03d]/20"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f9c03d]/10 text-[#f9c03d]">
                                    <span className="material-symbols-outlined">
                                        {index === 0 ? "light_mode" : "shield"}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-[#c7c6c6]">
                                        Repetition
                                    </span>
                                    <span className="text-lg font-medium text-[#f9c03d]">
                                        {card.count}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p
                                    className="text-right text-3xl leading-loose text-[#e1e1f0]"
                                    dir="rtl"
                                >
                                    {card.arabic}
                                </p>
                                <p className="text-sm italic tracking-wide text-[#f9c03d]/80">
                                    {card.translit}
                                </p>
                                <p className="text-base font-light leading-relaxed text-[#d3c5ae]">
                                    {card.english}
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex -space-x-2">
                                    {Array.from({ length: index === 0 ? 3 : 1 }).map(
                                        (_, dotIdx) => (
                                            <div
                                                key={dotIdx}
                                                className={`h-8 w-8 rounded-full border-2 border-[#191b25] ${
                                                    index === 0 ? "bg-[#f9c03d]" : "bg-[#32343f]"
                                                }`}
                                            />
                                        ),
                                    )}
                                </div>
                                <button
                                    className={`grid h-12 w-12 place-items-center rounded-full ${
                                        index === 0
                                            ? "bg-[#32343f] text-[#f9c03d]"
                                            : "bg-[#f9c03d] text-[#402d00]"
                                    }`}
                                >
                                    <span className="material-symbols-outlined">
                                        {index === 0 ? "done_all" : "add"}
                                    </span>
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </div>

            <div className="mx-auto hidden w-full max-w-[1088px] flex-col gap-6 px-4 py-8 pt-24 md:flex md:gap-8 md:px-6 md:py-14 md:pt-28">
                <section
                    className="relative h-52 overflow-hidden rounded-3xl border border-white/10 sm:h-56 md:h-64"
                    style={{
                        backgroundImage: `linear-gradient(90deg, rgba(17,19,29,0.95) 0%, rgba(17,19,29,0.7) 45%, rgba(17,19,29,0.15) 100%), url(${heroBg})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                    }}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center md:p-10">
                        <h1 className="text-2xl font-light tracking-tight sm:text-3xl md:text-4xl">
                            Daily Duas & Adhkar
                        </h1>
                        <p className="mt-3 max-w-xl text-xs text-[#f9c03d] sm:text-sm md:text-base">
                            "Verily, in the remembrance of Allah do hearts find rest." - Surah
                            Ar-Ra&apos;d 13:28
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
                    {categories.map((item) => (
                        <article
                            key={item.title}
                            className={`rounded-2xl border p-4 md:p-6 ${
                                item.active
                                    ? "border-l-4 border-l-[#f9c03d] border-t-[#2b334a] border-r-[#2b334a] border-b-[#2b334a] bg-[#191b25]/80"
                                    : "border-[#2b334a] bg-[#191b25]/60"
                            }`}
                        >
                            <item.icon
                                className={`h-5 w-5 ${item.active ? "text-[#f9c03d]" : "text-[#8b8f9e]"}`}
                            />
                            <p
                                className={`mt-6 text-xs font-bold uppercase tracking-[1.4px] ${item.active ? "text-[#f9c03d]" : "text-[#c7c6c6]"}`}
                            >
                                {item.title}
                            </p>
                            <p className="mt-2 text-xs text-[#8b8f9e]">{item.count}</p>
                        </article>
                    ))}
                </section>

                <section className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-light md:text-3xl">Morning Adhkar</h2>
                        <p className="text-sm text-[#8b8f9e]">
                            Recommended after Fajr until sunrise
                        </p>
                    </div>
                    <div className="w-full max-w-48">
                        <p className="text-right text-[11px] font-bold uppercase tracking-[1.2px] text-[#f9c03d]">
                            Session Progress
                        </p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#32343f]">
                            <div
                                className="h-full bg-gradient-to-r from-[#f9c03d] to-[#daa520]"
                                style={{ width: `${sessionPercent}%` }}
                            />
                        </div>
                        <p className="mt-2 text-right text-[10px] uppercase tracking-[1px] text-[#8b8f9e]">
                            {sessionCompleted} of {sessionTotal} completed
                        </p>
                    </div>
                </section>

                <section className="flex flex-col gap-6">
                    {cards.map((card) => (
                        <article
                            key={card.step}
                            className="rounded-3xl border border-white/5 bg-[#191b25]/65 p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur md:p-8"
                        >
                            <div className="flex flex-col gap-5 md:flex-row md:justify-between">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="rounded-full border border-[#f9c03d]/20 bg-[#f9c03d]/10 px-3 py-1 text-xs font-bold text-[#f9c03d]">
                                            {card.step}
                                        </span>
                                        <span className="text-xs font-semibold uppercase tracking-[1.2px] text-[#8b8f9e]">
                                            {card.rep}
                                        </span>
                                    </div>
                                    <p className="mt-4 break-words text-right text-xl leading-relaxed sm:text-2xl md:text-[40px]">
                                        {card.arabic}
                                    </p>
                                    <p className="mt-5 border-l-2 border-[#f9c03d]/20 pl-4 text-sm text-[#c7c6c6]">
                                        {card.translit}
                                    </p>
                                    <p className="mt-4 text-sm text-[#e1e1f0]">{card.english}</p>
                                </div>

                                <div className="flex shrink-0 flex-row items-center gap-3 md:flex-col md:justify-center">
                                    <button className="h-20 w-20 rounded-full border-2 border-[#f9c03d]/35 text-[#f9c03d]">
                                        <span className="block text-lg font-bold">
                                            {card.count}
                                        </span>
                                        <span className="text-[10px] uppercase text-[#8b8f9e]">
                                            Count
                                        </span>
                                    </button>
                                    <button className="rounded-full bg-[#32343f] p-3 text-[#8b8f9e]">
                                        <Settings className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="grid gap-4 md:grid-cols-3 md:gap-6">
                    <article className="rounded-3xl border border-white/5 bg-[#191b25]/65 p-6 md:col-span-2 md:p-10">
                        <h3 className="text-xl font-medium">Consistency Streak</h3>
                        <p className="mt-1 text-sm text-[#8b8f9e]">
                            You have completed your daily Adhkar for 7 days in a row.
                        </p>
                        <div className="mt-4 flex gap-2">
                            {"MTWTFSS".split("").map((d, i) => (
                                <span
                                    key={`${d}-${i}`}
                                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                                        i < 6
                                            ? "bg-[#f9c03d] text-[#402d00]"
                                            : "border-2 border-[#f9c03d] text-[#f9c03d]"
                                    }`}
                                >
                                    {d}
                                </span>
                            ))}
                        </div>
                    </article>
                    <article className="rounded-3xl border border-[#f9c03d]/20 bg-[#f9c03d]/5 p-6 text-center md:p-10">
                        <p className="text-5xl font-light text-[#f9c03d]">1,240</p>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[2.2px] text-[#8b8f9e]">
                            Total Tasbih This Month
                        </p>
                    </article>
                </section>
            </div>
            <MobileBottomNav />
        </main>
    );
}
