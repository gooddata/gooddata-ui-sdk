// (C) 2019-2022 GoodData Corporation
import {
    LocalIdRef,
    ISortItem,
    IAttributeSortTarget,
    IAttributeSortType,
    IMeasureSortTarget,
    Identifier,
    IAttributeLocatorItem,
    newMeasureSort,
    newAttributeSort,
    newAttributeAreaSort,
} from "@gooddata/sdk-model";

export type AttributeSortSuggestion = {
    type: "attributeSort";
} & IAttributeSortTarget &
    IAttributeSortType;

export type MeasureSortSuggestion = {
    type: "measureSort";
} & IMeasureSortTarget;

export type SortSuggestion = AttributeSortSuggestion | MeasureSortSuggestion;

export function newMeasureSortSuggestion(
    identifier: Identifier,
    attributeLocators: IAttributeLocatorItem[] = [],
): MeasureSortSuggestion {
    const {
        measureSortItem: { locators },
    } = newMeasureSort(identifier, "asc", attributeLocators);
    return {
        type: "measureSort",
        locators,
    };
}

export function newAttributeSortSuggestion(identifier: Identifier): AttributeSortSuggestion {
    const {
        attributeSortItem: { attributeIdentifier },
    } = newAttributeSort(identifier);
    return {
        type: "attributeSort",
        attributeIdentifier,
    };
}

export function newAttributeAreaSortSuggestion(
    identifier: Identifier,
    areaAggregation: "sum" = "sum",
): AttributeSortSuggestion {
    const {
        attributeSortItem: { attributeIdentifier, aggregation },
    } = newAttributeAreaSort(identifier, "asc", areaAggregation);
    return {
        type: "attributeSort",
        attributeIdentifier,
        aggregation,
    };
}

/**
 * Specifies set of available sorts for given level of hierarchy:
 * Specific attribute to which sort is related - for eg. multiple ViewBy attributes, each can specify its sorting
 */
export interface IAvailableSortsGroup {
    // bucket item identifier
    forBucketItem: LocalIdRef;
    // all possible sort combinations for given level, sort direction is irrelevant
    sortSuggestions: SortSuggestion[];
    /**
     * Additional text to available sorts, eg.
     * when there is single available sort, this can contain explanation of the reason
     */
    explanation?: string;
}

export interface IAvailableSortsGroupV2 {
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

export interface ISortConfig {
    /**
     * Current sort - default or chosen from inside of visualization
     */
    currentSort: ISortItem[];
    /**
     * All available sorts for current buckets
     * - should contain current sort too
     */
    availableSorts: IAvailableSortsGroupV2[];
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
