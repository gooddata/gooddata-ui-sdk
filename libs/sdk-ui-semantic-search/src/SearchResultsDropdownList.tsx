// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { DropdownList } from "@gooddata/sdk-ui-kit";
import { ResultsItem } from "./ResultsItem.js";
import { useListScroll, useListSelector } from "./hooks/index.js";
import { ListItem } from "./types.js";

const ITEM_HEIGHT = 50;
const MAX_ITEMS_UNSCROLLED = 5;

/**
 * Search results props.
 * @internal
 */
type SearchResultsDropdownListProps = {
    /**
     * Search result items.
     */
    searchResults: ListItem<ISemanticSearchResultItem>[];
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
    const onListItemSelect = (item: ListItem<ISemanticSearchResultItem>) => onSelect(item.item);
    const [active, setActive, direction] = useListSelector(searchResults, onListItemSelect);
    const [scrollToItem, scrollDirection] = useListScroll(active, direction);

    return (
        <DropdownList
            width={width}
            height={ITEM_HEIGHT * Math.min(searchResults.length, MAX_ITEMS_UNSCROLLED)}
            isMobile={isMobile}
            isLoading={searchLoading}
            itemHeight={ITEM_HEIGHT}
            scrollToItem={scrollToItem}
            scrollDirection={scrollDirection}
            renderItem={({ item }) => {
                return (
                    <ResultsItem
                        listItem={item}
                        isActive={active === item}
                        setActive={setActive}
                        onSelect={onListItemSelect}
                    />
                );
            }}
            items={searchResults}
        />
    );
};
