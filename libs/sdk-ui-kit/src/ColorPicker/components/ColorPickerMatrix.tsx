// (C) 2007-2025 GoodData Corporation
import React, { memo, ReactNode } from "react";
import cx from "classnames";
import { ColorFormats } from "tinycolor2";

import { getColorStyle, SATURATION_ARRAY } from "../utils.js";

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

const ColorPickerRow = memo(function ColorPickerRow(props: IColorPickerRowProps): ReactNode {
    function getCellClassNames(hslColor: ColorFormats.HSL) {
        return cx("color-picker-cell", `s-color-${Math.floor(hslColor.h + (hslColor.s + hslColor.l) * 100)}`);
    }

    return (
        <div className="color-picker-row">
            {SATURATION_ARRAY.map((saturation) => {
                const newColor = {
                    h: props.initColor.h,
                    s: saturation,
                    l: props.lightness,
                };

                return (
                    <div
                        role="color"
                        tabIndex={-1}
                        key={props.lightness + saturation}
                        className={getCellClassNames(newColor)}
                        style={getColorStyle(newColor)}
                        onClick={() => props.onColorSelected(newColor)}
                    />
                );
            })}
        </div>
    );
});
