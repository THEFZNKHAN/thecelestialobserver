import { CalendarDays, Compass, MapPin } from "lucide-react";

type TopBarProps = {
    title: string;
    dateLabel: string;
    locationLabel: string;
};

export function TopBar({ title, dateLabel, locationLabel }: TopBarProps) {
    return (
        <header className="rounded-3xl border border-white/20 bg-slate-900/85 px-4 py-3 text-white shadow-lg backdrop-blur md:px-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs text-slate-300">The Celestial Observer</p>
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
                </div>
                <Compass className="h-5 w-5 text-amber-300" aria-hidden />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-200">
                <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" aria-hidden />
                    {dateLabel}
                </span>
                <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden />
                    {locationLabel}
                </span>
            </div>
        </header>
    );
}
