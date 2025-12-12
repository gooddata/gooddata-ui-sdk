// (C) 2025 GoodData Corporation

import { type ISeparators } from "@gooddata/sdk-model";

/**
 * Configuration for formatting.
 *
 * @public
 */
export interface PivotTableNextFormattingConfig {
    /**
     * Customize number segment separators (thousands, decimals)
     */
    separators?: ISeparators;
}
