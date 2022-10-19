// (C) 2021-2022 GoodData Corporation
import React from "react";
import { InvertableSelectSearchBar } from "@gooddata/sdk-ui-kit";

/**
 * It represent a text field input for searching Attribute Filter elements
 *
 * @beta
 */
export interface IAttributeFilterElementsSearchBarProps {
    /**
     * Current search string
     *
     * @beta
     */
    searchString: string;

    /**
     * Debounced search string callback
     *
     * @beta
     */
    onSearch: (text: string) => void;

    /**
     * Render smaller text input
     *
     * @beta
     */
    isSmall?: boolean;
}

/**
 * This component displays a text field and calls onSearch callback when user types search text.
 *
 * @beta
 */
export const AttributeFilterElementsSearchBar: React.VFC<IAttributeFilterElementsSearchBarProps> = (
    props,
) => {
    const { onSearch, searchString, isSmall } = props;

    return <InvertableSelectSearchBar onSearch={onSearch} searchString={searchString} isSmall={isSmall} />;
};
