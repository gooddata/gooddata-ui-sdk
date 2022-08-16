// (C) 2021-2022 GoodData Corporation
import React from "react";
import { AttributeFilterEmptySearchResult } from "./AttributeFilterEmptySearchResult";
import { AttributeFilterEmptyAttributeResult } from "./AttributeFilterEmptyAttributeResult";
import { AttributeFilterAllValuesFilteredResult } from "./AttributeFilterEmptyFilteredResult";

/**
 * @alpha
 */
export interface IAttributeFilterEmptyResultProps {
    height: number;
    totalItemsCount: number;
    isFilteredByParentFilters: boolean;
    searchString: string;
    parentFilterTitles?: string[];
}

/**
 * @internal
 */
export const AttributeFilterEmptyResult: React.VFC<IAttributeFilterEmptyResultProps> = ({
    height,
    totalItemsCount,
    searchString,
    isFilteredByParentFilters,
    parentFilterTitles = [],
}) => {
    let renderEmptyResult = null;

    if (totalItemsCount === 0) {
        renderEmptyResult = <AttributeFilterEmptyAttributeResult height={height} />;
    } else if (isFilteredByParentFilters) {
        renderEmptyResult = (
            <AttributeFilterAllValuesFilteredResult parentFilterTitles={parentFilterTitles} height={height} />
        );
    } else if (searchString.length > 0) {
        renderEmptyResult = <AttributeFilterEmptySearchResult height={height} />;
    }

    return (
        <div style={{ height, display: "flex", justifyContent: "center", alignItems: "center" }}>
            {renderEmptyResult}
        </div>
    );
};
