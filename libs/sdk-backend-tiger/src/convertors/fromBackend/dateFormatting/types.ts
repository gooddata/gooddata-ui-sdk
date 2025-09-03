// (C) 2020-2025 GoodData Corporation
import { DateAttributeGranularity } from "@gooddata/sdk-model";

import { FormattingLocale } from "./defaultDateFormatter.js";

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
