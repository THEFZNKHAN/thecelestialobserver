import { Timer } from "lucide-react";

type FastingCardProps = {
    label: string;
};

export function FastingCard({ label }: FastingCardProps) {
    return (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Timer className="h-5 w-5" />
                </span>
                <div>
                    <p className="text-sm font-semibold text-emerald-900">Fasting Progress</p>
                    <p className="text-sm text-emerald-700">{label}</p>
                </div>
            </div>
        </section>
    );
}
