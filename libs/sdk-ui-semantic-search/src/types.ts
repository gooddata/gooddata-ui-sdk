// (C) 2024 GoodData Corporation

import { ISemanticSearchRelationship } from "@gooddata/sdk-model";

/**
 * A wrapper type to handle search results rendering.
 * @internal
 */
export type ListItem<T> = {
    item: T;
    url?: string;
    parentRef?: ISemanticSearchRelationship;
    isLocked?: boolean;
};

/**
 * Shared props definition for all list items components.
 * @internal
 */
export type ListItemProps<T> = {
    /**
     * The item to render.
     */
    listItem: ListItem<T>;
    /**
     * Whether the item is active.
     */
    isActive: boolean;
    /**
     * Set itself as an active item.
     */
    setActive: (item: ListItem<T>) => void;
    /**
     * Set itself as selected item.
     */
    onSelect: (item: ListItem<T>, e: MouseEvent) => void;
};
