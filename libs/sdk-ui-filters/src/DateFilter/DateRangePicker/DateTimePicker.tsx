// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { DateRangePickerInputField } from "./DateRangePickerInputField";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IntlWrapper } from "@gooddata/sdk-ui";
import DayPickerInput from "react-day-picker/DayPickerInput";
import moment from "moment";
import { DateRangePickerInputFieldBody } from "./DateRangePickerInputFieldBody";
import { convertPlatformDateStringToDate } from "../utils/DateConversions";
import { TIME_FORMAT } from "../constants/Platform";
import { DayPickerProps } from "react-day-picker";

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
            defaultTime = "00:00",
            error = false,
        } = props;

        const getDate = () => {
            return moment(value).format("YYYY-MM-DD");
        };

        const getTime = () => {
            if (typeof value !== ("undefined" || null)) {
                return moment(value).format(TIME_FORMAT);
            }
            return moment(null).format(TIME_FORMAT);
        };

        // make sure it contains appropriate time if enabled
        const adjustDate = (selectedDate: Date) => {
            if (isTimeEnabled && selectedDate) {
                const previousDate = value ?? moment(defaultTime).toDate();

                const updatedDatetime = moment(selectedDate)
                    .hours(previousDate.getHours())
                    .minutes(previousDate.getMinutes());

                // set default time if necessary && configured
                if (updatedDatetime.isSame(selectedDate)) {
                    const time = moment(defaultTime, TIME_FORMAT).toDate();
                    updatedDatetime.hours(time.getHours()).minutes(time.getMinutes());
                }

                return updatedDatetime.toDate();
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
                        value={getDate()}
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
                        )}
                    >
                        <span className="gd-icon-clock" />
                        <input
                            type="time"
                            className="input-text"
                            onChange={(event) => {
                                onTimeChange(event.target.value);
                            }}
                            value={getTime()}
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
    <IntlWrapper locale={props.locale}>
        <DateTimePickerWithInt {...props} ref={ref} />
    </IntlWrapper>
));
DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker, DateTimePickerComponentProps };
