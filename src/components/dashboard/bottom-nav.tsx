import { Compass, Home, MoonStar, Settings } from "lucide-react";

export function BottomNav() {
    const items = [
        { label: "Home", icon: Home, active: true },
        { label: "Qibla", icon: Compass, active: false },
        { label: "Duas", icon: MoonStar, active: false },
        { label: "Settings", icon: Settings, active: false },
    ];

    return (
        <nav className="sticky bottom-3 rounded-2xl border border-slate-200 bg-white/95 px-2 py-2 shadow-lg backdrop-blur">
            <ul className="grid grid-cols-4 gap-1">
                {items.map((item) => (
                    <li key={item.label}>
                        <button
                            type="button"
                            className={`flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs ${
                                item.active
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                            aria-current={item.active ? "page" : undefined}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
