// (C) 2021-2022 GoodData Corporation
import React, { useMemo, CSSProperties } from "react";
import { AttributeFilterEmptySearchResult } from "./AttributeFilterEmptySearchResult.js";
import { AttributeFilterEmptyAttributeResult } from "./AttributeFilterEmptyAttributeResult.js";
import { AttributeFilterAllValuesFilteredResult } from "./AttributeFilterEmptyFilteredResult.js";

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
    totalItemsCount: number;

    /**
     * Indicate that items are filtered or not
     */
    isFilteredByParentFilters: boolean;

    /**
     * Current search string
     */
    searchString: string;

    /**
     * List of parent filters items titles that are used as current filtering criteria
     */
    parentFilterTitles?: string[];
}

/**
 * This component displays different types of messages for situations when all elements are filtered out.
 * It distinguishes messages when current criteria return empty results or all elements are filtered by parents or by search.
 * @beta
 */
export const AttributeFilterEmptyResult: React.VFC<IAttributeFilterEmptyResultProps> = ({
    height,
    totalItemsCount,
    searchString,
    isFilteredByParentFilters,
    parentFilterTitles = [],
}) => {
    let renderEmptyResult = null;

    const style = useMemo<CSSProperties>(() => {
        return {
            height,
        };
    }, [height]);

    if (totalItemsCount === 0) {
        renderEmptyResult = <AttributeFilterEmptyAttributeResult />;
    } else if (isFilteredByParentFilters) {
        renderEmptyResult = (
            <AttributeFilterAllValuesFilteredResult parentFilterTitles={parentFilterTitles} />
        );
    } else if (searchString.length > 0) {
        renderEmptyResult = <AttributeFilterEmptySearchResult />;
    }

    return (
        <div className="gd-attribute-filter-empty-result__next" style={style}>
            {renderEmptyResult}
        </div>
    );
};
