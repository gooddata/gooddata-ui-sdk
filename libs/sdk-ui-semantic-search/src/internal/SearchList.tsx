// (C) 2024 GoodData Corporation

import * as React from "react";
import { List } from "@gooddata/sdk-ui-kit";
import { useListSelector } from "../hooks/index.js";
import { ListItem, ListItemProps } from "../types.js";

const ITEM_HEIGHT = 50;

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
    const [selected, setSelected] = useListSelector(items, onSelect);

    return (
        <List
            width={width}
            height={ITEM_HEIGHT * items.length}
            itemHeight={ITEM_HEIGHT}
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
