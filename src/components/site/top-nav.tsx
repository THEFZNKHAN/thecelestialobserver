"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavKey = "home" | "prayer" | "qibla" | "duas" | "calendar";

const navItems: Array<{ key: NavKey; label: string; href: string }> = [
    { key: "home", label: "Home", href: "/landing" },
    { key: "prayer", label: "Prayers", href: "/prayer" },
    { key: "qibla", label: "Qibla", href: "/qibla" },
    { key: "duas", label: "Duas", href: "/duas" },
    { key: "calendar", label: "Calendar", href: "/calendar" },
];

export function TopNav({
    active,
    transparentOnTop = false,
}: {
    active: NavKey;
    transparentOnTop?: boolean;
}) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        if (!transparentOnTop) return;
        const onScroll = () => setIsScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [transparentOnTop]);

    const headerClass = transparentOnTop
        ? isScrolled
            ? "fixed top-0 z-50 w-full bg-[#11131d]/85 backdrop-blur-xl"
            : "fixed top-0 z-50 w-full bg-transparent"
        : "fixed top-0 z-50 w-full bg-[#11131d]/80 backdrop-blur-xl";

    return (
        <header className={`${headerClass} hidden md:block`}>
            <nav className="mx-auto w-full max-w-7xl px-4 py-3 md:px-8 lg:px-12">
                <div className="flex items-center justify-between">
                    <div className="text-base font-medium tracking-tight text-[#f9c03d] sm:text-xl">
                        The Celestial Observer
                    </div>
                    <div className="hidden items-center gap-8 md:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={
                                    item.key === active
                                        ? "inline-flex w-20 justify-center border-b-2 border-[#f9c03d] pb-1 text-[#f9c03d]"
                                        : "inline-flex w-20 justify-center text-[#c7c6c6] opacity-70 hover:text-[#f9c03d]"
                                }
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <span className="material-symbols-outlined text-[20px] text-[#c7c6c6] opacity-70">
                            notifications
                        </span>
                        <span className="material-symbols-outlined text-[20px] text-[#c7c6c6] opacity-70">
                            settings
                        </span>
                    </div>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
                    {navItems.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={
                                item.key === active
                                    ? "shrink-0 rounded-full border border-[#f9c03d]/30 bg-[#f9c03d]/10 px-3 py-1.5 text-xs font-semibold text-[#f9c03d]"
                                    : "shrink-0 rounded-full border border-[#4f4634]/20 bg-[#191b25]/60 px-3 py-1.5 text-xs text-[#c7c6c6] hover:text-[#f9c03d]"
                            }
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
}
