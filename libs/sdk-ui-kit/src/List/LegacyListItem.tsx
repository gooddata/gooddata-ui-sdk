// (C) 2020-2022 GoodData Corporation
import React, { Component } from "react";

/**
 * @internal
 */
export interface ILegacyListItemProps<T> {
    item?: T;
    listItemClass: React.ElementType;
}

/**
 * @internal
 * @deprecated This component is deprecated use ListItem instead
 */
export class LegacyListItem<T> extends Component<ILegacyListItemProps<T>> {
    static defaultProps = {
        item: {},
    };

    public render(): JSX.Element {
        const { item, listItemClass } = this.props;
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
}
