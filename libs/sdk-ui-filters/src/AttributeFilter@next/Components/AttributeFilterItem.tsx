// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import camelCase from "lodash/camelCase";
import { IInvertableListRenderItemProps } from "@gooddata/sdk-ui-kit";
import { AttributeListItem, isEmptyListItem } from "../types";

export type IAttributeFilterItemProps = IInvertableListRenderItemProps<AttributeListItem>;

export const AttributeFilterItem: React.VFC<IAttributeFilterItemProps> = (props) => {
    const { item, isSelected, onSelect } = props;

    const onItemClick = useCallback(() => {
        onSelect(item);
    }, [onSelect, item]);

    if (!item || isEmptyListItem(item)) {
        return <div className="gd-list-item gd-list-item-not-loaded"> loading ...</div>;
    }

    const classes = cx(
        "gd-list-item",
        "s-attribute-filter-list-item",
        `s-attribute-filter-list-item-${camelCase(item.title)}`,
        {
            "s-attribute-filter-list-item-selected": isSelected,
        },
    );

    return (
        <div className={classes} onClick={onItemClick}>
            <input type="checkbox" className="gd-input-checkbox" readOnly={true} checked={isSelected} />
            <span>{item.title}</span>
        </div>
    );
};
