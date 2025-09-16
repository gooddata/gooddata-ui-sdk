// (C) 2020-2025 GoodData Corporation

import { ElementType, ReactElement } from "react";

/**
 * @internal
 */
export interface ILegacyListItemProps<T> {
    item?: T;
    listItemClass: ElementType;
}

/**
 * @internal
 * @deprecated This component is deprecated use ListItem instead
 */
export function LegacyListItem<T>({ item = {} as T, listItemClass }: ILegacyListItemProps<T>): ReactElement {
    const ListItemComponent = listItemClass;
    const itemType = (item as any)?.source?.type ?? null;

    if (itemType === "separator") {
        return <div role="list-item-separator" className="gd-list-item gd-list-item-separator" />;
    }

    if (itemType === "header") {
        const itemTitle = (item as any)?.source?.title ?? null;
        return (
            <div role="list-item-header" className="gd-list-item gd-list-item-header">
                {itemTitle}
            </div>
        );
    }

    return <ListItemComponent {...item} />;
}
