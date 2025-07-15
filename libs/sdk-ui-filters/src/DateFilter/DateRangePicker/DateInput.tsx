// (C) 2025 GoodData Corporation

import React, { useCallback, useState, ChangeEvent, useEffect } from "react";
import cx from "classnames";
import isEmpty from "lodash/isEmpty.js";
import { useId, isEnterKey, isArrowKey } from "@gooddata/sdk-ui-kit";

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
    onChange: (date: Date, shouldSubmitForm?: boolean) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onClick: () => void;
    dateFormat: string;
    isMobile: boolean;
    isTimeEnabled: boolean;
    isDateOrderError?: boolean;
    errorMessageTexts: IDateInputErrorMessageTexts;
    accessibilityConfig: IInputAccessibilityConfig;
    withoutApply?: boolean;
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
    | "value"
    | "dateFormat"
    | "onChange"
    | "onKeyDown"
    | "isDateOrderError"
    | "errorMessageTexts"
    | "withoutApply"
>;

const useDateInput = ({
    value,
    dateFormat,
    onChange,
    onKeyDown,
    isDateOrderError = false,
    errorMessageTexts,
    withoutApply = false,
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

    const onSubmitValue = useCallback(
        (shouldSubmitForm: boolean) => {
            if (isEmpty(inputValue)) {
                setErrorCause("empty");
                onChange(undefined, shouldSubmitForm);
                return;
            }
            const date = parseDate(inputValue, dateFormat);
            if (date === undefined) {
                setErrorCause("invalid");
                onChange(undefined, shouldSubmitForm);
                return;
            }
            setErrorCause(null);
            onChange(date, shouldSubmitForm);
        },
        [dateFormat, inputValue, onChange],
    );

    const onDateInputBlur = useCallback(() => onSubmitValue(false), [onSubmitValue]);

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

    const onDateInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (isEnterKey(e) && !withoutApply) {
                onSubmitValue(true);
            } else if (isArrowKey(e)) {
                e.stopPropagation(); // allow navigation in the input
            } else {
                onKeyDown(e);
            }
        },
        [withoutApply, onSubmitValue, onKeyDown],
    );

    return {
        inputValue,
        errorMessage,
        onDateInputChange,
        onMobileDateChange,
        onDateInputBlur,
        onDateInputKeyDown,
    };
};

export const DateInput = React.forwardRef<HTMLInputElement, IDateInputProps>(
    (
        {
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
            withoutApply,
        },
        ref,
    ) => {
        const {
            inputValue,
            errorMessage,
            onDateInputChange,
            onDateInputKeyDown,
            onMobileDateChange,
            onDateInputBlur,
        } = useDateInput({
            value,
            dateFormat,
            onChange,
            onKeyDown,
            isDateOrderError,
            errorMessageTexts,
            withoutApply,
        });

        const inputLabelId = useId();
        const inputErrorId = useId();

        const ariaProps: React.InputHTMLAttributes<HTMLInputElement> = {
            "aria-label": accessibilityConfig.ariaLabel,
            "aria-labelledby": inputLabelId,
            "aria-describedby": buildAriaDescribedByValue([
                accessibilityConfig.inputHintId,
                errorMessage ? inputErrorId : undefined,
            ]),
            ...(errorMessage ? { "aria-invalid": true } : {}),
        };

        const MobileInput = (
            <DateRangePickerInputFieldBody
                type="date"
                className={cx(
                    "s-date-range-picker-date",
                    "gd-date-range-picker-input",
                    "gd-date-range-picker-input-native",
                    {
                        "gd-date-range-picker-input-error": !!errorMessage,
                        "has-error": !!errorMessage,
                    },
                )}
                onChange={onMobileDateChange}
                value={getPlatformStringFromDate(value)}
                {...ariaProps}
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
                    ref={ref}
                    placeholder={dateFormat}
                    onChange={onDateInputChange}
                    onClick={onClick}
                    onBlur={onDateInputBlur}
                    onKeyDown={onDateInputKeyDown}
                    value={inputValue}
                    className="input-text s-date-range-picker-input-field"
                    {...ariaProps}
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
    },
);

DateInput.displayName = "DateInput";
