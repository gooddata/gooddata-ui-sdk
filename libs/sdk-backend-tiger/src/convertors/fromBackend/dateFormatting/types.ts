// (C) 2020-2026 GoodData Corporation

import { type DateAttributeGranularity } from "@gooddata/sdk-model";

import { type FormattingLocale } from "./defaultDateFormatter.js";

/**
 * Formats a date attribute value.
 *
 * @remarks
 * The value is floating: its UTC fields are the wall-clock the backend computed in its timezone (see
 * the `timezone` parameter), so format them in UTC. The Date is a `TZDate` of `@date-fns/tz` carrying UTC,
 * so date-fns `format` renders the fields even without the `in` option.
 *
 * @public
 */
export type DateFormatter = (
    value: Date,
    granularity: DateAttributeGranularity,
    locale?: FormattingLocale,
    pattern?: string,
    timezone?: string,
) => string;

export type DateParseFormatter = (
    value: string | null,
    granularity: DateAttributeGranularity,
    locale?: FormattingLocale,
    pattern?: string,
    timezone?: string,
) => string;

/**
 * Serializes a Date into a date attribute value; the UTC fields of the Date are serialized.
 *
 * @public
 */
export type DateStringifier = (
    value: Date,
    granularity: DateAttributeGranularity,
    locale?: FormattingLocale,
    timezone?: string,
) => string;

/**
 * Normalizes a date attribute value into an ISO string carrying the fields of the value in UTC.
 *
 * @remarks
 * The consumers of the normalized value (the key driver analysis dialog among them) rely on this: they read,
 * format and shift the fields of a Date created from it in UTC.
 *
 * @public
 */
export type DateNormalizer = (
    value: string | null,
    granularity: DateAttributeGranularity,
    locale?: FormattingLocale,
    timezone?: string,
) => string;
