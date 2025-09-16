// (C) 2007-2025 GoodData Corporation

/**
 * Copyright (c) 2015 Case Sandberg
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {
    CSSProperties,
    MouseEvent as ReactMouseEvent,
    TouchEvent as ReactTouchEvent,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from "react";

import { ColorFormats } from "tinycolor2";

import { calculateHueChange } from "../utils.js";

export interface IHueColorPickerProps {
    initColor: ColorFormats.HSL;
    onChange: (color: ColorFormats.HSL) => void;
}

export const HueColorPicker = memo(function HueColorPicker({ initColor, onChange }: IHueColorPickerProps) {
    const hueContainer = useRef<HTMLDivElement>(null);

    const pointerStyle = useMemo<CSSProperties>(
        () => ({
            position: "absolute",
            left: `${(initColor.h * 100) / 360}%`,
        }),
        [initColor.h],
    );

    const handleChange = useCallback(
        (e: TouchEvent | MouseEvent): void => {
            const change = calculateHueChange(e, initColor.h, hueContainer.current);
            if (change && onChange) {
                onChange(change);
            }
        },
        [initColor.h, onChange],
    );

    const handleMouseUp = useCallback((): void => {
        window.removeEventListener("mousemove", handleChange);
        window.removeEventListener("mouseup", handleMouseUp);
    }, [handleChange]);

    const bindEventListeners = useCallback((): void => {
        window.addEventListener("mousemove", handleChange);
        window.addEventListener("mouseup", handleMouseUp);
    }, [handleChange, handleMouseUp]);

    const handleTouchChange = useCallback(
        (e: ReactTouchEvent): void => {
            handleChange(e.nativeEvent);
        },
        [handleChange],
    );

    const handleMouseDown = useCallback(
        (e: ReactMouseEvent): void => {
            bindEventListeners();
            handleChange(e.nativeEvent);
        },
        [bindEventListeners, handleChange],
    );

    useEffect(() => {
        return () => {
            window.removeEventListener("mousemove", handleChange);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleChange, handleMouseUp]);

    return (
        <div
            role="hue-picker"
            className="hue-picker hue-horizontal s-hue-picker"
            ref={hueContainer}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchChange}
            onTouchStart={handleTouchChange}
        >
            <div style={pointerStyle}>
                <div className="color-picker-pointer s-color-picker-pointer" />
            </div>
        </div>
    );
});
