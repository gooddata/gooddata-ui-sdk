// (C) 2024 GoodData Corporation

import * as React from "react";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { DropdownList } from "@gooddata/sdk-ui-kit";
import { ITEM_HEIGHT, ResultsItem } from "./ResultsItem.js";
import { useListSelector } from "./hooks/index.js";

/**
 * Search results props.
 * @internal
 */
type SearchResultsDropdownListProps = {
    /**
     * Search result items.
     */
    searchResults: ISemanticSearchResultItem[];
    /**
     * Loading flag.
     */
    searchLoading: boolean;
    /**
     * Mobile flag.
     */
    isMobile: boolean;
    /**
     * Width of the dropdown.
     */
    width: number;
    /**
     * Callback for item selection.
     */
    onSelect: (item: ISemanticSearchResultItem) => void;
};

/**
 * A dropdown list with the search results.
 * @internal
 */
export const SearchResultsDropdownList: React.FC<SearchResultsDropdownListProps> = ({
    searchResults,
    searchLoading,
    isMobile,
    width,
    onSelect,
}) => {
    const [selected, setSelected] = useListSelector(searchResults, onSelect);

    return (
        <DropdownList
            width={width}
            isMobile={isMobile}
            isLoading={searchLoading}
            itemHeight={ITEM_HEIGHT}
            renderItem={({ rowIndex, item, ...props }) => {
                return (
                    <ResultsItem
                        onHover={() => setSelected(rowIndex)}
                        onClick={() => {
                            onSelect(item);
                        }}
                        selected={rowIndex === selected}
                        item={item}
                        {...props}
                    />
                );
            }}
            items={searchResults}
        />
    );
};
