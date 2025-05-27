// (C) 2025 GoodData Corporation

import React, { useCallback, useState, ChangeEvent, useEffect } from "react";
import cx from "classnames";
import isEmpty from "lodash/isEmpty.js";
import { useId } from "@gooddata/sdk-ui-kit";

import { convertPlatformDateStringToDate } from "../utils/DateConversions.js";

import { DateRangePickerInputFieldBody } from "./DateRangePickerInputFieldBody.js";
import {
    buildAriaDescribedByValue,
    parseDate,
    formatDate,
    isValidDate,
    getPlatformStringFromDate,
} from "./utils.js";
import { InputErrorMessage } from "./InputErrorMessage.js";
import { IInputAccessibilityConfig, IDateInputErrorMessageTexts } from "./types.js";

export interface IDateInputProps {
    value: Date;
    inputLabel: string;
    onChange: (date: Date) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onClick: () => void;
    dateFormat: string;
    isMobile: boolean;
    isTimeEnabled: boolean;
    isDateOrderError?: boolean;
    errorMessageTexts: IDateInputErrorMessageTexts;
    accessibilityConfig: IInputAccessibilityConfig;
}

type ErrorCause = "empty" | "invalid" | undefined;

const getErrorMessage = (
    errorCause: ErrorCause,
    isDateOrderError: boolean,
    messages: IDateInputErrorMessageTexts,
) => {
    if (errorCause === "empty") {
        return messages.emptyDate;
    } else if (errorCause === "invalid") {
        return messages.invalidDate;
    } else if (isDateOrderError) {
        return messages.startDateAfterEndDate;
    }
    return undefined;
};

type DateInputHookProps = Pick<
    IDateInputProps,
    "value" | "dateFormat" | "onChange" | "isDateOrderError" | "errorMessageTexts"
>;

const useDateInput = ({
    value,
    dateFormat,
    onChange,
    isDateOrderError = false,
    errorMessageTexts,
}: DateInputHookProps) => {
    const [inputValue, setInputValue] = useState<string>(formatDate(value, dateFormat));
    const [errorCause, setErrorCause] = useState<ErrorCause>(undefined);

    const hasError = errorCause !== undefined || isDateOrderError;
    const errorMessage = getErrorMessage(errorCause, isDateOrderError, errorMessageTexts);

    useEffect(() => {
        const newValue = formatDate(value, dateFormat);
        setInputValue(newValue);
        if (newValue !== undefined) {
            setErrorCause(undefined);
        }
    }, [value, dateFormat]);

    const onDateInputChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            setInputValue(newValue);

            const newDate = parseDate(newValue, dateFormat);

            // commit changed value when time is valid but only once, then it is reported again only on blur
            if (isValidDate(newDate) && hasError) {
                setErrorCause(undefined);
                onChange(newDate);
            }
        },
        [dateFormat, onChange, hasError],
    );

    const onDateInputBlur = useCallback(() => {
        // Report value only when it changed, i.e., user typed a new value.
        // Do not report the same value when user just focused field by click to open calendar popup
        // and then selected value which caused blur event and call of this handler.
        const previousValue = formatDate(value, dateFormat);
        if (previousValue === inputValue) {
            return;
        }
        if (isEmpty(inputValue)) {
            setErrorCause("empty");
            onChange(undefined);
            return;
        }
        const date = parseDate(inputValue, dateFormat);
        if (date === undefined) {
            setErrorCause("invalid");
            onChange(undefined);
            return;
        }
        setErrorCause(null);
        onChange(date);
    }, [dateFormat, inputValue, onChange, value]);

    const onMobileDateChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            const selectedDate = convertPlatformDateStringToDate(value);
            const isValid = isValidDate(selectedDate);
            onChange(isValid ? selectedDate : undefined);
            setErrorCause(isValid ? undefined : "empty");
        },
        [onChange],
    );

    return {
        inputValue,
        errorMessage,
        onDateInputChange,
        onMobileDateChange,
        onDateInputBlur,
    };
};

export const DateInput = React.forwardRef<HTMLInputElement, IDateInputProps>((props, ref) => {
    const {
        value,
        inputLabel,
        onKeyDown,
        onClick,
        onChange,
        dateFormat,
        accessibilityConfig,
        isMobile,
        isTimeEnabled,
        isDateOrderError,
        errorMessageTexts,
    } = props;

    const { inputValue, errorMessage, onDateInputChange, onMobileDateChange, onDateInputBlur } = useDateInput(
        {
            value,
            dateFormat,
            onChange,
            isDateOrderError,
            errorMessageTexts,
        },
    );

    const inputLabelId = useId();
    const inputErrorId = useId();

    const MobileInput = (
        <DateRangePickerInputFieldBody
            type="date"
            className={cx(
                "s-date-range-picker-date",
                "gd-date-range-picker-input",
                "gd-date-range-picker-input-native",
                {
                    "gd-date-range-picker-input-error": errorMessage,
                    "has-error": errorMessage,
                },
            )}
            onChange={onMobileDateChange}
            value={getPlatformStringFromDate(value)}
        />
    );

    const DesktopInput = (
        <div
            className={cx("gd-date-range-picker-input", {
                "gd-date-range-picker-input-error": !!errorMessage,
                "has-error": !!errorMessage,
            })}
        >
            <span className="gd-icon-calendar" />
            <input
                onKeyDown={onKeyDown}
                ref={ref}
                aria-label={accessibilityConfig.ariaLabel}
                placeholder={dateFormat}
                onChange={onDateInputChange}
                onClick={onClick}
                onBlur={onDateInputBlur}
                value={inputValue}
                className="input-text s-date-range-picker-input-field"
                aria-labelledby={inputLabelId}
                aria-describedby={buildAriaDescribedByValue([
                    accessibilityConfig.inputHintId,
                    errorMessage ? inputErrorId : undefined,
                ])}
                {...(errorMessage ? { "aria-invalid": true } : {})}
            />
        </div>
    );

    return (
        <div className={cx("gd-date-range-column", { "gd-date-range-column--with-time": isTimeEnabled })}>
            <label id={inputLabelId}>{inputLabel}</label>
            {isMobile ? MobileInput : DesktopInput}
            <InputErrorMessage descriptionId={inputErrorId} errorText={errorMessage} />
        </div>
    );
});

DateInput.displayName = "DateInput";
