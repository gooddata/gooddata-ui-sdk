// (C) 2020-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IMeasureValueFilter, type ObjRef, type ObjRefInScope } from "@gooddata/sdk-model";
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
    /**
     * Optional object reference for the item (typically the attribute/date display form reference).
     *
     * This is useful when the item `identifier` is a LocalIdRef (bucket item),
     * but we still want to compare/deduplicate it against catalog candidates that are referenced by ObjRef.
     *
     * @beta
     */
    ref?: ObjRef;
    /**
     * Optional dataset information for grouping catalog items.
     * Present for catalog items, undefined for bucket items.
     */
    dataset?: {
        /**
         * Dataset identifier.
         */
        identifier: ObjRef;
        /**
         * Human-readable dataset title.
         */
        title: string;
    };
}

/**
 * Date dataset option for the date dataset picker.
 * @internal
 */
export interface IDateDatasetOption {
    key: string;
    title: string;
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
    /**
     * Catalog items available for dimensionality
     */
    catalogDimensionality?: IDimensionalityItem[];
    /**
     * Callback triggered when dimensionality changes.
     * Used to revalidate catalog items after selection changes.
     */
    onDimensionalityChange?: (dimensionality: ObjRefInScope[]) => void;
    /**
     * Whether catalog dimensionality is currently being loaded.
     * If true, the attribute picker can show a small loading indicator.
     */
    isLoadingCatalogDimensionality?: boolean;
    /**
     * Enables UI support for defining multiple measure value filter conditions.
     * When set to `false` (default), only a single condition is shown/edited and, if the provided filter
     * contains multiple conditions, only the first one is used.
     *
     * @beta
     */
    enableMultipleConditions?: boolean;
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
