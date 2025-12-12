// (C) 2020-2025 GoodData Corporation

import { type DateAttributeGranularity } from "@gooddata/sdk-model";

import { type FormattingLocale } from "./defaultDateFormatter.js";

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

export type DateStringifier = (
    value: Date,
    granularity: DateAttributeGranularity,
    locale?: FormattingLocale,
    timezone?: string,
) => string;

export type DateNormalizer = (
    value: string | null,
    granularity: DateAttributeGranularity,
    locale?: FormattingLocale,
    timezone?: string,
) => string;
