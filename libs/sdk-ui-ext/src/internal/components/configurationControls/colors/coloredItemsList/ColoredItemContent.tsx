// (C) 2019-2025 GoodData Corporation
import { memo } from "react";
import cx from "classnames";
import { IRgbColorValue } from "@gooddata/sdk-model";
import { ISelectableChild, IconPosition } from "../colorDropdown/ColorDropdown.js";

export interface IColoredItemContentProps extends ISelectableChild {
    color: IRgbColorValue;
    text: string;
}

function ColoredItemContent({ color, position, isSelected, disabled, text }: IColoredItemContentProps) {
    const getIconStyle = () => {
        const { r, g, b } = color;
        const iconStyle = position === IconPosition.Right ? "gd-icon-navigateright" : "gd-icon-navigatedown";
        const iconSelector = `s-color-${r}-${g}-${b}`;
        return `gd-color-config-item-sample ${iconStyle} ${iconSelector}`;
    };

    const getClassName = () => {
        return cx("gd-list-item gd-color-config-list-item s-colored-items-list-item", {
            "is-active": isSelected && !disabled,
            "is-disabled": disabled,
            "s-is-disabled": disabled,
        });
    };

    const getBackgroundColor = () => {
        const { r, g, b } = color;
        return `rgba(${r},${g},${b},1)`;
    };

    return (
        <div className={getClassName()}>
            <div className={getIconStyle()} style={{ backgroundColor: getBackgroundColor() }} />
            <span>{text}</span>
        </div>
    );
}

export default memo(ColoredItemContent);
