// (C) 2026 GoodData Corporation

import { type CSSProperties, type KeyboardEvent } from "react";

import { usePointerTrack } from "../../hooks/usePointerTrack.js";

const KEY_STEP = 0.02;

interface IColorSliderProps {
    label: string;

    /**
     * Position along the track, from 0 at the left to 1 at the right.
     */
    value: number;

    onChange: (value: number) => void;

    trackStyle: CSSProperties;

    thumbColor: string;

    /**
     * The value as it should be read out: the fraction on its own says nothing about which channel
     * this is.
     */
    valueText: string;
}

export function UiColorSlider({
    label,
    value,
    onChange,
    trackStyle,
    thumbColor,
    valueText,
}: IColorSliderProps) {
    const track = usePointerTrack((event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const position = (event.clientX - rect.left) / rect.width;
        onChange(Math.min(1, Math.max(0, position)));
    });

    const step = (delta: number) => onChange(Math.min(1, Math.max(0, value + delta)));

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const moves: Record<string, () => void> = {
            ArrowLeft: () => step(-KEY_STEP),
            ArrowDown: () => step(-KEY_STEP),
            ArrowRight: () => step(KEY_STEP),
            ArrowUp: () => step(KEY_STEP),
            Home: () => onChange(0),
            End: () => onChange(1),
        };
        const move = moves[event.key];
        if (move) {
            event.preventDefault();
            move();
        }
    };

    return (
        <div
            className="gd-ui-kit-color-picker__slider"
            role="slider"
            tabIndex={0}
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(value * 100)}
            aria-valuetext={valueText}
            onKeyDown={onKeyDown}
            {...track}
        >
            <div className="gd-ui-kit-color-picker__slider-track" style={trackStyle} />
            <div
                className="gd-ui-kit-color-picker__slider-thumb"
                // The stylesheet turns the fraction into a position, so the handle's own size is
                // accounted for in the one place that states it.
                style={
                    {
                        "--color-picker-slider-position": value,
                        backgroundColor: thumbColor,
                    } as CSSProperties
                }
            />
        </div>
    );
}
