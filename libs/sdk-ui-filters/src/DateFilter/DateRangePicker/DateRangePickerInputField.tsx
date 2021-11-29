// (C) 2007-2019 GoodData Corporation
import React from "react";
import cx from "classnames";
import format from "date-fns/format";
import parse from "date-fns/parse";
import isValid from "date-fns/isValid";
import { DayPickerInputProps } from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { DateRangePickerInputFieldBody } from "./DateRangePickerInputFieldBody";

const getInputClassNames = (
    className?: string,
    classNameCalendar?: string,
): DayPickerInputProps["classNames"] => ({
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
        // this is to make sure that the picker input is not overwritten in the middle of writing the year with year "0002" when writing 2020.
        //
        // it's also necessary to parse only when the input string fully matches with the desired format
        // to make sure that the picker input is not overwritten in the middle of writing.
        // e.g, let's consider a case where dateFormat is "dd/MM/yyyy" and the DayPickerInput has already been filled with a valid string "13/09/2020",
        // then an user wants to change only the month "13/09/2020" -> "13/11/2020" by removing "09" and typing "11".
        // in such case the parsing should wait until the user completes typing "11" (otherwise if parsing is done right after the first "1" is typed,
        // the cursor automatically moves to the end of the string in the middle of writing, causing a bad experience for the user).
        if (
            isValid(parsedDate) &&
            parsedDate.getFullYear() >= 1000 &&
            str === formatDate(parsedDate, dateFormat)
        ) {
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
