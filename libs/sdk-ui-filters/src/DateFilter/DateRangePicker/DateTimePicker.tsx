// (C) 2022-2026 GoodData Corporation

import { type AriaAttributes, type KeyboardEvent, forwardRef, useMemo } from "react";

import cx from "classnames";

import { DateInput } from "./DateInput.js";
import { TimeInput } from "./TimeInput.js";
import { type IDateTimePickerErrors, type IInputErrorMessageTexts, type ITime } from "./types.js";

export interface IDateTimePickerAccessibilityConfig {
    dateAriaLabel?: AriaAttributes["aria-label"];
    timeAriaLabel?: AriaAttributes["aria-label"];
    dateInputHintId?: string;
    timeInputHintId?: string;
    calendarButtonAriaLabel?: AriaAttributes["aria-label"];
}

interface IDateTimePickerProps {
    date?: Date;
    time?: ITime;
    dateInputLabel: string;
    timeInputLabel: string;
    dateTimeLegendLabel: string;
    onDateChange: (date: Date | undefined, shouldSubmitForm?: boolean) => void;
    onTimeChange: (time: ITime | undefined, shouldSubmitForm?: boolean) => void;
    onDayClick: () => void;
    onDateInputKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
    dateFormat?: string;
    isMobile: boolean;
    isTimeEnabled: boolean;
    isSecondsEnabled?: boolean;
    className: string;
    defaultTime?: string;
    accessibilityConfig: IDateTimePickerAccessibilityConfig;
    inputErrorMessageTexts: IInputErrorMessageTexts;
    errors?: IDateTimePickerErrors;
    withoutApply?: boolean;
    onCalendarOpen?: (moveFocus: boolean) => void;
    isCalendarOpen?: boolean;
    calendarId?: string;
}

export const DateTimePicker = forwardRef<HTMLInputElement, IDateTimePickerProps>(
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
            isSecondsEnabled,
            className,
            accessibilityConfig,
            inputErrorMessageTexts,
            errors,
            withoutApply,
            onCalendarOpen,
            isCalendarOpen,
            calendarId,
        }: IDateTimePickerProps,
        ref,
    ) => {
        const { dateAriaLabel, timeAriaLabel, dateInputHintId, timeInputHintId, calendarButtonAriaLabel } =
            accessibilityConfig;

        const dateInputAccessibilityConfig = useMemo(
            () => ({
                ariaLabel: dateAriaLabel,
                inputHintId: dateInputHintId,
                calendarButtonAriaLabel,
            }),
            [dateAriaLabel, dateInputHintId, calendarButtonAriaLabel],
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
                        dateFormat={dateFormat!}
                        accessibilityConfig={dateInputAccessibilityConfig}
                        errorMessageTexts={inputErrorMessageTexts.dateInput}
                        isDateOrderError={errors?.isDateOrderError}
                        isMobile={isMobile}
                        isTimeEnabled={isTimeEnabled}
                        withoutApply={withoutApply}
                        onCalendarOpen={onCalendarOpen}
                        isCalendarOpen={isCalendarOpen}
                        calendarId={calendarId}
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
                            withSeconds={isSecondsEnabled}
                        />
                    ) : null}
                </fieldset>
            </div>
        );
    },
);

DateTimePicker.displayName = "DateTimePicker";
