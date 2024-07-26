// (C) 2024 GoodData Corporation

import * as React from "react";
import { ISemanticSearchResultItemWithUrl } from "@gooddata/sdk-model";
import { List } from "@gooddata/sdk-ui-kit";
import { ITEM_HEIGHT, ResultsItem } from "../ResultsItem.js";
import { useListSelector } from "../hooks/index.js";

/**
 * Search results props.
 * @internal
 */
export type SearchResultsListProps = {
    /**
     * Search result items.
     */
    searchResults: ISemanticSearchResultItemWithUrl[];
    /**
     * Width of the list.
     */
    width: number;
    /**
     * Callback for item selection.
     */
    onSelect: (item: ISemanticSearchResultItemWithUrl) => void;
};

/**
 * A dropdown list with the search results.
 * @internal
 */
export const SearchResultsList: React.FC<SearchResultsListProps> = ({ searchResults, width, onSelect }) => {
    const [selected, setSelected] = useListSelector(searchResults, onSelect);

    return (
        <List
            width={width}
            height={ITEM_HEIGHT * searchResults.length}
            itemHeight={ITEM_HEIGHT}
            renderItem={({ item, width, height }) => {
                return (
                    <ResultsItem
                        onHover={setSelected}
                        onSelect={onSelect}
                        active={item === selected}
                        item={item}
                        width={width}
                        height={height}
                    />
                );
            }}
            items={searchResults}
        />
    );
};
