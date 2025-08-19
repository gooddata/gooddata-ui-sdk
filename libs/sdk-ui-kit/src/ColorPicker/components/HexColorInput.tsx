// (C) 2007-2025 GoodData Corporation
import React, { Fragment, ReactNode, memo, useCallback } from "react";

import { ColorFormats } from "tinycolor2";

import { Input } from "../../Form/index.js";
import { getHexFromHslColor, getHslFromHexColor, isHexColorValid } from "../utils.js";

export interface IHexColorInputProps {
    initColor: ColorFormats.HSL;
    onInputChanged: (color: ColorFormats.HSL) => void;
    placeholder?: string;
    label?: string;
}

export const HexColorInput = memo(function HexColorInput(props: IHexColorInputProps): ReactNode {
    const { initColor, onInputChanged, placeholder = "", label = "" } = props;

    const onInputChange = useCallback(
        (value: string): void => {
            if (isHexColorValid(value)) {
                const newHsl = getHslFromHexColor(value);
                onInputChanged(newHsl);
            }
        },
        [onInputChanged],
    );

    const hexValue = getHexFromHslColor(initColor);

    return (
        <Fragment>
            <Input
                className="s-color-picker-hex"
                value={hexValue}
                onChange={onInputChange}
                placeholder={placeholder}
            />
            <p>{label}</p>
        </Fragment>
    );
});
