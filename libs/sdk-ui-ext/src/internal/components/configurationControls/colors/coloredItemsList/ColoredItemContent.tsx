// (C) 2019-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IRgbColorValue } from "@gooddata/sdk-model";
import { ISelectableChild, IconPosition } from "../colorDropdown/ColorDropdown.js";

export interface IColoredItemContentProps extends ISelectableChild {
    color: IRgbColorValue;
    text: string;
}

export default class ColoredItemContent extends React.PureComponent<IColoredItemContentProps> {
    public render() {
        return (
            <div className={this.getClassName()}>
                <div className={this.getIconStyle()} style={{ backgroundColor: this.getBackgroundColor() }} />
                <span>{this.props.text}</span>
            </div>
        );
    }

    private getIconStyle() {
        const { r, g, b } = this.props.color;
        const iconStyle =
            this.props.position === IconPosition.Right ? "gd-icon-navigateright" : "gd-icon-navigatedown";
        const iconSelector = `s-color-${r}-${g}-${b}`;
        return `gd-color-config-item-sample ${iconStyle} ${iconSelector}`;
    }

    private getClassName() {
        return cx("gd-list-item gd-color-config-list-item s-colored-items-list-item", {
            "is-active": this.props.isSelected,
        });
    }

    private getBackgroundColor(): string {
        const { r, g, b } = this.props.color;
        return `rgba(${r},${g},${b},1)`;
    }
}
