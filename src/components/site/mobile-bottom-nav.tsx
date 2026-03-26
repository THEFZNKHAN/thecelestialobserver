"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
    { href: "/landing", label: "Home", icon: "home" },
    { href: "/prayer", label: "Prayers", icon: "schedule" },
    { href: "/qibla", label: "Qibla", icon: "explore" },
    { href: "/duas", label: "Duas", icon: "auto_stories" },
    { href: "/calendar", label: "Calendar", icon: "calendar_month" },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 flex w-full items-center justify-around rounded-t-[1.25rem] bg-[#11131d]/95 px-2 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:hidden"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
            {items.map((item) => {
                const active = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex min-w-[58px] flex-col items-center justify-center rounded-xl px-2 py-1 ${
                            active
                                ? "bg-[#f9c03d]/10 text-[#f9c03d]"
                                : "text-[#8b8f9e] hover:bg-[#1f2333]"
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-tight">
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
