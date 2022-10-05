// (C) 2021-2022 GoodData Corporation
import React from "react";
import { IAttributeFilterElementsSearchBarProps } from "../ElementsSelect/AttributeFilterElementsSearchBar";

/**
 * @internal
 */
export const EmptyElementsSearchBar: React.VFC<IAttributeFilterElementsSearchBarProps> = (_props) => {
    return <div className="gd-empty-select-search-bar" />;
};
