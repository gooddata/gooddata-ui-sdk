// (C) 2020 GoodData Corporation
import React from "react";
import { stringUtils } from "@gooddata/util";
import { ObjRefInScope } from "@gooddata/sdk-model";
import cx from "classnames";
import { IAttributeDropdownItem } from "../../types";

interface IAttributeItemProps {
    item: IAttributeDropdownItem;
    iconClass: string;
    isSelected: boolean;
    onSelect: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
}

export const AttributeItem: React.FC<IAttributeItemProps> = ({
    item,
    iconClass,
    isSelected,
    onSelect,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
}) => {
    const { title, ref } = item;
    const className = cx(
        "gd-list-item",
        "gd-list-item-shortened",
        {
            "is-selected": isSelected,
        },
        "gd-button-link",
        iconClass,
        `s-rf-attribute-${stringUtils.simplifyText(title)}`,
    );

    const onMouseOver = () => {
        if (onDropDownItemMouseOver) {
            onDropDownItemMouseOver(ref);
        }
    };

    const onMouseOut = () => {
        if (onDropDownItemMouseOut) {
            onDropDownItemMouseOut();
        }
    };

    return (
        <button
            className={className}
            onClick={() => onSelect(ref)}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
        >
            <span>{title}</span>
        </button>
    );
};
