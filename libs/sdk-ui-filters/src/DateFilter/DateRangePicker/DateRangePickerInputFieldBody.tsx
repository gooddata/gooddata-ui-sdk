// (C) 2007-2026 GoodData Corporation

import { type InputHTMLAttributes, forwardRef, useImperativeHandle, useRef } from "react";

import cx from "classnames";

/**
 * Imperative API exposed on the DateRangePickerInputFieldBody ref.
 *
 * DayPickerInput refs to this component internally and calls these methods.
 * See https://github.com/gpbl/react-day-picker/issues/748 for more information
 */
export interface IDateRangePickerInputFieldBody {
    invokeInputMethod: (key: "blur" | "focus") => void;
    blur: () => void;
    focus: () => void;
    readonly value: string;
}

export const DateRangePickerInputFieldBody = forwardRef<
    IDateRangePickerInputFieldBody,
    InputHTMLAttributes<HTMLInputElement>
>(function DateRangePickerInputFieldBody(props, ref) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => {
        const invokeInputMethod = (key: "blur" | "focus"): void => {
            inputRef.current?.[key]();
        };

        return {
            invokeInputMethod,
            blur: () => invokeInputMethod("blur"),
            focus: () => invokeInputMethod("focus"),
            get value(): string {
                return inputRef.current?.value ?? "";
            },
        };
    }, []);

    const { className } = props;
    return (
        <span className={cx(className)}>
            <span className="gd-icon-calendar" aria-hidden="true" />
            <input {...props} ref={inputRef} className="input-text s-date-range-picker-input-field" />
        </span>
    );
});
