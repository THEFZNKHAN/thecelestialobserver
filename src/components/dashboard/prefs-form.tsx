"use client";

import { useState } from "react";

import type { LocationPreferences } from "@/lib/types";

type PrefsFormProps = {
    value: LocationPreferences;
    onSave: (value: LocationPreferences) => void;
};

const METHODS = [
    { value: 2, label: "ISNA" },
    { value: 3, label: "Muslim World League" },
    { value: 4, label: "Umm Al-Qura" },
    { value: 5, label: "Egyptian General Authority" },
];

export function PrefsForm({ value, onSave }: PrefsFormProps) {
    const [draft, setDraft] = useState<LocationPreferences>(value);

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Location Settings</h3>
            <p className="mt-1 text-xs text-slate-500">
                Saved in your browser only (no account required).
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                    <span className="mb-1 block text-slate-600">City</span>
                    <input
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
                        value={draft.city}
                        onChange={(event) =>
                            setDraft((prev) => ({ ...prev, city: event.target.value }))
                        }
                    />
                </label>

                <label className="text-sm">
                    <span className="mb-1 block text-slate-600">Country</span>
                    <input
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
                        value={draft.country}
                        onChange={(event) =>
                            setDraft((prev) => ({ ...prev, country: event.target.value }))
                        }
                    />
                </label>
            </div>

            <label className="mt-3 block text-sm">
                <span className="mb-1 block text-slate-600">Calculation Method</span>
                <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
                    value={draft.method}
                    onChange={(event) =>
                        setDraft((prev) => ({ ...prev, method: Number(event.target.value) }))
                    }
                >
                    {METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                            {method.label}
                        </option>
                    ))}
                </select>
            </label>

            <button
                type="button"
                className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                onClick={() => onSave(draft)}
            >
                Save and refresh timings
            </button>
        </section>
    );
}
