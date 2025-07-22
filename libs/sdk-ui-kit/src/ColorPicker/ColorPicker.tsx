// (C) 2007-2025 GoodData Corporation
import React, { useState } from "react";
import isEqual from "lodash/isEqual.js";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ColorFormats } from "tinycolor2";

import { Button } from "../Button/index.js";

import { ColorPickerMatrix } from "./components/ColorPickerMatrix.js";
import { HexColorInput } from "./components/HexColorInput.js";
import { HueColorPicker } from "./components/HueColorPicker.js";
import { ColorsPreview } from "./components/ColorsPreview.js";
import { getRgbFromHslColor, getHslFromRgbColor, isHslColorBlackOrWhite } from "./utils.js";
import { IColorPickerProps } from "./typings.js";

function WrappedColorPicker(props: IColorPickerProps & WrappedComponentProps) {
    const currentHslColor = getHslFromRgbColor(props.initialRgbColor);
    const [draftHslColor, setDraftHslColor] = useState<ColorFormats.HSL>(currentHslColor);

    const onColorSelected = (selectedColor: ColorFormats.HSL) => {
        setDraftHslColor(selectedColor);
    };

    const onHexInputColorSelected = (selectedColor: ColorFormats.HSL) => {
        if (isHslColorBlackOrWhite(selectedColor)) {
            setDraftHslColor({
                ...selectedColor,
                h: draftHslColor.h,
            });
        } else {
            onColorSelected(selectedColor);
        }
    };

    const currentHslColorForPreview = getHslFromRgbColor(props.initialRgbColor);
    const { intl } = props;

    return (
        <div className="color-picker-container" aria-label="Color picker">
            <ColorPickerMatrix initColor={draftHslColor} onColorSelected={onColorSelected} />
            <div className="color-picker-control-wrapper">
                <HueColorPicker initColor={draftHslColor} onChange={onColorSelected} />
                <HexColorInput
                    initColor={draftHslColor}
                    onInputChanged={onHexInputColorSelected}
                    placeholder={intl.formatMessage({ id: "gs.color-picker.inputPlaceholder" })}
                    label={intl.formatMessage({ id: "gs.color-picker.hex" })}
                />
                <ColorsPreview
                    currentHslColor={currentHslColorForPreview}
                    draftHslColor={draftHslColor}
                    currentTextLabel={intl.formatMessage({ id: "gs.color-picker.currentColor" })}
                    draftTextLabel={intl.formatMessage({ id: "gs.color-picker.newColor" })}
                />
                <div className="color-picker-buttons-wrapper">
                    <Button
                        value={intl.formatMessage({ id: "gs.color-picker.cancelButton" })}
                        className="gd-button-secondary gd-button color-picker-button"
                        onClick={props.onCancel}
                    />
                    <Button
                        value={intl.formatMessage({ id: "gs.color-picker.okButton" })}
                        disabled={isEqual(props.initialRgbColor, getRgbFromHslColor(draftHslColor))}
                        className="gd-button-action gd-button color-picker-ok-button"
                        onClick={() => props.onSubmit(getRgbFromHslColor(draftHslColor))}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * @internal
 */
export const ColorPicker = injectIntl(WrappedColorPicker);
