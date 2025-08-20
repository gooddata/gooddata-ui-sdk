// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";

import cx from "classnames";

import { IRgbColorValue } from "@gooddata/sdk-model";

import { ISelectableChild, IconPosition } from "../colorDropdown/ColorDropdown.js";

export interface IColoredItemContentProps extends ISelectableChild {
    color: IRgbColorValue;
    text: string;
}

export const ColoredItemContent = memo(function ColoredItemContent(props: IColoredItemContentProps) {
    const getIconStyle = () => {
        const { r, g, b } = props.color;
        const iconStyle =
            props.position === IconPosition.Right ? "gd-icon-navigateright" : "gd-icon-navigatedown";
        const iconSelector = `s-color-${r}-${g}-${b}`;
        return `gd-color-config-item-sample ${iconStyle} ${iconSelector}`;
    };

    const getClassName = () => {
        const { isSelected, disabled } = props;
        return cx("gd-list-item gd-color-config-list-item s-colored-items-list-item", {
            "is-active": isSelected && !disabled,
            "is-disabled": disabled,
            "s-is-disabled": disabled,
        });
    };

    const getBackgroundColor = (): string => {
        const { r, g, b } = props.color;
        return `rgba(${r},${g},${b},1)`;
    };

    return (
        <div className={getClassName()}>
            <div className={getIconStyle()} style={{ backgroundColor: getBackgroundColor() }} />
            <span>{props.text}</span>
        </div>
    );
});

export default ColoredItemContent;
