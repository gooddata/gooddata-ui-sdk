// (C) 2019-2025 GoodData Corporation

import { ReactNode, memo } from "react";

import cx from "classnames";

import { IColor, IColorPalette, IColorPaletteItem } from "@gooddata/sdk-model";
import { ChartFillConfig, PatternFillName } from "@gooddata/sdk-ui-vis-commons";

import { ColorPaletteItem } from "./ColorPaletteItem.js";

const MAX_SMALL_PALETTE_SIZE = 20;

export interface IColorPaletteProps {
    selectedColorGuid?: string;
    colorPalette: IColorPalette;
    onColorSelected: (color: IColor) => void;
    chartFill?: ChartFillConfig;
    patternFillIndex?: number | PatternFillName;
}

export const ColorPalette = memo(function ColorPalette({
    selectedColorGuid,
    colorPalette,
    onColorSelected,
    chartFill,
    patternFillIndex,
}: IColorPaletteProps) {
    const isColorPaletteLarge = (): boolean => {
        return colorPalette.length > MAX_SMALL_PALETTE_SIZE;
    };

    const getClassNames = (): string => {
        const isLargePalette = isColorPaletteLarge();
        return cx(
            {
                "gd-color-drop-down-list-large": isLargePalette,
                "gd-color-drop-down-list": !isLargePalette,
            },
            "s-color-drop-down-list",
        );
    };

    const isItemSelected = (guid: string): boolean => {
        return selectedColorGuid === guid;
    };

    const renderItems = (): ReactNode => {
        return colorPalette.map((item: IColorPaletteItem) => {
            return (
                <ColorPaletteItem
                    selected={isItemSelected(item.guid)}
                    key={item.guid}
                    paletteItem={item}
                    onColorSelected={onColorSelected}
                    chartFill={chartFill?.type}
                    patternFillIndex={patternFillIndex}
                />
            );
        });
    };

    return (
        <div aria-label="Color palette" className={getClassNames()}>
            {renderItems()}
        </div>
    );
});
