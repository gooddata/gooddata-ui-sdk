// (C) 2022 GoodData Corporation
import { IMeasureSortTarget, LocalIdRef, SortDirection } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type MeasureSortSuggestion = {
    type: "measureSort";
} & IMeasureSortTarget;

/**
 * For now it is completely the same as IAvailableSortsGroup in sdk-ui-ext
 *
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
export enum SORT_TARGET_TYPE {
    ALPHABETICAL_ASC = "alphabetical-asc",
    ALPHABETICAL_DESC = "alphabetical-desc",
    DATE_ASC = "date-asc",
    DATE_DESC = "date-desc",
    DEFAULT = "default",
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
    type: "alphabetical" | "date" | "default" | "numerical";
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
export interface IIBucketItemDescriptor {
    type: "attribute" | "chronologicalDate" | "genericDate" | "measure";
    name: string;
    sequenceNumber?: string;
}

/**
 * @internal
 */
export interface IBucketItemDescriptors {
    [localIdentifier: string]: IIBucketItemDescriptor;
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
