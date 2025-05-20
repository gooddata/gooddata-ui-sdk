// (C) 2025 GoodData Corporation

import React from "react";
import { IntlShape } from "react-intl";

import { IDateTimePickerErrors } from "../interfaces/index.js";

export const DATE_INPUT_HINT_ID = "date-range-picker-date-input-hint";
export const TIME_INPUT_HINT_ID = "date-range-picker-time-input-hint";

export interface IDateRangeInputFieldProps {
    value: Date;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onChange: (date: Date) => void;
    onInputMarkedValid: (date: Date) => void;
    onInputClick: () => void;
    errors?: IDateTimePickerErrors;
    dateFormat: string;
    isMobile: boolean;
    isTimeEnabled: boolean;
    intl: IntlShape;
}

export interface IDateRange {
    from: Date;
    to: Date;
}
