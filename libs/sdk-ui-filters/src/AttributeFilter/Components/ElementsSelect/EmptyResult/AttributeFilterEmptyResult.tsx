// (C) 2021-2025 GoodData Corporation

import { type CSSProperties, useMemo } from "react";

import { AttributeFilterEmptyAttributeResult } from "./AttributeFilterEmptyAttributeResult.js";
import { AttributeFilterAllValuesFilteredResult } from "./AttributeFilterEmptyFilteredResult.js";
import { AttributeFilterEmptySearchResult } from "./AttributeFilterEmptySearchResult.js";

/**
 * Properties of AttributeFilterEmptyResult component implementation
 * @beta
 */
export interface IAttributeFilterEmptyResultProps {
    /**
     * Component height
     */
    height: number;

    /**
     * Number of items that respect current criteria
     */
    totalItemsCount: number | undefined;

    /**
     * Indicate that items are filtered or not
     */
    isFilteredByParentFilters: boolean;

    /**
     * Indicate that items are filtered or not by dependent date filters
     *
     * @beta
     */
    isFilteredByDependentDateFilters?: boolean;

    /**
     * Current search string
     */
    searchString: string;

    /**
     * List of parent filters items titles that are used as current filtering criteria
     */
    parentFilterTitles?: string[];

    /**
     * This enables "show filtered elements" option which manages showing filtered elements.
     */
    enableShowingFilteredElements?: boolean;
}

/**
 * This component displays different types of messages for situations when all elements are filtered out.
 * It distinguishes messages when current criteria return empty results or all elements are filtered by parents or by search.
 * @beta
 */
export function AttributeFilterEmptyResult({
    height,
    totalItemsCount,
    searchString,
    isFilteredByParentFilters,
    isFilteredByDependentDateFilters,
    parentFilterTitles = [],
    enableShowingFilteredElements = false,
}: IAttributeFilterEmptyResultProps) {
    let renderEmptyResult = null;

    const style = useMemo<CSSProperties>(() => {
        return {
            height,
        };
    }, [height]);

    if (totalItemsCount === 0) {
        renderEmptyResult = <AttributeFilterEmptyAttributeResult />;
    } else if (isFilteredByParentFilters || isFilteredByDependentDateFilters) {
        renderEmptyResult = (
            <AttributeFilterAllValuesFilteredResult
                parentFilterTitles={parentFilterTitles}
                searchString={searchString}
                enableShowingFilteredElements={enableShowingFilteredElements}
            />
        );
    } else if (searchString.length > 0) {
        renderEmptyResult = <AttributeFilterEmptySearchResult />;
    }

    return (
        <div className="gd-attribute-filter-empty-result__next" style={style}>
            {renderEmptyResult}
        </div>
    );
}
