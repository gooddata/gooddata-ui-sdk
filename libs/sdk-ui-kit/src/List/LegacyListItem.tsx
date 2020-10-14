// (C) 2020 GoodData Corporation
import React, { Component } from "react";
import get from "lodash/get";

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
        const itemType = get(item, "source.type", null);

        if (itemType === "separator") {
            return <div className="gd-list-item gd-list-item-separator" />;
        }

        if (itemType === "header") {
            const itemTitle = get(item, "source.title", null);
            return <div className="gd-list-item gd-list-item-header">{itemTitle}</div>;
        }

        return <ListItemComponent {...item} />;
    }
}
