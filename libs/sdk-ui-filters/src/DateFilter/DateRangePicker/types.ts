// (C) 2025-2026 GoodData Corporation

import { type AriaAttributes, type KeyboardEvent } from "react";

import { type IntlShape } from "react-intl";

export const DATE_INPUT_HINT_ID = "date-range-picker-date-input-hint";
export const TIME_INPUT_HINT_ID = "date-range-picker-time-input-hint";

export interface ITime {
    hours: number | undefined;
    minutes: number | undefined;
}

export interface IDateRangeInputFieldProps {
    date: Date | undefined;
    time: ITime | undefined;
    onDateChange: (date: Date | undefined, shouldSubmitForm?: boolean) => void;
    onTimeChange: (time: ITime | undefined, shouldSubmitForm?: boolean) => void;
    onInputClick: () => void;
    onDateInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    dateFormat: string | undefined;
    isMobile: boolean;
    isTimeEnabled: boolean;
    errors?: IDateTimePickerErrors;
    intl: IntlShape;
    withoutApply?: boolean;
}

export interface IDateRange {
    from: Date | undefined;
    to: Date | undefined;
}

export interface IInputAccessibilityConfig {
    ariaLabel?: AriaAttributes["aria-label"];
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

export interface IInputErrorMessageTexts {
    dateInput: IDateInputErrorMessageTexts;
    timeInput: ITimeInputErrorMessageTexts;
}

export interface IDateTimePickerErrors {
    isDateOrderError: boolean;
    isTimeOrderError: boolean;
}
