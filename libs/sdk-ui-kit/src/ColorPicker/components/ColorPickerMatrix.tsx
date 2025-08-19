// (C) 2007-2025 GoodData Corporation
import React, { ReactNode, memo, useCallback, useMemo } from "react";

import cx from "classnames";
import { ColorFormats } from "tinycolor2";

import { SATURATION_ARRAY, getColorStyle } from "../utils.js";

export interface IColorPickerMatrixProps {
    initColor: ColorFormats.HSL;
    onColorSelected: (color: ColorFormats.HSL) => void;
}

export const ColorPickerMatrix = memo(function ColorPickerMatrix(props: IColorPickerMatrixProps): ReactNode {
    return (
        <div className="color-picker-component">
            <ColorPickerRow
                lightness={0.7}
                initColor={props.initColor}
                onColorSelected={props.onColorSelected}
            />
            <ColorPickerRow
                lightness={0.5}
                initColor={props.initColor}
                onColorSelected={props.onColorSelected}
            />
            <ColorPickerRow
                lightness={0.3}
                initColor={props.initColor}
                onColorSelected={props.onColorSelected}
            />
        </div>
    );
});

interface IColorPickerRowProps extends IColorPickerMatrixProps {
    lightness: number;
}

const ColorPickerRow = memo(function ColorPickerRow({
    onColorSelected,
    initColor,
    lightness,
}: IColorPickerRowProps): ReactNode {
    const getCellClassNames = useCallback((hslColor: ColorFormats.HSL) => {
        return cx("color-picker-cell", `s-color-${Math.floor(hslColor.h + (hslColor.s + hslColor.l) * 100)}`);
    }, []);

    const handleColorClick = useCallback(
        (color: ColorFormats.HSL) => () => {
            onColorSelected(color);
        },
        [onColorSelected],
    );

    const colorCells = useMemo(() => {
        return SATURATION_ARRAY.map((saturation) => {
            const newColor = {
                h: initColor.h,
                s: saturation,
                l: lightness,
            };

            return (
                <div
                    role="color"
                    tabIndex={-1}
                    key={lightness + saturation}
                    className={getCellClassNames(newColor)}
                    style={getColorStyle(newColor)}
                    onClick={handleColorClick(newColor)}
                />
            );
        });
    }, [initColor.h, lightness, getCellClassNames, handleColorClick]);

    return <div className="color-picker-row">{colorCells}</div>;
});
