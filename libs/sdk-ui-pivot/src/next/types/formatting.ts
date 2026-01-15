// (C) 2025-2026 GoodData Corporation

import { type ISeparators } from "@gooddata/sdk-model";

/**
 * Configuration for formatting.
 *
 * @public
 */
export type PivotTableNextFormattingConfig = {
    /**
     * Customize number segment separators (thousands, decimals)
     */
    separators?: ISeparators;
};
