// (C) 2022-2025 GoodData Corporation
import React, { useMemo } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";

import { TimeInput } from "./TimeInput.js";
import { DateInput } from "./DateInput.js";
import { InputErrorMessageTexts, IDateTimePickerErrors, ITime } from "./types.js";

export interface IDateTimePickerAccessibilityConfig {
    dateAriaLabel?: React.AriaAttributes["aria-label"];
    timeAriaLabel?: React.AriaAttributes["aria-label"];
    dateInputHintId?: string;
    timeInputHintId?: string;
}

interface IDateTimePickerOwnProps {
    date: Date;
    time: ITime;
    dateInputLabel: string;
    timeInputLabel: string;
    onDateChange: (date: Date | undefined, shouldSubmitForm?: boolean) => void;
    onTimeChange: (time: ITime | undefined, shouldSubmitForm?: boolean) => void;
    onDayClick: () => void;
    onDateInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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

export type DateTimePickerComponentProps = IDateTimePickerOwnProps & WrappedComponentProps;

const DateTimePickerComponent = React.forwardRef<HTMLInputElement, DateTimePickerComponentProps>(
    (
        {
            date,
            time,
            dateInputLabel,
            timeInputLabel,
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
        }: DateTimePickerComponentProps,
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

DateTimePickerComponent.displayName = "DateTimePickerComponent";

export const DateTimePicker = injectIntl(DateTimePickerComponent, { forwardRef: true });
DateTimePicker.displayName = "DateTimePicker";
