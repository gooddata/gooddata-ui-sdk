// (C) 2021-2022 GoodData Corporation
import React from "react";
import { InvertableSelectSearchBar } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export interface IAttributeFilterElementsSearchBarProps {
    searchString: string;
    onSearch: (text: string) => void;
}

/**
 * @internal
 */
export const AttributeFilterElementsSearchBar: React.VFC<IAttributeFilterElementsSearchBarProps> = (
    props,
) => {
    const { onSearch, searchString } = props;
    return <InvertableSelectSearchBar onSearch={onSearch} searchString={searchString} />;
};
