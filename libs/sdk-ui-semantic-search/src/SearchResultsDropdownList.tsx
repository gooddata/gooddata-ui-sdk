// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { useCallback } from "react";
import { ISemanticSearchRelationship, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { IUiListboxInteractiveItem, UiListbox } from "@gooddata/sdk-ui-kit";

import { ResultsItem } from "./ResultsItem.js";
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
    searchResults: IUiListboxInteractiveItem<
        ListItem<ISemanticSearchResultItem, ISemanticSearchRelationship>
    >[];
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
    onSelect: (
        item: ISemanticSearchResultItem | ISemanticSearchRelationship,
        mods: { newTab?: boolean },
    ) => void;
};

/**
 * A dropdown list with the search results.
 * @internal
 */
export const SearchResultsDropdownList: React.FC<SearchResultsDropdownListProps> = ({
    searchResults,
    isMobile,
    width,
    onSelect,
}) => {
    const [hovered, setHovered] = React.useState<ListItem<
        ISemanticSearchResultItem,
        ISemanticSearchRelationship
    > | null>(null);

    const onSelectHandler = useCallback(
        (
            item: IUiListboxInteractiveItem<ListItem<ISemanticSearchResultItem, ISemanticSearchRelationship>>,
            mods: { newTab?: boolean },
        ) => {
            onSelect(item.data.item, mods);
        },
        [onSelect],
    );

    return (
        <UiListbox
            isCompact={isMobile}
            items={searchResults}
            shouldCloseOnSelect={false}
            width={width}
            maxHeight={ITEM_HEIGHT * Math.min(searchResults.length, MAX_ITEMS_UNSCROLLED)}
            onSelect={onSelectHandler}
            InteractiveItemComponent={({ item, isFocused, isSelected, onSelect }) => {
                return (
                    <ResultsItem
                        listItem={item}
                        isActive={hovered ? hovered === item.data : isSelected || isFocused}
                        onHover={(item, state) => {
                            setHovered(state ? item : null);
                        }}
                        onSelect={(_, e) => {
                            onSelect(e);
                        }}
                    />
                );
            }}
            ariaAttributes={{
                //TODO
                id: "search-results-listbox",
                "aria-label": "Search",
            }}
        />
    );

    // return (
    //     <DropdownList
    //         width={width}
    //         height={ITEM_HEIGHT * Math.min(searchResults.length, MAX_ITEMS_UNSCROLLED)}
    //         isMobile={isMobile}
    //         isLoading={searchLoading}
    //         itemHeight={ITEM_HEIGHT}
    //         scrollToItem={scrollToItem}
    //         scrollDirection={scrollDirection}
    //         renderItem={({ item }) => {
    //             return (
    //                 <ResultsItem
    //                     listItem={{
    //                         data: item,
    //                         type: "interactive",
    //                         id: item.item.id,
    //                         stringTitle: item.item.title,
    //                     }}
    //                     isActive={selected === item}
    //                     onHover={() => void 0}
    //                     isOpened={false}
    //                     setOpened={() => void 0}
    //                     onSelect={() => {
    //                         onListItemSelect(item);
    //                     }}
    //                 />
    //             );
    //         }}
    //         items={searchResults}
    //     />
    // );
};
