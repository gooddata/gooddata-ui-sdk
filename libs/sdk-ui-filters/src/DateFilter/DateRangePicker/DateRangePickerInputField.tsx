// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import cx from "classnames";
import * as DayPicker from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";
import * as moment from "moment";
import { DateRangePickerInputFieldBody } from "./DateRangePickerInputFieldBody";

const getInputClassNames = (className?: string, classNameCalendar?: string): DayPicker.InputClassNames => ({
    container: cx("gd-date-range-picker-input", className),
    overlay: cx("gd-date-range-picker-picker", classNameCalendar),
    overlayWrapper: undefined,
});

interface IDateRangePickerInputFieldProps extends DayPicker.DayPickerInputProps {
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
