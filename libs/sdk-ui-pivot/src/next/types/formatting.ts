// (C) 2025 GoodData Corporation
import { ISeparators } from "@gooddata/sdk-model";

/**
 * Configuration for formatting.
 *
 * @alpha
 */
export interface PivotTableNextFormattingConfig {
    /**
     * Customize number segment separators (thousands, decimals)
     */
    separators?: ISeparators;
}
