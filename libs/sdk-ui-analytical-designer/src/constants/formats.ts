// (C) 2007-2026 GoodData Corporation

import { type FormatNumberOptions } from "react-intl";

export const DEFAULT_DECIMAL_FORMAT = "#,##0.00";
export const DEFAULT_INTEGER_FORMAT = "#,##0";
export const DEFAULT_PERCENTAGE_FORMAT = "#,##0.00%";

/**
 * Options to use with the intl.formatNumber to output numbers like 128K in a localized manner.
 */
export const COMPACT_FORMATTING_OPTIONS: FormatNumberOptions = { style: "decimal", notation: "compact" };
