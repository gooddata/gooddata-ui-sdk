// (C) 2019-2025 GoodData Corporation
import { memo } from "react";
import cx from "classnames";
import ColorPaletteItem from "./ColorPaletteItem.js";
import { IColor, IColorPaletteItem, IColorPalette } from "@gooddata/sdk-model";

const MAX_SMALL_PALETTE_SIZE = 20;

export interface IColorPaletteProps {
    selectedColorGuid?: string;
    colorPalette: IColorPalette;
    onColorSelected: (color: IColor) => void;
}

export const ColorPalette = memo(function ColorPalette(props: IColorPaletteProps) {
    const isColorPaletteLarge = (): boolean => {
        return props.colorPalette.length > MAX_SMALL_PALETTE_SIZE;
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
        return props.selectedColorGuid === guid;
    };

    const onColorSelected = (color: IColor): void => {
        props.onColorSelected(color);
    };

    const renderItems = (): React.ReactNode => {
        return props.colorPalette.map((item: IColorPaletteItem) => {
            return (
                <ColorPaletteItem
                    selected={isItemSelected(item.guid)}
                    key={item.guid}
                    paletteItem={item}
                    onColorSelected={onColorSelected}
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

export default ColorPalette;
