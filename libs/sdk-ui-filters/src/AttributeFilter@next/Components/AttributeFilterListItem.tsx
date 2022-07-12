// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import camelCase from "lodash/camelCase";
import { FormattedMessage } from "react-intl";
import { IAttributeFilterListItemProps, isEmptyListItem } from "./types";

export const AttributeFilterListItem: React.VFC<IAttributeFilterListItemProps> = (props) => {
    const { item, isSelected, onSelect, onSelectOnly } = props;

    const onItemClick = useCallback(() => {
        onSelect(item);
    }, [onSelect, item]);

    const onOnlyItemClick = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            onSelectOnly(item);
        },
        [onSelectOnly, item],
    );

    if (!item || isEmptyListItem(item)) {
        // TODO: Discuss with UI how empty item should look like
        // maybe base on last UX screen we will not need this dynamic items
        return <div className="gd-list-item gd-list-item-not-loaded"> loading ...</div>;
    }

    const classes = cx(
        "gd-list-item",
        "has-only-visible",
        "s-attribute-filter-list-item",
        `s-attribute-filter-list-item-${camelCase(item.title)}`,
        {
            "s-attribute-filter-list-item-selected": isSelected,
        },
    );

    return (
        <div className={classes} onClick={onItemClick}>
            <input type="checkbox" className="gd-input-checkbox" readOnly={true} checked={isSelected} />
            <span className={"s-attribute-filter-list-item-title"}>{item.title}</span>
            <span className="gd-list-item-only" onClick={onOnlyItemClick}>
                <FormattedMessage id="gs.list.only" />
            </span>
        </div>
    );
};
