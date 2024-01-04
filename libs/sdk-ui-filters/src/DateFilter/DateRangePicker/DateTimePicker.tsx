// (C) 2022-2023 GoodData Corporation
import React, { useState, useEffect } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import moment from "moment";
import isValid from "date-fns/isValid/index.js";
import parse from "date-fns/parse/index.js";
import format from "date-fns/format/index.js";

import { DateRangePickerInputFieldBody } from "./DateRangePickerInputFieldBody.js";

import { convertPlatformDateStringToDate } from "../utils/DateConversions.js";
import { TIME_FORMAT } from "../constants/Platform.js";
import { getPlatformStringFromDate, getTimeStringFromDate } from "./utils.js";

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
        return undefined;
    } catch {
        return undefined;
    }
}

interface IDateTimePickerOwnProps {
    placeholderDate: string;
    dateFormat: string;
    onChange: (value: Date) => void;
    value: Date;
    handleDayClick: () => void;
    isMobile: boolean;
    isTimeEnabled: boolean;
    className: string;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    defaultTime?: string;
    error?: boolean;
}

type DateTimePickerComponentProps = IDateTimePickerOwnProps & WrappedComponentProps;

const DateTimePickerComponent = React.forwardRef<HTMLInputElement, DateTimePickerComponentProps>(
    (props: DateTimePickerComponentProps, ref) => {
        const {
            placeholderDate,
            value,
            onChange,
            dateFormat,
            handleDayClick,
            isMobile,
            isTimeEnabled,
            onKeyDown,
            className,
            error = false,
        } = props;

        // keeping local copy to enable time update onBlur
        const [pickerTime, setPickerTime] = useState<string>(getTimeStringFromDate(value));

        const [inputValue, setInputValue] = useState<string>(formatDate(value, dateFormat));

        useEffect(() => {
            setInputValue(formatDate(value, dateFormat));
        }, [value, dateFormat]);

        // make sure it contains appropriate time if enabled
        const adjustDate = (selectedDate: Date) => {
            if (isTimeEnabled && selectedDate) {
                const previousDate = value ?? moment(pickerTime, TIME_FORMAT).toDate();

                selectedDate.setHours(previousDate.getHours());
                selectedDate.setMinutes(previousDate.getMinutes());
            }

            return selectedDate;
        };

        const onDateChange = (selectedDate: Date) => {
            onChange(adjustDate(selectedDate));
        };

        const handleInputChange = (value: string) => {
            setInputValue(value);

            const parsedDate = parseDate(value, dateFormat);

            onDateChange(parsedDate);
        };

        const onTimeChange = (input: string) => {
            const date = value ?? new Date(); // set today in case of invalid date
            const time = moment(input, TIME_FORMAT);
            if (time.isValid()) {
                date.setHours(time.hours());
                date.setMinutes(time.minutes());
                setPickerTime(input);
            }

            onChange(date);
        };

        return (
            <div className={cx(className, isTimeEnabled && "gd-flex-row")}>
                {isMobile ? (
                    <DateRangePickerInputFieldBody
                        type="date"
                        className={cx(
                            "s-date-range-picker-date",
                            "gd-date-range-picker-input",
                            "gd-date-range-picker-input-native",
                            error && "gd-date-range-picker-input-error",
                        )}
                        placeholder={placeholderDate}
                        onChange={(event) =>
                            onDateChange(convertPlatformDateStringToDate(event.target.value))
                        }
                        value={getPlatformStringFromDate(value)}
                    />
                ) : (
                    <div
                        className={cx(
                            "gd-date-range-picker-input",
                            error && "gd-date-range-picker-input-error",
                        )}
                    >
                        <span>
                            <span className="gd-icon-calendar" />
                            <input
                                onKeyDown={onKeyDown}
                                ref={ref}
                                placeholder={placeholderDate}
                                onChange={(event) => handleInputChange(event.target.value)}
                                onClick={handleDayClick}
                                onFocus={handleDayClick}
                                value={inputValue}
                                className="input-text s-date-range-picker-input-field"
                            />
                        </span>
                    </div>
                )}
                {isTimeEnabled ? (
                    <span
                        className={cx(
                            "gd-date-range-picker-input",
                            "gd-date-range-picker-input-time",
                            "s-date-range-picker-input-time",
                            error && "gd-date-range-picker-input-error",
                        )}
                    >
                        <span className="gd-icon-clock" />
                        <input
                            type="time"
                            className="input-text"
                            onChange={(event) => onTimeChange(event.target.value)}
                            value={pickerTime}
                        />
                    </span>
                ) : null}
            </div>
        );
    },
);

DateTimePickerComponent.displayName = "DateTimePickerComponent";

const DateTimePickerWithInt = injectIntl(DateTimePickerComponent, { forwardRef: true });

DateTimePickerWithInt.displayName = "DateTimePicker";

export { DateTimePickerWithInt, DateTimePickerComponentProps };
