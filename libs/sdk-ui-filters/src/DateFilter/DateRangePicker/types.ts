// (C) 2025 GoodData Corporation

import React from "react";

import { IntlShape } from "react-intl";

export const DATE_INPUT_HINT_ID = "date-range-picker-date-input-hint";
export const TIME_INPUT_HINT_ID = "date-range-picker-time-input-hint";

export interface ITime {
    hours: number | undefined;
    minutes: number | undefined;
}

export interface IDateRangeInputFieldProps {
    date: Date;
    time: ITime;
    onDateChange: (date: Date | undefined, shouldSubmitForm?: boolean) => void;
    onTimeChange: (time: ITime | undefined, shouldSubmitForm?: boolean) => void;
    onInputClick: () => void;
    onDateInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    dateFormat: string;
    isMobile: boolean;
    isTimeEnabled: boolean;
    errors?: IDateTimePickerErrors;
    intl: IntlShape;
    withoutApply?: boolean;
}

export interface IDateRange {
    from: Date;
    to: Date;
}

export interface IInputAccessibilityConfig {
    ariaLabel?: React.AriaAttributes["aria-label"];
    inputHintId?: string;
}

export interface IDateInputErrorMessageTexts {
    emptyDate: string;
    invalidDate: string;
    startDateAfterEndDate: string;
}
export interface ITimeInputErrorMessageTexts {
    startTimeAfterEndTime: string;
}

export interface InputErrorMessageTexts {
    dateInput: IDateInputErrorMessageTexts;
    timeInput: ITimeInputErrorMessageTexts;
}

export interface IDateTimePickerErrors {
    isDateOrderError: boolean;
    isTimeOrderError: boolean;
}
