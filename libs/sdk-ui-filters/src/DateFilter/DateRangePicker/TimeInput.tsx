// (C) 2025 GoodData Corporation

import React, { ChangeEvent, useCallback, useState } from "react";

import cx from "classnames";
import moment, { Moment } from "moment/moment.js";

import { isArrowKey, isEnterKey, useId } from "@gooddata/sdk-ui-kit";

import { InputErrorMessage } from "./InputErrorMessage.js";
import { IInputAccessibilityConfig, ITime } from "./types.js";
import { TIME_FORMAT } from "../constants/Platform.js";

export interface ITimeInputProps {
    value: ITime;
    inputLabel: string;
    onChange: (time: ITime, shouldSubmitForm?: boolean) => void;
    accessibilityConfig: IInputAccessibilityConfig;
    errorText?: string;
    isMobile: boolean;
    withoutApply?: boolean;
}

const padTo2Digits = (num: number) => String(num).padStart(2, "0");

const stringifyTime = (time: ITime) =>
    time === undefined ? undefined : `${padTo2Digits(time.hours)}:${padTo2Digits(time.minutes)}`;

const asTime = (time: Moment | undefined): ITime =>
    time?.isValid() ? { hours: time.hours(), minutes: time.minutes() } : undefined;

export const TimeInput: React.FC<ITimeInputProps> = ({
    value,
    inputLabel,
    onChange,
    accessibilityConfig,
    errorText,
    isMobile,
    withoutApply,
}) => {
    const [stringValue, setStringValue] = useState<string>(stringifyTime(value));

    const inputLabelId = useId();
    const inputErrorId = useId();

    const hasError = errorText !== undefined;

    const onInputChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            setStringValue(newValue);

            const time = moment(newValue, TIME_FORMAT);

            // commit changed value when time is valid but only once, then it is reported again only on blur,
            // in mobile view the value is reported as you type
            if ((time.isValid() && hasError) || isMobile) {
                onChange(asTime(time));
            }
        },
        [onChange, hasError, isMobile],
    );

    const onSubmit = useCallback(
        (shouldSubmitForm: boolean) => {
            const time = moment(stringValue, TIME_FORMAT);
            onChange(asTime(time), shouldSubmitForm);
        },
        [onChange, stringValue],
    );

    // report changed value when focus is removed from the field
    const onTimeInputBlur = useCallback(() => onSubmit(false), [onSubmit]);

    const onTimeInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
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
                <span className="gd-icon-clock" />
                <input
                    type="time"
                    className="input-text"
                    aria-label={accessibilityConfig.ariaLabel}
                    onChange={onInputChange}
                    onBlur={onTimeInputBlur}
                    onKeyDown={onTimeInputKeyDown}
                    value={stringValue}
                    aria-labelledby={inputLabelId}
                    aria-describedby={errorText ? inputErrorId : accessibilityConfig.inputHintId}
                    {...(errorText ? { "aria-invalid": true } : {})}
                />
            </span>
            <InputErrorMessage descriptionId={inputErrorId} errorText={errorText} />
        </div>
    );
};
