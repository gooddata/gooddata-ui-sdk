// (C) 2020-2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IMeasureValueFilter, type ObjRefInScope } from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";

/**
 * Type of dimensionality item for display purposes.
 * @beta
 */
export type DimensionalityItemType = "attribute" | "chronologicalDate" | "genericDate";

/**
 * Represents a dimensionality item with an identifier and human-readable title.
 * @beta
 */
export interface IDimensionalityItem {
    /**
     * The identifier of the dimensionality item (attribute or date reference).
     */
    identifier: ObjRefInScope;
    /**
     * Human-readable title for display purposes.
     */
    title: string;
    /**
     * Type of the item for icon rendering.
     * Defaults to "attribute" if not specified.
     */
    type: DimensionalityItemType;
}

/**
 * @beta
 */
export interface IMeasureValueFilterCommonProps {
    filter?: IMeasureValueFilter;
    /**
     * Human-readable measure title used in UI texts (e.g., preview).
     * If not provided, the preview falls back to showing only operator/value parts.
     */
    measureTitle?: string;
    measureIdentifier: string;
    onApply: (filter: IMeasureValueFilter | null) => void;
    usePercentage?: boolean;
    warningMessage?: WarningMessage;
    locale?: string;
    separators?: ISeparators;
    displayTreatNullAsZeroOption?: boolean;
    treatNullAsZeroDefaultValue?: boolean;
    enableOperatorSelection?: boolean;
    dimensionality?: IDimensionalityItem[];
    insightDimensionality?: IDimensionalityItem[];
    isDimensionalityEnabled?: boolean;
}

/**
 * @beta
 */
export type WarningMessage = string | IWarningMessage;

/**
 * @beta
 */
export type IWarningMessage = {
    text: string;
    severity: "low" | "medium" | "high";
};

/**
 * @alpha
 */
export function isWarningMessage(obj: unknown): obj is IWarningMessage {
    return !isEmpty(obj) && !!(obj as IWarningMessage).severity;
}
