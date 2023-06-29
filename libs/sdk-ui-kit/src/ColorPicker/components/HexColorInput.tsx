// (C) 2007-2020 GoodData Corporation
import React, { PureComponent, Fragment, ReactNode } from "react";
import { ColorFormats } from "tinycolor2";

import { getHslFromHexColor, getHexFromHslColor, isHexColorValid } from "../utils.js";
import { Input } from "../../Form/index.js";

export interface IHexColorInputProps {
    initColor: ColorFormats.HSL;
    onInputChanged: (color: ColorFormats.HSL) => void;
    placeholder?: string;
    label?: string;
}

export class HexColorInput extends PureComponent<IHexColorInputProps> {
    static defaultProps: Pick<IHexColorInputProps, "label" | "placeholder"> = {
        placeholder: "",
        label: "",
    };

    onInputChange = (value: string): void => {
        if (isHexColorValid(value)) {
            const newHsl = getHslFromHexColor(value);
            this.props.onInputChanged(newHsl);
        }
    };

    render(): ReactNode {
        const hexValue = getHexFromHslColor(this.props.initColor);

        return (
            <Fragment>
                <Input
                    className="s-color-picker-hex"
                    value={hexValue}
                    onChange={this.onInputChange}
                    placeholder={this.props.placeholder}
                />
                <p>{this.props.label}</p>
            </Fragment>
        );
    }
}
