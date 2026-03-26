import { z } from "zod";

const alAdhanTimingSchema = z.object({
    Fajr: z.string(),
    Sunrise: z.string(),
    Dhuhr: z.string(),
    Asr: z.string(),
    Maghrib: z.string(),
    Isha: z.string(),
});

const hijriSchema = z.object({
    day: z.string(),
    month: z.object({
        en: z.string(),
    }),
    year: z.string(),
});

const metaSchema = z.object({
    timezone: z.string(),
    latitude: z.number().or(z.string().transform(Number)),
    longitude: z.number().or(z.string().transform(Number)),
});

export const prayerTimesResponseSchema = z.object({
    code: z.number(),
    status: z.string(),
    data: z.object({
        timings: alAdhanTimingSchema,
        date: z.object({
            readable: z.string(),
            hijri: hijriSchema,
        }),
        meta: metaSchema,
    }),
});

export const qiblaResponseSchema = z.object({
    code: z.number(),
    status: z.string(),
    data: z.object({
        direction: z.number(),
        latitude: z.number().or(z.string().transform(Number)),
        longitude: z.number().or(z.string().transform(Number)),
    }),
});

const calendarDaySchema = z.object({
    timings: z.object({
        Fajr: z.string(),
        Maghrib: z.string(),
    }),
    date: z.object({
        readable: z.string(),
        hijri: z.object({
            day: z.string(),
            month: z.object({
                en: z.string(),
            }),
            year: z.string(),
        }),
    }),
});

export const calendarByCityResponseSchema = z.object({
    code: z.number(),
    status: z.string(),
    data: z.array(calendarDaySchema),
});

export type PrayerTimesResponse = z.infer<typeof prayerTimesResponseSchema>;
export type QiblaResponse = z.infer<typeof qiblaResponseSchema>;
export type CalendarByCityResponse = z.infer<typeof calendarByCityResponseSchema>;
