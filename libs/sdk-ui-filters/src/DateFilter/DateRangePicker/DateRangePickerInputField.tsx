// (C) 2007-2019 GoodData Corporation
import React from "react";
import cx from "classnames";
import format from "date-fns/format";
import parse from "date-fns/parse";
import isValid from "date-fns/isValid";
import { DayPickerInputProps, InputClassNames } from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { DateRangePickerInputFieldBody } from "./DateRangePickerInputFieldBody";

const getInputClassNames = (className?: string, classNameCalendar?: string): InputClassNames => ({
    container: cx("gd-date-range-picker-input", className),
    overlay: cx("gd-date-range-picker-picker", classNameCalendar),
    overlayWrapper: undefined,
});

interface IDateRangePickerInputFieldProps extends DayPickerInputProps {
    className?: string;
    classNameCalendar?: string;
}

function formatDate(date: Date, dateFormat: string): string {
    return format(date, dateFormat);
}

function parseDate(str: string, dateFormat: string): Date | undefined {
    try {
        const parsedDate: Date = parse(str, dateFormat, new Date());
        // parse only dates with 4-digit years. this mimics moment.js behavior - it parses only dates above 1900
        // this is to make sure that the picker input is not overwritten in the middle of writing the year with year "0002" when writing 2020
        if (isValid(parsedDate) && parsedDate.getFullYear() >= 1000) {
            return parsedDate;
        }
        return;
    } catch {
        return;
    }
}

// eslint-disable-next-line react/display-name
export const DateRangePickerInputField = React.forwardRef<DayPickerInput, IDateRangePickerInputFieldProps>(
    (props: IDateRangePickerInputFieldProps, ref: any) => (
        <DayPickerInput
            {...props}
            ref={ref}
            formatDate={formatDate}
            parseDate={parseDate}
            classNames={getInputClassNames(props.className, props.classNameCalendar)}
            component={DateRangePickerInputFieldBody}
            hideOnDayClick={false}
        />
    ),
);
