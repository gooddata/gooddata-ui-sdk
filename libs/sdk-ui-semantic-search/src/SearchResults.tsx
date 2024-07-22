// (C) 2024 GoodData Corporation

import * as React from "react";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { DropdownList } from "@gooddata/sdk-ui-kit";
import { ResultsItem } from "./ResultsItem.js";

/**
 * Search results props.
 * @internal
 */
type SearchResultsProps = {
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
export const SearchResults: React.FC<SearchResultsProps> = ({
    searchResults,
    searchLoading,
    isMobile,
    width,
    onSelect,
}) => {
    const [selected, setSelected] = React.useState<number>(0);
    React.useEffect(() => {
        setSelected(0);
    }, [searchResults]);

    React.useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (["ArrowDown", "ArrowUp", "Enter"].indexOf(event.key) === -1) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            switch (event.key) {
                case "ArrowDown":
                    setSelected(Math.min(selected + 1, searchResults.length - 1));
                    break;
                case "ArrowUp":
                    setSelected(Math.max(selected - 1, 0));
                    break;
                case "Enter":
                    onSelect(searchResults[selected]);
            }
        };

        // Listen to keyboard events while the component is mounted
        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, [searchResults, onSelect, selected]);

    return (
        <DropdownList
            width={width}
            isMobile={isMobile}
            isLoading={searchLoading}
            itemHeight={45}
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
