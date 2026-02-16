// (C) 2021-2026 GoodData Corporation

import { type KeyboardEvent } from "react";

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

    /**
     * Callback for key down event
     *
     * @beta
     */
    onKeyDown?: (e: KeyboardEvent) => void;
}

/**
 * This component displays a text field and calls onSearch callback when user types search text.
 *
 * @beta
 */
export function AttributeFilterElementsSearchBar(props: IAttributeFilterElementsSearchBarProps) {
    return <InvertableSelectSearchBar {...props} />;
}
