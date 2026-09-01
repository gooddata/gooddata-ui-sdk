// (C) 2007-2026 GoodData Corporation

import { useState } from "react";

import { useIntl } from "react-intl";

import { UiButton } from "../UiButton/UiButton.js";

import {
    type ColorNotation,
    type IColorPickerValue,
    areColorPickerValuesEqual,
    colorPickerValueFromRgb,
    colorPickerValueToRgba,
    formatColorPickerValue,
} from "./colorValue.js";
import { UiColorSlider } from "./components/UiColorSlider.js";
import { UiColorValueField } from "./components/UiColorValueField.js";
import { UiColorWheel } from "./components/UiColorWheel.js";
import { type IUiColorPickerProps } from "./types.js";

function hslTrack(value: IColorPickerValue, lightness: number): string {
    return `hsl(${Math.round(value.h)}, ${Math.round(value.s * 100)}%, ${Math.round(lightness * 100)}%)`;
}

/**
 * @internal
 */
export function UiColorPicker(props: IUiColorPickerProps) {
    const { initialRgbColor, supportsAlpha = false, onChange, onSubmit } = props;
    const intl = useIntl();
    // Without a control to change it, an opacity would be one the caller cannot see and its consumer
    // drops on the way out, so it is not carried at all.
    const opaque = (color: IColorPickerValue): IColorPickerValue =>
        supportsAlpha ? color : { ...color, alpha: 1 };

    const initial = opaque(colorPickerValueFromRgb(initialRgbColor));
    const given = formatColorPickerValue(initial, "rgb");
    const [notation, setNotation] = useState<ColorNotation>("hex");

    // A color set from outside is followed - see IUiColorPickerBaseProps.initialRgbColor. The color
    // and the one it was read from are held together so a change of one cannot be read against the
    // other, and compared as text because the prop is a fresh object every render.
    const [picked, setPicked] = useState<{ value: IColorPickerValue; given: string }>({
        value: initial,
        given,
    });
    if (picked.given !== given) {
        setPicked({ value: initial, given });
    }
    const value = picked.value;

    const change = (next: IColorPickerValue) => {
        const kept = opaque(next);
        setPicked({ value: kept, given });
        onChange?.(colorPickerValueToRgba(kept));
    };

    const solid = hslTrack(value, value.l);
    const current = formatColorPickerValue(value, "hsl");

    return (
        <div className="gd-ui-kit-color-picker" aria-label="Color picker">
            <UiColorWheel
                value={value}
                onChange={change}
                label={intl.formatMessage({ id: "gs.ui-color-picker.wheel" })}
            />
            <UiColorSlider
                label={intl.formatMessage({ id: "gs.ui-color-picker.lightness" })}
                value={value.l}
                onChange={(l) => change({ ...value, l })}
                trackStyle={{
                    background: `linear-gradient(to right, ${hslTrack(value, 0)}, ${hslTrack(value, 0.5)}, ${hslTrack(value, 1)})`,
                }}
                thumbColor={solid}
                valueText={current}
            />
            {supportsAlpha ? (
                <UiColorSlider
                    label={intl.formatMessage({ id: "gs.ui-color-picker.opacity" })}
                    value={value.alpha}
                    onChange={(alpha) => change({ ...value, alpha })}
                    trackStyle={{ background: `linear-gradient(to right, transparent, ${solid})` }}
                    thumbColor={current}
                    valueText={`${Math.round(value.alpha * 100)}%`}
                />
            ) : null}
            <UiColorValueField
                value={value}
                onChange={change}
                notation={notation}
                onNotationChange={setNotation}
                label={intl.formatMessage({ id: "gs.ui-color-picker.value" })}
                notationLabel={intl.formatMessage({ id: "gs.ui-color-picker.notation" })}
            />
            {onSubmit ? (
                <div className="gd-ui-kit-color-picker__actions">
                    <UiButton
                        variant="secondary"
                        label={intl.formatMessage({ id: "gs.ui-color-picker.cancelButton" })}
                        onClick={props.onCancel}
                    />
                    <UiButton
                        variant="primary"
                        label={intl.formatMessage({ id: "gs.ui-color-picker.okButton" })}
                        isDisabled={areColorPickerValuesEqual(initial, value)}
                        onClick={() => onSubmit(colorPickerValueToRgba(value))}
                    />
                </div>
            ) : null}
        </div>
    );
}
