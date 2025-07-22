// (C) 2024-2025 GoodData Corporation

import React from "react";
import { IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

/**
 * A wrapper type to handle search results rendering.
 * @internal
 */
export type ListItem<T, R> = {
    item: T;
    url?: string;
    isLocked?: boolean;
    parents?: ListItem<R, undefined>[];
};

/**
 * Shared props definition for all list items components.
 * @internal
 */
export type ListItemProps<T, R> = {
    /**
     * The item to render.
     */
    listItem: IUiListboxInteractiveItem<ListItem<T, R>>;
    /**
     * Whether the item is active.
     */
    isActive: boolean;
    /**
     * Whether the item is opened.
     */
    isOpened?: boolean;
    /**
     * Set itself as an opened item.
     */
    setOpened?: (item: ListItem<T, R>, state: boolean) => void;
    /**
     * On hover handler
     */
    onHover: (item: ListItem<T, R>, state: boolean) => void;
    /**
     * On select handler
     */
    onSelect: (item: ListItem<T, R> | ListItem<R, undefined>, e: React.MouseEvent) => void;
};
