import { Clock3 } from "lucide-react";

type FocusCardProps = {
    currentPrayer: string;
    nextPrayer: string;
    nextTime: string;
    countdown: string;
    qiblaDirection: number;
};

export function FocusCard({
    currentPrayer,
    nextPrayer,
    nextTime,
    countdown,
    qiblaDirection,
}: FocusCardProps) {
    return (
        <section className="rounded-3xl border border-indigo-300/30 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-5 text-white shadow-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Current focus</p>
            <div className="mt-2 flex items-end justify-between gap-3">
                <h2 className="text-3xl font-bold tracking-tight">{currentPrayer}</h2>
                <div className="rounded-full bg-white/15 px-3 py-1 text-xs">
                    Qibla {qiblaDirection.toFixed(1)}°
                </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/20 bg-black/15 p-4">
                <p className="text-sm text-indigo-100">Next prayer</p>
                <p className="mt-1 text-xl font-semibold">
                    {nextPrayer} at {nextTime}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-indigo-100">
                    <Clock3 className="h-4 w-4" aria-hidden />
                    Starts in {countdown}
                </p>
            </div>
        </section>
    );
}
