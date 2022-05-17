// (C) 2022 GoodData Corporation
import React, { useEffect, useState } from "react";
import cx from "classnames";
import { DateRangePickerInputField } from "./DateRangePickerInputField";
import { injectIntl, WrappedComponentProps } from "react-intl";
import DayPickerInput from "react-day-picker/DayPickerInput";
import moment from "moment";
import { DateRangePickerInputFieldBody } from "./DateRangePickerInputFieldBody";
import { convertPlatformDateStringToDate } from "../utils/DateConversions";
import { DAY_START_TIME, TIME_FORMAT } from "../constants/Platform";
import { DayPickerProps } from "react-day-picker";
import isValid from "date-fns/isValid";
import { getPlatformStringFromDate, getTimeStringFromDate } from "./utils";

interface IDateTimePickerOwnProps {
    placeholderDate: string;
    dateFormat: string;
    onChange: (value: Date) => void;
    value: Date;
    dayPickerPropsWithDefaults: DayPickerProps;
    handleDayClick: () => void;
    locale: string;
    isMobile: boolean;
    isTimeEnabled: boolean;
    className: string;
    defaultTime?: string;
    error?: boolean;
}

type DateTimePickerComponentProps = IDateTimePickerOwnProps & WrappedComponentProps;

const DateTimePickerComponent = React.forwardRef<DayPickerInput, DateTimePickerComponentProps>(
    (props: DateTimePickerComponentProps, ref) => {
        const {
            placeholderDate,
            value,
            onChange,
            dateFormat,
            dayPickerPropsWithDefaults,
            handleDayClick,
            isMobile,
            isTimeEnabled,
            className,
            defaultTime = DAY_START_TIME,
            error = false,
        } = props;

        // keeping local copy to enable time update onBlur
        const [pickerTime, setPickerTime] = useState<string>(defaultTime);

        useEffect(() => {
            if (isValid(value)) {
                setPickerTime(getTimeStringFromDate(value));
            }
        }, [value]);

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

        const onTimeChange = (input: string) => {
            const date = value ?? new Date(); // set today in case of invalid date
            const time = moment(input, TIME_FORMAT);
            if (time.isValid()) {
                date.setHours(time.hours());
                date.setMinutes(time.minutes());
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
                    <DateRangePickerInputField
                        className={cx(
                            `s-date-range-picker-date`,
                            error && "gd-date-range-picker-input-error",
                        )}
                        classNameCalendar={`s-date-range-calendar`}
                        ref={ref}
                        onDayChange={onDateChange}
                        value={value}
                        format={dateFormat}
                        placeholder={placeholderDate}
                        dayPickerProps={{
                            ...dayPickerPropsWithDefaults,
                            onDayClick: handleDayClick,
                        }}
                        // showOverlay={true} // Always shows the calendar, useful for CSS debugging
                    />
                )}
                {isTimeEnabled && (
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
                )}
            </div>
        );
    },
);
DateTimePickerComponent.displayName = "DateTimePickerComponent";

const DateTimePickerWithInt = injectIntl(DateTimePickerComponent, { forwardRef: true });

const DateTimePicker = React.forwardRef<DayPickerInput, IDateTimePickerOwnProps>((props, ref) => (
    <DateTimePickerWithInt {...props} ref={ref} />
));
DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker, DateTimePickerComponentProps };
