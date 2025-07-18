// (C) 2007-2025 GoodData Corporation
import { forwardRef, InputHTMLAttributes, useCallback, useImperativeHandle, useRef } from "react";
import cx from "classnames";

// This has to be a class because DayPickerInput refs to it internally.
// See https://github.com/gpbl/react-day-picker/issues/748 for more information
export const DateRangePickerInputFieldBody = forwardRef<
    {
        invokeInputMethod: (key: "blur" | "focus") => void;
        blur: () => void;
        focus: () => void;
        value: string;
    },
    InputHTMLAttributes<HTMLInputElement>
>(function DateRangePickerInputFieldBody(props, ref) {
    const inputRef = useRef<HTMLInputElement>(null);

    const invokeInputMethod = useCallback((key: "blur" | "focus"): void => {
        if (inputRef.current) {
            inputRef.current[key]();
        }
    }, []);

    const blur = useCallback((): void => invokeInputMethod("blur"), [invokeInputMethod]);
    const focus = useCallback((): void => invokeInputMethod("focus"), [invokeInputMethod]);

    const getValue = useCallback((): string => {
        if (inputRef.current) {
            return inputRef.current.value;
        }
        return "";
    }, []);

    useImperativeHandle(
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
