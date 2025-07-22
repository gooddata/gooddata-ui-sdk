// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { useCallback, useRef } from "react";
import { IUiListboxInteractiveItem, IUiListboxItem, UiListbox } from "@gooddata/sdk-ui-kit";
import type { ListItem, ListItemProps } from "../types.js";

const ITEM_HEIGHT = 50;
const MAX_ITEMS_UNSCROLLED = 10;

/**
 * Search results props.
 * @internal
 */
export type SearchListProps<T, R> = {
    /**
     * Search result items.
     */
    items: IUiListboxItem<ListItem<T, R>>[];
    /**
     * Width of the list.
     */
    width?: number;
    /**
     * Callback for item selection.
     */
    onSelect: (item: ListItem<T, R> | ListItem<R, undefined>, mods: { newTab?: boolean }) => void;
    /**
     * Component to render the item.
     */
    ItemComponent: React.ComponentType<ListItemProps<T, R>>;
};

/**
 * A dropdown list with the search results.
 * @internal
 */
export const SearchList = <T, R>({ items, width, onSelect, ItemComponent }: SearchListProps<T, R>) => {
    const [hovered, setHovered] = React.useState<ListItem<T, R> | null>(null);
    const [opened, setOpened] = React.useState<ListItem<T, R> | null>(null);

    const itemRef = useRef<ListItem<T, R> | ListItem<R, undefined> | null>(null);
    const onSelectHandler = useCallback(
        (item: IUiListboxInteractiveItem<ListItem<T, R>>, mods: { newTab?: boolean }) => {
            onSelect(itemRef.current ?? item.data, mods);
        },
        [onSelect],
    );

    return (
        <UiListbox
            items={items}
            shouldCloseOnSelect={false}
            maxWidth={width}
            maxHeight={ITEM_HEIGHT * Math.min(items.length, MAX_ITEMS_UNSCROLLED)}
            onSelect={onSelectHandler}
            InteractiveItemComponent={({ item, isFocused, isSelected, onSelect }) => {
                return (
                    <ItemComponent
                        listItem={item}
                        isActive={hovered ? hovered === item.data : isSelected || isFocused}
                        onSelect={(item, e) => {
                            itemRef.current = item;
                            onSelect(e);
                        }}
                        onHover={(item, state) => {
                            setHovered(state ? item : null);
                        }}
                        isOpened={opened === item.data}
                        setOpened={(item, state) => {
                            setOpened(state ? item : null);
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
};
