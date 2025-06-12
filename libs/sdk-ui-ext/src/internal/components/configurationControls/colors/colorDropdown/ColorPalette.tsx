// (C) 2019-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import ColorPaletteItem from "./ColorPaletteItem.js";
import { IColor, IColorPaletteItem, IColorPalette } from "@gooddata/sdk-model";

const MAX_SMALL_PALETTE_SIZE = 20;

export interface IColorPaletteProps {
    selectedColorGuid?: string;
    colorPalette: IColorPalette;
    onColorSelected: (color: IColor) => void;
}

export default class ColorPalette extends React.PureComponent<IColorPaletteProps> {
    public render() {
        return (
            <div aria-label="Color palette" className={this.getClassNames()}>
                {this.renderItems()}
            </div>
        );
    }

    private getClassNames(): string {
        const isColorPaletteLarge = this.isColorPaletteLarge();
        return cx(
            {
                "gd-color-drop-down-list-large": isColorPaletteLarge,
                "gd-color-drop-down-list": !isColorPaletteLarge,
            },
            "s-color-drop-down-list",
        );
    }

    private renderItems(): React.ReactNode {
        return this.props.colorPalette.map((item: IColorPaletteItem) => {
            return (
                <ColorPaletteItem
                    selected={this.isItemSelected(item.guid)}
                    key={item.guid}
                    paletteItem={item}
                    onColorSelected={this.onColorSelected}
                />
            );
        });
    }

    private isColorPaletteLarge(): boolean {
        return this.props.colorPalette.length > MAX_SMALL_PALETTE_SIZE;
    }

    private isItemSelected(guid: string): boolean {
        return this.props.selectedColorGuid === guid;
    }

    private onColorSelected = (color: IColor): void => {
        this.props.onColorSelected(color);
    };
}
