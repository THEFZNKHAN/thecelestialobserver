"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
    { href: "/landing", label: "Landing" },
    { href: "/prayer", label: "Prayer" },
    { href: "/qibla", label: "Qibla" },
    { href: "/duas", label: "Duas" },
    { href: "/calendar", label: "Calendar" },
];

export function ScreenNav() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#070b17]/90 backdrop-blur">
            <div className="mx-auto flex max-w-[1280px] items-center gap-2 overflow-x-auto px-4 py-3 md:px-6">
                {LINKS.map((link) => {
                    const active = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`rounded-full border px-4 py-1.5 text-sm transition ${
                                active
                                    ? "border-[#f9c03d] bg-[#f9c03d]/15 text-[#f9c03d]"
                                    : "border-white/15 text-[#c7c6c6] hover:bg-white/5"
                            }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
