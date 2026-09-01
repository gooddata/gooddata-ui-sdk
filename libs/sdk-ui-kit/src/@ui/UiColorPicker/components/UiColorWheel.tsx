// (C) 2026 GoodData Corporation

import { type KeyboardEvent } from "react";

import { usePointerTrack } from "../../hooks/usePointerTrack.js";
import {
    type IColorPickerValue,
    colorPickerValueFromWheel,
    colorPickerValueToWheel,
    formatColorPickerValue,
} from "../colorValue.js";

const HUE_KEY_STEP = 2;
const SATURATION_KEY_STEP = 0.02;

interface IColorWheelProps {
    value: IColorPickerValue;
    onChange: (value: IColorPickerValue) => void;
    label: string;
}

// Hue is the angle and saturation the distance from the middle; see `.gd-ui-kit-color-picker__wheel` for how the
// paint is held to the same convention.

export function UiColorWheel({ value, onChange, label }: IColorWheelProps) {
    const track = usePointerTrack((event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const radius = rect.width / 2;
        onChange(
            colorPickerValueFromWheel(
                {
                    x: (event.clientX - rect.left - radius) / radius,
                    y: (event.clientY - rect.top - radius) / radius,
                },
                value,
            ),
        );
    });

    const step = (hue: number, saturation: number) =>
        onChange({
            ...value,
            h: (value.h + hue + 360) % 360,
            s: Math.min(1, Math.max(0, value.s + saturation)),
        });

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const moves: Record<string, () => void> = {
            ArrowLeft: () => step(-HUE_KEY_STEP, 0),
            ArrowRight: () => step(HUE_KEY_STEP, 0),
            ArrowUp: () => step(0, SATURATION_KEY_STEP),
            ArrowDown: () => step(0, -SATURATION_KEY_STEP),
            Home: () => onChange({ ...value, s: 0 }),
            End: () => onChange({ ...value, s: 1 }),
        };
        const move = moves[event.key];
        if (move) {
            event.preventDefault();
            move();
        }
    };

    const point = colorPickerValueToWheel(value);

    return (
        <div
            className="gd-ui-kit-color-picker__wheel"
            role="slider"
            tabIndex={0}
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(value.h)}
            aria-valuetext={formatColorPickerValue(value, "hsl")}
            onKeyDown={onKeyDown}
            {...track}
        >
            <div
                className="gd-ui-kit-color-picker__wheel-thumb"
                style={{
                    left: `${((point.x + 1) / 2) * 100}%`,
                    top: `${((point.y + 1) / 2) * 100}%`,
                    backgroundColor: formatColorPickerValue(value, "hsl"),
                }}
            />
        </div>
    );
}
