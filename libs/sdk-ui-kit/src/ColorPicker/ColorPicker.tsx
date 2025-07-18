// (C) 2007-2025 GoodData Corporation
import { useMemo, useState, useCallback } from "react";
import isEqual from "lodash/isEqual.js";
import { useIntl } from "react-intl";
import { ColorFormats } from "tinycolor2";

import { Button } from "../Button/index.js";

import { ColorPickerMatrix } from "./components/ColorPickerMatrix.js";
import { HexColorInput } from "./components/HexColorInput.js";
import { HueColorPicker } from "./components/HueColorPicker.js";
import { ColorsPreview } from "./components/ColorsPreview.js";
import { getRgbFromHslColor, getHslFromRgbColor, isHslColorBlackOrWhite } from "./utils.js";
import { IColorPickerProps } from "./typings.js";

/**
 * @internal
 */
export function ColorPicker({ initialRgbColor, onCancel, onSubmit }: IColorPickerProps) {
    const intl = useIntl();

    const initialHsl = useMemo(() => getHslFromRgbColor(initialRgbColor), [initialRgbColor]);
    const [draftHslColor, setDraftHslColor] = useState<ColorFormats.HSL>(initialHsl);

    const onColorSelected = useCallback((selectedColor: ColorFormats.HSL) => {
        setDraftHslColor(selectedColor);
    }, []);

    const onHexInputColorSelected = useCallback((selectedColor: ColorFormats.HSL) => {
        if (isHslColorBlackOrWhite(selectedColor)) {
            setDraftHslColor((prev) => ({
                ...selectedColor,
                h: prev.h,
            }));
        } else {
            setDraftHslColor(selectedColor);
        }
    }, []);

    const isSubmitDisabled = useMemo(
        () => isEqual(initialRgbColor, getRgbFromHslColor(draftHslColor)),
        [initialRgbColor, draftHslColor],
    );

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
                    currentHslColor={initialHsl}
                    draftHslColor={draftHslColor}
                    currentTextLabel={intl.formatMessage({ id: "gs.color-picker.currentColor" })}
                    draftTextLabel={intl.formatMessage({ id: "gs.color-picker.newColor" })}
                />
                <div className="color-picker-buttons-wrapper">
                    <Button
                        value={intl.formatMessage({ id: "gs.color-picker.cancelButton" })}
                        className="gd-button-secondary gd-button color-picker-button"
                        onClick={onCancel}
                    />
                    <Button
                        value={intl.formatMessage({ id: "gs.color-picker.okButton" })}
                        disabled={isSubmitDisabled}
                        className="gd-button-action gd-button color-picker-ok-button"
                        onClick={() => onSubmit(getRgbFromHslColor(draftHslColor))}
                    />
                </div>
            </div>
        </div>
    );
}
