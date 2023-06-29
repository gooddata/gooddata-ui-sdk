// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import isEqual from "lodash/isEqual.js";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ColorFormats } from "tinycolor2";

import { Button } from "../Button/index.js";

import { ColorPickerMatrix } from "./components/ColorPickerMatrix.js";
import { HexColorInput } from "./components/HexColorInput.js";
import { HueColorPicker } from "./components/HueColorPicker.js";
import { ColorsPreview } from "./components/ColorsPreview.js";
import { getRgbFromHslColor, getHslFromRgbColor, isHslColorBlackOrWhite } from "./utils.js";
import { IColorPickerProps, IColorPickerState } from "./typings.js";

class WrappedColorPicker extends Component<IColorPickerProps & WrappedComponentProps, IColorPickerState> {
    constructor(props: IColorPickerProps & WrappedComponentProps) {
        super(props);

        const currentHslColor = getHslFromRgbColor(this.props.initialRgbColor);

        this.state = {
            draftHslColor: currentHslColor,
        };

        this.onColorSelected = this.onColorSelected.bind(this);
        this.onHexInputColorSelected = this.onHexInputColorSelected.bind(this);
    }

    onColorSelected(selectedColor: ColorFormats.HSL) {
        this.setState({
            draftHslColor: selectedColor,
        });
    }

    onHexInputColorSelected(selectedColor: ColorFormats.HSL) {
        if (isHslColorBlackOrWhite(selectedColor)) {
            this.setState({
                draftHslColor: {
                    ...selectedColor,
                    h: this.state.draftHslColor.h,
                },
            });
        } else {
            this.onColorSelected(selectedColor);
        }
    }

    render() {
        const currentHslColor = getHslFromRgbColor(this.props.initialRgbColor);
        const { intl } = this.props;

        return (
            <div className="color-picker-container" aria-label="Color picker">
                <ColorPickerMatrix
                    initColor={this.state.draftHslColor}
                    onColorSelected={this.onColorSelected}
                />
                <div className="color-picker-control-wrapper">
                    <HueColorPicker initColor={this.state.draftHslColor} onChange={this.onColorSelected} />
                    <HexColorInput
                        initColor={this.state.draftHslColor}
                        onInputChanged={this.onHexInputColorSelected}
                        placeholder={intl.formatMessage({ id: "gs.color-picker.inputPlaceholder" })}
                        label={intl.formatMessage({ id: "gs.color-picker.hex" })}
                    />
                    <ColorsPreview
                        currentHslColor={currentHslColor}
                        draftHslColor={this.state.draftHslColor}
                        currentTextLabel={intl.formatMessage({ id: "gs.color-picker.currentColor" })}
                        draftTextLabel={intl.formatMessage({ id: "gs.color-picker.newColor" })}
                    />
                    <div className="color-picker-buttons-wrapper">
                        <Button
                            value={intl.formatMessage({ id: "gs.color-picker.cancelButton" })}
                            className="gd-button-secondary gd-button color-picker-button"
                            onClick={this.props.onCancel}
                        />
                        <Button
                            value={intl.formatMessage({ id: "gs.color-picker.okButton" })}
                            disabled={isEqual(
                                this.props.initialRgbColor,
                                getRgbFromHslColor(this.state.draftHslColor),
                            )}
                            className="gd-button-action gd-button color-picker-ok-button"
                            onClick={() => this.props.onSubmit(getRgbFromHslColor(this.state.draftHslColor))}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * @internal
 */
export const ColorPicker = injectIntl(WrappedColorPicker);
