// (C) 2007-2025 GoodData Corporation
import React from "react";
import cx from "classnames";

// This has to be a class because DayPickerInput refs to it internally.
// See https://github.com/gpbl/react-day-picker/issues/748 for more information
export const DateRangePickerInputFieldBody = React.forwardRef<
    {
        invokeInputMethod: (key: "blur" | "focus") => void;
        blur: () => void;
        focus: () => void;
        value: string;
    },
    React.InputHTMLAttributes<HTMLInputElement>
>(function DateRangePickerInputFieldBody(props, ref) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const invokeInputMethod = React.useCallback((key: "blur" | "focus"): void => {
        if (inputRef.current) {
            inputRef.current[key]();
        }
    }, []);

    const blur = React.useCallback((): void => invokeInputMethod("blur"), [invokeInputMethod]);
    const focus = React.useCallback((): void => invokeInputMethod("focus"), [invokeInputMethod]);

    const getValue = React.useCallback((): string => {
        if (inputRef.current) {
            return inputRef.current.value;
        }
        return "";
    }, []);

    React.useImperativeHandle(
        ref,
        () => ({
            invokeInputMethod,
            blur,
            focus,
            get value() {
                return getValue();
            },
        }),
        [invokeInputMethod, blur, focus, getValue],
    );

    const { className } = props;
    return (
        <span className={cx(className)}>
            <span className="gd-icon-calendar" />
            <input {...props} ref={inputRef} className="input-text s-date-range-picker-input-field" />
        </span>
    );
});
