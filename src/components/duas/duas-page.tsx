"use client";

import { Moon, Settings, Sparkles, Sunrise, Sunset } from "lucide-react";

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

    return (
        <main className="min-h-screen bg-[#0b1020] text-[#e1e1f0]">
            <TopNav active="duas" />

            <div className="mx-auto flex w-full max-w-[1088px] flex-col gap-8 px-4 py-8 pt-24 md:px-6 md:py-14 md:pt-28">
                <section
                    className="relative h-56 overflow-hidden rounded-3xl border border-white/10 md:h-64"
                    style={{
                        backgroundImage: `linear-gradient(90deg, rgba(17,19,29,0.95) 0%, rgba(17,19,29,0.7) 45%, rgba(17,19,29,0.15) 100%), url(${heroBg})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                    }}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center md:p-10">
                        <h1 className="text-3xl font-light tracking-tight md:text-4xl">
                            Daily Duas & Adhkar
                        </h1>
                        <p className="mt-3 max-w-xl text-sm text-[#f9c03d] md:text-base">
                            "Verily, in the remembrance of Allah do hearts find rest." - Surah
                            Ar-Ra&apos;d 13:28
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
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
                                    <p className="mt-4 text-right text-2xl leading-relaxed md:text-[40px]">
                                        {card.arabic}
                                    </p>
                                    <p className="mt-5 border-l-2 border-[#f9c03d]/20 pl-4 text-sm text-[#c7c6c6]">
                                        {card.translit}
                                    </p>
                                    <p className="mt-4 text-sm text-[#e1e1f0]">{card.english}</p>
                                </div>

                                <div className="flex flex-row items-center gap-3 md:flex-col md:justify-center">
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
        </main>
    );
}
