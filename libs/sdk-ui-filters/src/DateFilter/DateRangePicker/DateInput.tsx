// (C) 2025-2026 GoodData Corporation

import {
    type ChangeEvent,
    type InputHTMLAttributes,
    type KeyboardEvent,
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import cx from "classnames";

import {
    ValidationContextStore,
    createInvalidDatapoint,
    createInvalidNode,
    useCombineRefs,
    useValidationContextValue,
} from "@gooddata/sdk-ui";
import { isArrowKey, isEnterKey, useId } from "@gooddata/sdk-ui-kit";
import { _isEmpty } from "@gooddata/util";

import { convertPlatformDateStringToDate } from "../utils/DateConversions.js";

import { DateRangePickerInputFieldBody } from "./DateRangePickerInputFieldBody.js";
import { InputErrorMessage } from "./InputErrorMessage.js";
import { type IDateInputErrorMessageTexts, type IInputAccessibilityConfig } from "./types.js";
import { formatDate, getPlatformStringFromDate, isValidDate, parseDate } from "./utils.js";

export interface IDateInputProps {
    value?: Date;
    inputLabel: string;
    onChange: (date: Date | undefined, shouldSubmitForm?: boolean) => void;
    /**
     * Handles keys of the date input and of its calendar button (Escape and Tab close an open calendar).
     */
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
    onClick: () => void;
    dateFormat: string;
    isMobile: boolean;
    isTimeEnabled: boolean;
    isDateOrderError?: boolean;
    errorMessageTexts: IDateInputErrorMessageTexts;
    accessibilityConfig: IInputAccessibilityConfig;
    withoutApply?: boolean;
    /**
     * Opens the calendar and moves focus into it (calendar button or Alt+ArrowDown).
     */
    onCalendarOpen?: (moveFocus: boolean) => void;
    isCalendarOpen?: boolean;
    calendarId?: string;
}

type ErrorCause = "empty" | "invalid" | undefined;

const getErrorMessage = (
    errorCause: ErrorCause | undefined | null,
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
    | "onCalendarOpen"
>;

const useDateInput = ({
    value,
    dateFormat,
    onChange,
    onKeyDown,
    isDateOrderError = false,
    errorMessageTexts,
    withoutApply = false,
    onCalendarOpen,
}: DateInputHookProps) => {
    const [inputValue, setInputValue] = useState<string>(formatDate(value!, dateFormat) ?? "");

    const validationContextValue = useValidationContextValue(createInvalidNode({ id: "DateInput" }));
    const { isValid, setInvalidDatapoints } = validationContextValue;

    const setError = useCallback(
        (error: ErrorCause | null) => {
            const message = getErrorMessage(error, isDateOrderError, errorMessageTexts);

            setInvalidDatapoints(() =>
                message
                    ? [
                          createInvalidDatapoint({
                              message,
                          }),
                      ]
                    : [],
            );
        },
        [errorMessageTexts, isDateOrderError, setInvalidDatapoints],
    );

    useEffect(() => {
        const newValue = formatDate(value!, dateFormat);
        // Only update input value if we have a valid date from parent
        // This preserves invalid user input so they can correct it
        if (newValue !== undefined) {
            setInputValue(newValue);
            setError(null);
        }
    }, [value, dateFormat, setError]);

    const onDateInputChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            setInputValue(newValue);

            const newDate = parseDate(newValue, dateFormat);

            // commit changed value when time is valid but only once, then it is reported again only on blur
            if (isValidDate(newDate) && !isValid) {
                setError(null);
                onChange(newDate);
            }
        },
        [dateFormat, isValid, setError, onChange],
    );

    const onSubmitValue = useCallback(
        (shouldSubmitForm: boolean) => {
            if (_isEmpty(inputValue)) {
                setError("empty");
                onChange(undefined, shouldSubmitForm);
                return;
            }
            const date = parseDate(inputValue, dateFormat);
            if (date === undefined) {
                setError("invalid");
                onChange(undefined, shouldSubmitForm);
                return;
            }
            setError(null);
            onChange(date, shouldSubmitForm);
        },
        [dateFormat, inputValue, onChange, setError],
    );

    const onDateInputBlur = useCallback(() => onSubmitValue(false), [onSubmitValue]);

    const onMobileDateChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            const selectedDate = convertPlatformDateStringToDate(value) ?? undefined;
            const isValid = isValidDate(selectedDate);
            onChange(isValid ? selectedDate : undefined);
            setError(isValid ? null : "empty");
        },
        [onChange, setError],
    );

    const onDateInputKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (isEnterKey(e) && !withoutApply) {
                onSubmitValue(true);
            } else if (e.altKey && e.key === "ArrowDown" && onCalendarOpen) {
                e.preventDefault();
                e.stopPropagation();
                onSubmitValue(false); // commit the typed date so that the calendar focuses it
                onCalendarOpen(true);
            } else if (isArrowKey(e)) {
                e.stopPropagation(); // allow navigation in the input
            } else {
                onKeyDown(e);
            }
        },
        [withoutApply, onSubmitValue, onKeyDown, onCalendarOpen],
    );

    return {
        inputValue,
        onDateInputChange,
        onMobileDateChange,
        onDateInputBlur,
        onDateInputKeyDown,
        validationContextValue,
    };
};

export const DateInput = forwardRef<HTMLInputElement, IDateInputProps>(
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
            onCalendarOpen,
            isCalendarOpen = false,
            calendarId,
        },
        ref,
    ) => {
        const {
            inputValue,
            validationContextValue,
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
            onCalendarOpen,
        });

        const inputLabelId = useId();
        const inputRef = useRef<HTMLInputElement | null>(null);
        const combinedInputRef = useCombineRefs<HTMLInputElement | null>(inputRef, ref);

        const { isValid, getInvalidDatapoints } = validationContextValue;
        const invalidDatapoint = getInvalidDatapoints()[0];
        const inputErrorId = invalidDatapoint?.id ?? "";

        const ariaProps: InputHTMLAttributes<HTMLInputElement> = {
            "aria-label": accessibilityConfig.ariaLabel,
            "aria-labelledby": inputLabelId,
            "aria-describedby": isValid ? accessibilityConfig.inputHintId : inputErrorId,
            ...(isValid ? {} : { "aria-invalid": true }),
        };

        const MobileInput = (
            <DateRangePickerInputFieldBody
                type="date"
                className={cx(
                    "s-date-range-picker-date",
                    "gd-date-range-picker-input",
                    "gd-date-range-picker-input-native",
                    {
                        "gd-date-range-picker-input-error": !isValid,
                        "has-error": !isValid,
                    },
                )}
                onChange={onMobileDateChange}
                value={getPlatformStringFromDate(value!)}
                {...ariaProps}
            />
        );

        const DesktopInput = (
            <div
                className={cx("gd-date-range-picker-input", {
                    "gd-date-range-picker-input-error": !isValid,
                    "has-error": !isValid,
                })}
            >
                <span className="gd-icon-calendar" aria-hidden="true" />
                {/* the calendar button is a transparent overlay of the icon, so the icon renders as before */}
                <input
                    ref={combinedInputRef}
                    placeholder={dateFormat}
                    onChange={onDateInputChange}
                    onClick={onClick}
                    onBlur={onDateInputBlur}
                    onKeyDown={onDateInputKeyDown}
                    value={inputValue}
                    className="input-text s-date-range-picker-input-field"
                    {...ariaProps}
                />
                {onCalendarOpen ? (
                    <button
                        type="button"
                        className="gd-date-range-picker-input-calendar-button s-date-range-picker-calendar-button"
                        aria-label={accessibilityConfig.calendarButtonAriaLabel}
                        aria-haspopup="dialog"
                        aria-expanded={isCalendarOpen}
                        aria-controls={isCalendarOpen ? calendarId : undefined}
                        // like the input, Escape and Tab close only the open calendar, not the date filter
                        onKeyDown={onKeyDown}
                        // a mouse press on the icon keeps focus in the input, as before the button existed
                        onMouseDown={(e) => e.preventDefault()}
                        // move focus into the calendar only when activated by keyboard (detail is 0),
                        // mouse users keep the same behaviour as when clicking the input
                        onClick={(e) => {
                            if (e.detail !== 0) {
                                inputRef.current?.focus();
                            }
                            onCalendarOpen(e.detail === 0);
                        }}
                    />
                ) : null}
            </div>
        );

        return (
            <ValidationContextStore value={validationContextValue}>
                <div
                    className={cx("gd-date-range-column", {
                        "gd-date-range-column--with-time": isTimeEnabled,
                    })}
                >
                    <label id={inputLabelId}>{inputLabel}</label>
                    {isMobile ? MobileInput : DesktopInput}
                    <InputErrorMessage descriptionId={inputErrorId} errorText={invalidDatapoint?.message} />
                </div>
            </ValidationContextStore>
        );
    },
);

DateInput.displayName = "DateInput";
