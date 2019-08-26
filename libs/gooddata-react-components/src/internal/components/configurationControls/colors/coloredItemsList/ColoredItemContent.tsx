// (C) 2019 GoodData Corporation
import * as React from "react";
import * as classNames from "classnames";
import { IColor } from "@gooddata/gooddata-js";
import { ISelectableChild, IconPosition } from "../colorDropdown/ColorDropdown";

export interface IColoredItemContentProps extends ISelectableChild {
    color: IColor;
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
            this.props.position === IconPosition.Right ? "icon-navigateright" : "icon-navigatedown";
        const iconSelector = `s-color-${r}-${g}-${b}`;
        return `gd-color-config-item-sample ${iconStyle} ${iconSelector}`;
    }

    private getClassName() {
        return classNames("gd-list-item gd-color-config-list-item s-colored-items-list-item", {
            "is-active": this.props.isSelected,
        });
    }

    private getBackgroundColor(): string {
        const { r, g, b } = this.props.color;
        return `rgba(${r},${g},${b},1)`;
    }
}
