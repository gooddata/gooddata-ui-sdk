// (C) 2020-2026 GoodData Corporation

import { parseDateValue } from "./dateValueParser.js";
import { type DateNormalizer } from "./types.js";

/**
 * Creates a function that takes a string date attribute value, granularity, locale and timezone
 * and returns the normalized value of the date attribute element.
 *
 * @remarks
 * The normalized value is the ISO string of the value parsed as a floating date: the backend computed the
 * value in its timezone, so its fields are kept as they are and the ISO string carries them in UTC
 * (for example "2026-03-29 02:30:00" normalizes to "2026-03-29T02:30:00.000Z"). The normalized value is
 * therefore the same in every browser timezone, and {@link createDateValueStringifier} turns a Date created
 * from it back into the backend value. The locale and the timezone do not take part in the normalization.
 *
 * @public
 */
export function createDateValueNormalizer(): DateNormalizer {
    return (value, granularity) => {
        if (value === null) {
            return "";
        }
        const parsed = parseDateValue(value, granularity);
        // Guard values that cannot be represented as a Date (e.g. second-of-minute 60, minute-of-day 1440,
        // second-of-day 86400) — toISOString() would throw on an Invalid Date. Fall back to the raw value.
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }
        // A plain Date: the parsed TZDate would render its (zero) offset instead of "Z".
        return new Date(parsed.getTime()).toISOString();
    };
}
