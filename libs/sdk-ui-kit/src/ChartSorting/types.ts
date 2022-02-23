// (C) 2022 GoodData Corporation
import { ISortItem, LocalIdRef, SortDirection, IMeasureSortTarget } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface ISortConfig {
    /**
     * Current sort - default or chosen from inside of visualization
     */
    currentSort: ISortItem[];
    /**
     * All available sorts for current buckets
     * - should contain current sort too
     */
    availableSorts: IAvailableSortsGroup[];
    /**
     * Whether sorting is supported by viz
     */
    supported: boolean;
    /**
     * Whether sorting is disabled for current buckets
     */
    disabled: boolean;
    /**
     * When sorting is disabled, this can contain explanation of reason
     */
    disabledExplanation?: string;
}

/**
 * Specifies set of available sorts for given level of hierarchy:
 * Specific attribute to which sort is related - for eg. multiple ViewBy attributes, each can specify its sorting
 */
/**
 * @internal
 */
export interface IAvailableSortsGroup {
    // bucket item identifier
    itemId: LocalIdRef;
    /**
     * Attribute sorts related to the attribute bucket item referenced by itemId
     * Attribute sort suggestions can be created later in AD
     * This structure eliminates the risk, that in one group attributeSortSuggestions for multiple attribute items will be mixed together
     */
    attributeSort?: {
        normalSortEnabled: boolean;
        areaSortEnabled: boolean;
    };
    metricSorts?: MeasureSortSuggestion[];
    /**
     * Additional text to available sorts, eg.
     * when there is single available sort, this can contain explanation of the reason
     */
    explanation?: string;
}

/**
 * @internal
 */
export type MeasureSortSuggestion = {
    type: "measureSort";
} & IMeasureSortTarget;

/**
 * @internal
 */
export enum SORT_TARGET_TYPE {
    ALPHABETICAL_ASC = "alphabetical-asc",
    ALPHABETICAL_DESC = "alphabetical-desc",
    NUMERICAL_ASC = "numerical-asc",
    NUMERICAL_DESC = "numerical-desc",
}

/**
 * @internal
 */
export interface ISortTypeItem {
    id: SORT_TARGET_TYPE;
    title: string;
    sortDirection: SortDirection;
    type: "alphabetical" | "numerical";
    localIdentifier: string;
}

/**
 * @internal
 */
export interface IMeasureDropdownValue {
    id: string;
    title: string;
    sequenceNumber?: string;
}

/**
 * @internal
 */
export interface IBucketItemNames {
    [localIdentifier: string]: {
        name: string;
        sequenceNumber?: string;
    };
}

/**
 * @internal
 */
export type IMeasureSortItem = {
    id: string;
    title: string;
    localIdentifier: string;
    sequenceNumber?: string;
};
