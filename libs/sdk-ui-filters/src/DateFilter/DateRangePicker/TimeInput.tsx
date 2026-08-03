// (C) 2025-2026 GoodData Corporation

import { type ChangeEvent, type KeyboardEvent, useCallback, useEffect, useState } from "react";

import cx from "classnames";
import moment, { type Moment } from "moment/moment.js";

import { isArrowKey, isEnterKey, useId } from "@gooddata/sdk-ui-kit";

import { TIME_FORMAT, TIME_FORMAT_WITH_SECONDS } from "../constants/Platform.js";

import { InputErrorMessage } from "./InputErrorMessage.js";
import { type IInputAccessibilityConfig, type ITime } from "./types.js";

export interface ITimeInputProps {
    value?: ITime;
    inputLabel: string;
    onChange: (time: ITime | undefined, shouldSubmitForm?: boolean) => void;
    accessibilityConfig: IInputAccessibilityConfig;
    errorText?: string;
    isMobile: boolean;
    withoutApply?: boolean;
    withSeconds?: boolean;
}

const padTo2Digits = (num: number) => String(num).padStart(2, "0");

const stringifyTime = (time: ITime | undefined, withSeconds: boolean) => {
    if (time === undefined) {
        return undefined;
    }
    const base = `${padTo2Digits(time.hours!)}:${padTo2Digits(time.minutes!)}`;
    return withSeconds ? `${base}:${padTo2Digits(time.seconds ?? 0)}` : base;
};

const asTime = (time: Moment | undefined, withSeconds: boolean): ITime | undefined =>
    time?.isValid()
        ? {
              hours: time.hours(),
              minutes: time.minutes(),
              ...(withSeconds ? { seconds: time.seconds() } : {}),
          }
        : undefined;

export function TimeInput({
    value,
    inputLabel,
    onChange,
    accessibilityConfig,
    errorText,
    isMobile,
    withoutApply,
    withSeconds = false,
}: ITimeInputProps) {
    const timeFormat = withSeconds ? TIME_FORMAT_WITH_SECONDS : TIME_FORMAT;
    const formattedValue = stringifyTime(value, withSeconds);
    const [stringValue, setStringValue] = useState<string>(formattedValue ?? "");

    // Keep the field in sync when the incoming value or the time format (minute vs. second precision) changes
    // while the input stays mounted — e.g. seconds availability flips after switching the date dataset in an
    // open filter. Keyed on the formatted string (a primitive) so it only fires on real content/format changes.
    useEffect(() => {
        setStringValue(formattedValue ?? "");
    }, [formattedValue]);

    const inputLabelId = useId();
    const inputErrorId = useId();

    const hasError = errorText !== undefined;

    const onInputChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            setStringValue(newValue);

            const time = moment(newValue, timeFormat);

            // commit changed value when time is valid but only once, then it is reported again only on blur,
            // in mobile view the value is reported as you type
            if ((time.isValid() && hasError) || isMobile) {
                onChange(asTime(time, withSeconds));
            }
        },
        [onChange, hasError, isMobile, timeFormat, withSeconds],
    );

    const onSubmit = useCallback(
        (shouldSubmitForm: boolean) => {
            const time = moment(stringValue, timeFormat);
            onChange(asTime(time, withSeconds), shouldSubmitForm);
        },
        [onChange, stringValue, timeFormat, withSeconds],
    );

    // report changed value when focus is removed from the field
    const onTimeInputBlur = useCallback(() => onSubmit(false), [onSubmit]);

    const onTimeInputKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (isEnterKey(e) && !withoutApply) {
                onSubmit(true);
            } else if (isArrowKey(e)) {
                e.stopPropagation(); // allow navigation in the input
            }
        },
        [withoutApply, onSubmit],
    );

    return (
        <div className="gd-date-range-column gd-date-range-column--with-time">
            <label id={inputLabelId}>{inputLabel}</label>
            <span
                className={cx(
                    "gd-date-range-picker-input",
                    "gd-date-range-picker-input-time",
                    "s-date-range-picker-input-time",
                    {
                        "gd-date-range-picker-input-error": !!errorText,
                        "has-error": !!errorText,
                    },
                )}
            >
                <span className="gd-icon-clock" aria-hidden="true" />
                <input
                    type="time"
                    className="input-text"
                    aria-label={accessibilityConfig.ariaLabel}
                    onChange={onInputChange}
                    onBlur={onTimeInputBlur}
                    onKeyDown={onTimeInputKeyDown}
                    value={stringValue}
                    {...(withSeconds ? { step: 1 } : {})}
                    aria-labelledby={inputLabelId}
                    aria-describedby={errorText ? inputErrorId : accessibilityConfig.inputHintId}
                    {...(errorText ? { "aria-invalid": true } : {})}
                />
            </span>
            <InputErrorMessage descriptionId={inputErrorId} errorText={errorText} />
        </div>
    );
}
