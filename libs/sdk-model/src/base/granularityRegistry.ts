// (C) 2026 GoodData Corporation

import { type DateAttributeGranularity } from "./dateGranularities.js";

/**
 * Structural family of a date granularity.
 *
 * @remarks
 * - `chronological` — sequential periods (year, quarter, month, week, date, hour, minute) and their fiscal variants.
 * - `cyclical` — "X of Y" periods that repeat (month of year, day of week, …); a.k.a. generic/periodical.
 *
 * @alpha
 */
export type GranularityFamily = "chronological" | "cyclical";

/**
 * Calendar a granularity belongs to.
 *
 * @remarks
 * - `standard` — Gregorian year/quarter/month.
 * - `fiscal` — fiscal year/quarter/month (and, with custom fiscal calendars, further fiscal periods).
 * - `shared` — usable under either calendar (week, date, hour, minute, and the standard-derived cyclical periods).
 *
 * @alpha
 */
export type CalendarAffinity = "standard" | "fiscal" | "shared";

/**
 * Canonical, calendar-independent metadata for a single date granularity.
 *
 * @remarks
 * This is the single source of truth for classification, ordering and standard/fiscal relations.
 * It intentionally does NOT carry i18n labels — those stay in the consuming apps, keyed off this descriptor.
 *
 * @alpha
 */
export interface IGranularityDescriptor {
    /** The canonical SDK granularity token. */
    granularity: DateAttributeGranularity;
    /** Structural family. */
    family: GranularityFamily;
    /** Which calendar the granularity belongs to. */
    affinity: CalendarAffinity;
    /** Whether the granularity is at the time-of-day scale (hour/minute and their cyclical forms). */
    timeScale: boolean;
    /**
     * Canonical coarse→fine display/drill-down order. Fiscal granularities are ranked immediately after
     * their standard sibling, so filtering to a single calendar reproduces each consumer's historical order.
     */
    order: number;
    /** For cyclical granularities, the chronological granularity they are derived from (e.g. month_in_year → month). */
    chronologicalOrigin?: DateAttributeGranularity;
    /** Standard↔fiscal equivalent of the same period length (year↔fiscal_year, …), when one exists. */
    counterpart?: DateAttributeGranularity;
    /**
     * Whether the granularity is offered to users by default. `false` for tokens that exist in the type/backend
     * but are not surfaced in any picker today (the `GDC.time.week` alias and the EU-week cyclical variants).
     * Descriptors still exist for them so classification/lookup works; they are just excluded from
     * {@link getGranularities} output unless explicitly requested.
     */
    offeredByDefault: boolean;
}

const makeDescriptor = (
    granularity: DateAttributeGranularity,
    family: GranularityFamily,
    affinity: CalendarAffinity,
    order: number,
    extra: Partial<
        Pick<IGranularityDescriptor, "timeScale" | "chronologicalOrigin" | "counterpart" | "offeredByDefault">
    > = {},
): IGranularityDescriptor => ({
    granularity,
    family,
    affinity,
    order,
    timeScale: extra.timeScale ?? false,
    chronologicalOrigin: extra.chronologicalOrigin,
    counterpart: extra.counterpart,
    offeredByDefault: extra.offeredByDefault ?? true,
});

/**
 * Canonical registry of every {@link DateAttributeGranularity}.
 *
 * @remarks
 * Keyed on the full union so that adding a new granularity to {@link DateAttributeGranularity} is a compile error
 * here until its descriptor is provided — the registry is the single point that must be extended.
 *
 * @alpha
 */
export const GRANULARITY_DESCRIPTORS: Record<DateAttributeGranularity, IGranularityDescriptor> = {
    // chronological — standard / fiscal pairs (fiscal ranked right after its standard sibling)
    "GDC.time.year": makeDescriptor("GDC.time.year", "chronological", "standard", 10, {
        counterpart: "GDC.time.fiscal_year",
    }),
    "GDC.time.fiscal_year": makeDescriptor("GDC.time.fiscal_year", "chronological", "fiscal", 11, {
        counterpart: "GDC.time.year",
    }),
    "GDC.time.quarter": makeDescriptor("GDC.time.quarter", "chronological", "standard", 20, {
        counterpart: "GDC.time.fiscal_quarter",
    }),
    "GDC.time.fiscal_quarter": makeDescriptor("GDC.time.fiscal_quarter", "chronological", "fiscal", 21, {
        counterpart: "GDC.time.quarter",
    }),
    "GDC.time.month": makeDescriptor("GDC.time.month", "chronological", "standard", 30, {
        counterpart: "GDC.time.fiscal_month",
    }),
    "GDC.time.fiscal_month": makeDescriptor("GDC.time.fiscal_month", "chronological", "fiscal", 31, {
        counterpart: "GDC.time.month",
    }),
    // chronological — shared
    "GDC.time.week_us": makeDescriptor("GDC.time.week_us", "chronological", "shared", 40),
    "GDC.time.week": makeDescriptor("GDC.time.week", "chronological", "shared", 41, {
        offeredByDefault: false,
    }),
    "GDC.time.date": makeDescriptor("GDC.time.date", "chronological", "shared", 50),
    "GDC.time.hour": makeDescriptor("GDC.time.hour", "chronological", "shared", 60, { timeScale: true }),
    "GDC.time.minute": makeDescriptor("GDC.time.minute", "chronological", "shared", 70, { timeScale: true }),

    // cyclical ("X of Y") — shared / standard-derived
    "GDC.time.quarter_in_year": makeDescriptor("GDC.time.quarter_in_year", "cyclical", "shared", 22, {
        chronologicalOrigin: "GDC.time.quarter",
    }),
    "GDC.time.month_in_quarter": makeDescriptor("GDC.time.month_in_quarter", "cyclical", "shared", 32, {
        chronologicalOrigin: "GDC.time.month",
    }),
    "GDC.time.month_in_year": makeDescriptor("GDC.time.month_in_year", "cyclical", "shared", 33, {
        chronologicalOrigin: "GDC.time.month",
    }),
    "GDC.time.week_in_quarter": makeDescriptor("GDC.time.week_in_quarter", "cyclical", "shared", 42, {
        chronologicalOrigin: "GDC.time.week_us",
    }),
    "GDC.time.week_in_year": makeDescriptor("GDC.time.week_in_year", "cyclical", "shared", 43, {
        chronologicalOrigin: "GDC.time.week_us",
    }),
    "GDC.time.euweek_in_quarter": makeDescriptor("GDC.time.euweek_in_quarter", "cyclical", "shared", 44, {
        chronologicalOrigin: "GDC.time.week",
        offeredByDefault: false,
    }),
    "GDC.time.euweek_in_year": makeDescriptor("GDC.time.euweek_in_year", "cyclical", "shared", 45, {
        chronologicalOrigin: "GDC.time.week",
        offeredByDefault: false,
    }),
    "GDC.time.day_in_week": makeDescriptor("GDC.time.day_in_week", "cyclical", "shared", 51, {
        chronologicalOrigin: "GDC.time.date",
    }),
    "GDC.time.day_in_month": makeDescriptor("GDC.time.day_in_month", "cyclical", "shared", 52, {
        chronologicalOrigin: "GDC.time.date",
    }),
    "GDC.time.day_in_quarter": makeDescriptor("GDC.time.day_in_quarter", "cyclical", "shared", 53, {
        chronologicalOrigin: "GDC.time.date",
    }),
    "GDC.time.day_in_year": makeDescriptor("GDC.time.day_in_year", "cyclical", "shared", 54, {
        chronologicalOrigin: "GDC.time.date",
    }),
    "GDC.time.day_in_euweek": makeDescriptor("GDC.time.day_in_euweek", "cyclical", "shared", 55, {
        chronologicalOrigin: "GDC.time.date",
        offeredByDefault: false,
    }),
    "GDC.time.hour_in_day": makeDescriptor("GDC.time.hour_in_day", "cyclical", "shared", 61, {
        chronologicalOrigin: "GDC.time.hour",
        timeScale: true,
    }),
    "GDC.time.minute_in_hour": makeDescriptor("GDC.time.minute_in_hour", "cyclical", "shared", 71, {
        chronologicalOrigin: "GDC.time.minute",
        timeScale: true,
    }),
};

/**
 * A granularity enabled on a custom fiscal calendar (mirrors the calendar's `enabledGranularities`).
 *
 * @remarks
 * Placeholder for the custom fiscal calendar work; consumed by the `custom` branch of {@link getGranularities}.
 *
 * @alpha
 */
export interface IEnabledGranularity {
    granularity: DateAttributeGranularity;
    /** Localizable label prefix defined on the calendar (e.g. "FY", "FP"). */
    prefix?: string;
    /** Calendar-defined drill-down order; falls back to the registry `order` when omitted. */
    order?: number;
}

/**
 * Which calendar the caller is resolving granularities for.
 *
 * @alpha
 */
export type CalendarContext =
    | { type: "standard" }
    | { type: "fiscal" }
    | { type: "custom"; enabledGranularities: IEnabledGranularity[] };

/**
 * Query describing which granularities to return.
 *
 * @alpha
 */
export interface IGranularitiesQuery {
    /**
     * The calendar(s) to resolve granularities for. Pass a single-element array for one calendar, or several to
     * get their merged, de-duplicated union in canonical order — e.g. `standard` + `fiscal` for a
     * "supported/available" superset. A single custom calendar preserves its own `enabledGranularities` order;
     * a merge always uses the canonical registry order.
     */
    calendars: CalendarContext[];
    /** Structural families to include. Defaults to `["chronological"]`; pass `["cyclical"]` for generic-only. */
    families?: GranularityFamily[];
    /** Include time-scale granularities (hour/minute and their cyclical forms). Defaults to `true`. */
    includeTime?: boolean;
    /** For a fiscal/custom calendar, also include shared granularities (week/date/time/…). Defaults to `true`. */
    includeShared?: boolean;
    /** Include granularities that are not offered by default (`GDC.time.week`, EU-week variants). Defaults to `false`. */
    includeNonDefault?: boolean;
}

const ALL_DESCRIPTORS: IGranularityDescriptor[] = Object.values(GRANULARITY_DESCRIPTORS);

const DESCRIPTOR_BY_TOKEN: ReadonlyMap<string, IGranularityDescriptor> = new Map(
    ALL_DESCRIPTORS.map((desc) => [desc.granularity, desc]),
);

const DESCRIPTORS_BY_ORDER: IGranularityDescriptor[] = [...ALL_DESCRIPTORS].sort((a, b) => a.order - b.order);

/**
 * Returns the descriptor for a granularity, or `undefined` if not a known {@link DateAttributeGranularity}.
 *
 * @alpha
 */
export function getGranularityDescriptor(
    granularity: string | undefined,
): IGranularityDescriptor | undefined {
    if (!granularity) {
        return undefined;
    }
    return DESCRIPTOR_BY_TOKEN.get(granularity);
}

/**
 * The single source of truth for "which date granularities apply here".
 *
 * @remarks
 * Returns the calendar-relevant granularities in canonical coarse→fine order. Standard/fiscal chronological
 * granularities come from the registry; a `custom` calendar supplies its own `enabledGranularities` (and their
 * order). The result is calendar-relevant only — callers narrow it to a backend/dataset-supported subset.
 *
 * @alpha
 */
export function getGranularities(query: IGranularitiesQuery): DateAttributeGranularity[] {
    const families = query.families ?? ["chronological"];
    const includeTime = query.includeTime ?? true;
    const includeShared = query.includeShared ?? true;
    const includeNonDefault = query.includeNonDefault ?? false;

    const familySet = new Set(families);
    const passes = (desc: IGranularityDescriptor): boolean =>
        familySet.has(desc.family) &&
        (includeTime || !desc.timeScale) &&
        (includeNonDefault || desc.offeredByDefault);

    const forCalendar = (calendar: CalendarContext): DateAttributeGranularity[] => {
        if (calendar.type === "custom") {
            // Custom calendar drives its own set (its own order); shared granularities appended when requested.
            // The families/includeTime gating intentionally applies to enabled granularities too: custom fiscal
            // calendars define a mixture of chronological and cyclical periods, and UI callers typically need
            // just one family of them.
            const enabled = [...calendar.enabledGranularities]
                .map((eg) => ({ eg, desc: DESCRIPTOR_BY_TOKEN.get(eg.granularity) }))
                .filter((entry): entry is { eg: IEnabledGranularity; desc: IGranularityDescriptor } =>
                    Boolean(entry.desc && passes(entry.desc)),
                )
                .sort((a, b) => (a.eg.order ?? a.desc.order) - (b.eg.order ?? b.desc.order))
                .map(({ eg }) => eg.granularity);

            const shared = includeShared
                ? DESCRIPTORS_BY_ORDER.filter((desc) => desc.affinity === "shared" && passes(desc)).map(
                      (desc) => desc.granularity,
                  )
                : [];

            // Dedupe: a shared token may also be listed in enabledGranularities.
            const seen = new Set<DateAttributeGranularity>();
            return [...enabled, ...shared].filter((granularity) => {
                if (seen.has(granularity)) {
                    return false;
                }
                seen.add(granularity);
                return true;
            });
        }

        const wantsAffinity = (affinity: CalendarAffinity): boolean =>
            affinity === "shared"
                ? calendar.type === "standard" || includeShared
                : affinity === calendar.type;

        return DESCRIPTORS_BY_ORDER.filter((desc) => wantsAffinity(desc.affinity) && passes(desc)).map(
            (desc) => desc.granularity,
        );
    };

    const calendars = query.calendars;
    if (calendars.length === 1) {
        return forCalendar(calendars[0]);
    }

    // Merge several calendars: de-duplicate, then emit in canonical registry order.
    const selected = new Set<DateAttributeGranularity>();
    for (const calendar of calendars) {
        for (const granularity of forCalendar(calendar)) {
            selected.add(granularity);
        }
    }
    return DESCRIPTORS_BY_ORDER.filter((desc) => selected.has(desc.granularity)).map(
        (desc) => desc.granularity,
    );
}

// ---- classification predicates (registry-backed; replace the per-package copies) -------------------------

/** @alpha */
export const isFiscalGranularity = (g: string | undefined): boolean =>
    getGranularityDescriptor(g)?.affinity === "fiscal";

/** @alpha */
export const isStandardGranularity = (g: string | undefined): boolean =>
    getGranularityDescriptor(g)?.affinity === "standard";

/** @alpha */
export const isSharedGranularity = (g: string | undefined): boolean =>
    getGranularityDescriptor(g)?.affinity === "shared";

/**
 * @remarks
 * Unknown or `undefined` input returns `false` — this is NOT the negation of {@link isCyclicalGranularity},
 * which also returns `false` for unknown input. Callers that want to default unknown granularities to
 * chronological must handle that themselves.
 *
 * @alpha
 */
export const isChronologicalGranularity = (g: string | undefined): boolean =>
    getGranularityDescriptor(g)?.family === "chronological";

/** @alpha */
export const isCyclicalGranularity = (g: string | undefined): boolean =>
    getGranularityDescriptor(g)?.family === "cyclical";

/** @alpha */
export const isTimeGranularity = (g: string | undefined): boolean =>
    getGranularityDescriptor(g)?.timeScale === true;

/**
 * Whether a granularity is usable under the given calendar — its own (`standard`/`fiscal`) granularities plus
 * the `shared` ones (week/date/time/cyclical).
 *
 * @remarks
 * Mirrors what a single calendar "tab" offers, so a merged result (e.g. `standard` + `fiscal`) can be split into
 * standard-usable and fiscal-usable in one pass. `shared` granularities satisfy both calendars.
 *
 * @alpha
 */
export const belongsToCalendar = (
    g: string | undefined,
    calendar: Exclude<CalendarAffinity, "shared">,
): boolean => {
    const affinity = getGranularityDescriptor(g)?.affinity;
    return affinity === calendar || affinity === "shared";
};

// ---- relations -------------------------------------------------------------------------------------------

/** Standard equivalent of a fiscal granularity (fiscal_year → year), if any. @alpha */
export const getStandardEquivalent = (g: string | undefined): DateAttributeGranularity | undefined => {
    const desc = getGranularityDescriptor(g);
    return desc?.affinity === "fiscal" ? desc.counterpart : undefined;
};

/** Fiscal equivalent of a standard granularity (year → fiscal_year), if any. @alpha */
export const getFiscalEquivalent = (g: string | undefined): DateAttributeGranularity | undefined => {
    const desc = getGranularityDescriptor(g);
    return desc?.affinity === "standard" ? desc.counterpart : undefined;
};

/** Chronological granularity a cyclical one is derived from (month_in_year → month), if any. @alpha */
export const getChronologicalOrigin = (g: string | undefined): DateAttributeGranularity | undefined =>
    getGranularityDescriptor(g)?.chronologicalOrigin;
