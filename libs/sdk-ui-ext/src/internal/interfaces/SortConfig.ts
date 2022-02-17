// (C) 2019-2022 GoodData Corporation
import {
    LocalIdRef,
    ISortItem,
    IMeasureSortTarget,
    Identifier,
    IAttributeLocatorItem,
    newMeasureSort,
} from "@gooddata/sdk-model";

type MeasureSortSuggestion = {
    type: "measureSort";
} & IMeasureSortTarget;

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

/**
 * Specifies set of available sorts for given level of hierarchy:
 * Specific attribute to which sort is related - for eg. multiple ViewBy attributes, each can specify its sorting
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
