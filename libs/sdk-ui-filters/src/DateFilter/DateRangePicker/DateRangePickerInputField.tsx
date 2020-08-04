// (C) 2007-2019 GoodData Corporation
import React from "react";
import cx from "classnames";
import { DayPickerInputProps, InputClassNames } from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";
import moment from "moment";
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

function formatDate(date: Date, format: string, locale: string): string {
    return moment(date).locale(locale).format(format);
}

function parseDate(str: string, format: string, locale: string): Date | void {
    const result = moment(str, format, locale, true);

    if (result.isValid()) {
        return result.toDate();
    }

    return;
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
