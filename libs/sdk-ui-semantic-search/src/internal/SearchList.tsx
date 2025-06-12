// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { List } from "@gooddata/sdk-ui-kit";
import { useListScroll, useListSelector } from "../hooks/index.js";
import { ListItem, ListItemProps } from "../types.js";

const ITEM_HEIGHT = 50;
const MAX_ITEMS_UNSCROLLED = 10;

/**
 * Search results props.
 * @internal
 */
export type SearchListProps<T> = {
    /**
     * Search result items.
     */
    items: ListItem<T>[];
    /**
     * Width of the list.
     */
    width?: number;
    /**
     * Callback for item selection.
     */
    onSelect: (item: ListItem<T>, e: MouseEvent | KeyboardEvent) => void;
    /**
     * Component to render the item.
     */
    ItemComponent: React.ComponentType<ListItemProps<T>>;
};

/**
 * A dropdown list with the search results.
 * @internal
 */
export const SearchList = <T,>({ items, width, onSelect, ItemComponent }: SearchListProps<T>) => {
    const [selected, setSelected, direction] = useListSelector(items, onSelect);
    const [scrollToItem, scrollDirection] = useListScroll(selected, direction);

    return (
        <List
            width={width}
            height={ITEM_HEIGHT * Math.min(items.length, MAX_ITEMS_UNSCROLLED)}
            itemHeight={ITEM_HEIGHT}
            scrollToItem={scrollToItem}
            scrollDirection={scrollDirection}
            renderItem={({ item }) => {
                return (
                    <ItemComponent
                        listItem={item}
                        isActive={item === selected}
                        setActive={setSelected}
                        onSelect={onSelect}
                    />
                );
            }}
            items={items}
        />
    );
};
