// (C) 2022-2025 GoodData Corporation

import { AriaAttributes, KeyboardEvent, forwardRef, useMemo } from "react";

import cx from "classnames";

import { DateInput } from "./DateInput.js";
import { TimeInput } from "./TimeInput.js";
import { IDateTimePickerErrors, ITime, InputErrorMessageTexts } from "./types.js";

export interface IDateTimePickerAccessibilityConfig {
    dateAriaLabel?: AriaAttributes["aria-label"];
    timeAriaLabel?: AriaAttributes["aria-label"];
    dateInputHintId?: string;
    timeInputHintId?: string;
}

interface DateTimePickerProps {
    date: Date;
    time: ITime;
    dateInputLabel: string;
    timeInputLabel: string;
    dateTimeLegendLabel: string;
    onDateChange: (date: Date | undefined, shouldSubmitForm?: boolean) => void;
    onTimeChange: (time: ITime | undefined, shouldSubmitForm?: boolean) => void;
    onDayClick: () => void;
    onDateInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    dateFormat: string;
    isMobile: boolean;
    isTimeEnabled: boolean;
    className: string;
    defaultTime?: string;
    accessibilityConfig: IDateTimePickerAccessibilityConfig;
    inputErrorMessageTexts: InputErrorMessageTexts;
    errors?: IDateTimePickerErrors;
    withoutApply?: boolean;
}

export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
    (
        {
            date,
            time,
            dateInputLabel,
            timeInputLabel,
            dateTimeLegendLabel,
            onDateChange,
            onTimeChange,
            onDayClick,
            onDateInputKeyDown,
            dateFormat,
            isMobile,
            isTimeEnabled,
            className,
            accessibilityConfig,
            inputErrorMessageTexts,
            errors,
            withoutApply,
        }: DateTimePickerProps,
        ref,
    ) => {
        const { dateAriaLabel, timeAriaLabel, dateInputHintId, timeInputHintId } = accessibilityConfig;

        const dateInputAccessibilityConfig = useMemo(
            () => ({
                ariaLabel: dateAriaLabel,
                inputHintId: dateInputHintId,
            }),
            [dateAriaLabel, dateInputHintId],
        );
        const timeInputAccessibilityConfig = useMemo(
            () => ({
                ariaLabel: timeAriaLabel,
                inputHintId: timeInputHintId,
            }),
            [timeAriaLabel, timeInputHintId],
        );
        const timeInputErrorText = errors?.isTimeOrderError
            ? inputErrorMessageTexts.timeInput.startTimeAfterEndTime
            : undefined;
        return (
            <div className={cx(className, { "gd-date-range-row": isTimeEnabled })}>
                <fieldset>
                    <legend className="sr-only">
                        {isTimeEnabled ? dateTimeLegendLabel : dateInputLabel}
                    </legend>
                    <DateInput
                        ref={ref}
                        value={date}
                        inputLabel={dateInputLabel}
                        onChange={onDateChange}
                        onKeyDown={onDateInputKeyDown}
                        onClick={onDayClick}
                        dateFormat={dateFormat}
                        accessibilityConfig={dateInputAccessibilityConfig}
                        errorMessageTexts={inputErrorMessageTexts.dateInput}
                        isDateOrderError={errors?.isDateOrderError}
                        isMobile={isMobile}
                        isTimeEnabled={isTimeEnabled}
                        withoutApply={withoutApply}
                    />
                    {isTimeEnabled ? (
                        <TimeInput
                            value={time}
                            inputLabel={timeInputLabel}
                            onChange={onTimeChange}
                            accessibilityConfig={timeInputAccessibilityConfig}
                            errorText={timeInputErrorText}
                            isMobile={isMobile}
                            withoutApply={withoutApply}
                        />
                    ) : null}
                </fieldset>
            </div>
        );
    },
);

DateTimePicker.displayName = "DateTimePicker";
