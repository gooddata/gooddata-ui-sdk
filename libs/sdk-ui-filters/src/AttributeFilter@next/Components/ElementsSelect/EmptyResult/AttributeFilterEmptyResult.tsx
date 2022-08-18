// (C) 2021-2022 GoodData Corporation
import React, { useMemo, CSSProperties } from "react";
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
