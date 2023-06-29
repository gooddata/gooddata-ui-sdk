// (C) 2007-2022 GoodData Corporation
import React, { PureComponent, ReactNode } from "react";
import cx from "classnames";
import { ColorFormats } from "tinycolor2";

import { getColorStyle, SATURATION_ARRAY } from "../utils.js";

export interface IColorPickerMatrixProps {
    initColor: ColorFormats.HSL;
    onColorSelected: (color: ColorFormats.HSL) => void;
}

export class ColorPickerMatrix extends PureComponent<IColorPickerMatrixProps> {
    render(): ReactNode {
        return (
            <div className="color-picker-component">
                <ColorPickerRow
                    lightness={0.7}
                    initColor={this.props.initColor}
                    onColorSelected={this.props.onColorSelected}
                />
                <ColorPickerRow
                    lightness={0.5}
                    initColor={this.props.initColor}
                    onColorSelected={this.props.onColorSelected}
                />
                <ColorPickerRow
                    lightness={0.3}
                    initColor={this.props.initColor}
                    onColorSelected={this.props.onColorSelected}
                />
            </div>
        );
    }
}

interface IColorPickerRowProps extends IColorPickerMatrixProps {
    lightness: number;
}

class ColorPickerRow extends PureComponent<IColorPickerRowProps> {
    getCellClassNames(hslColor: ColorFormats.HSL) {
        return cx("color-picker-cell", `s-color-${Math.floor(hslColor.h + (hslColor.s + hslColor.l) * 100)}`);
    }

    render(): ReactNode {
        return (
            <div className="color-picker-row">
                {SATURATION_ARRAY.map((saturation) => {
                    const newColor = {
                        h: this.props.initColor.h,
                        s: saturation,
                        l: this.props.lightness,
                    };

                    return (
                        <div
                            role="color"
                            tabIndex={-1}
                            key={this.props.lightness + saturation}
                            className={this.getCellClassNames(newColor)}
                            style={getColorStyle(newColor)}
                            onClick={() => this.props.onColorSelected(newColor)}
                        />
                    );
                })}
            </div>
        );
    }
}
