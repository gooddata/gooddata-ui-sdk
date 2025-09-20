// (C) 2007-2025 GoodData Corporation

import { useCallback, useState } from "react";

import { isEqual } from "lodash-es";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { ColorFormats } from "tinycolor2";

import { ColorPickerMatrix } from "./components/ColorPickerMatrix.js";
import { ColorsPreview } from "./components/ColorsPreview.js";
import { HexColorInput } from "./components/HexColorInput.js";
import { HueColorPicker } from "./components/HueColorPicker.js";
import { IColorPickerProps } from "./typings.js";
import { getHslFromRgbColor, getRgbFromHslColor, isHslColorBlackOrWhite } from "./utils.js";
import { Button } from "../Button/index.js";

function WrappedColorPicker(props: IColorPickerProps & WrappedComponentProps) {
    const currentHslColor = getHslFromRgbColor(props.initialRgbColor);
    const [draftHslColor, setDraftHslColor] = useState<ColorFormats.HSL>(currentHslColor);

    const onColorSelected = useCallback((selectedColor: ColorFormats.HSL) => {
        setDraftHslColor(selectedColor);
    }, []);

    const onHexInputColorSelected = useCallback((selectedColor: ColorFormats.HSL) => {
        if (isHslColorBlackOrWhite(selectedColor)) {
            setDraftHslColor((prevColor) => ({
                ...selectedColor,
                h: prevColor.h,
            }));
        } else {
            setDraftHslColor(selectedColor);
        }
    }, []);

    const handleSubmit = useCallback(() => {
        props.onSubmit(getRgbFromHslColor(draftHslColor));
    }, [props, draftHslColor]);

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
                    key={`${draftHslColor.h}-${draftHslColor.s}-${draftHslColor.l}`}
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
                        onClick={handleSubmit}
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
