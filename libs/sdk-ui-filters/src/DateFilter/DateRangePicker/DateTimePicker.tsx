// (C) 2022-2025 GoodData Corporation
import React, { useState, useEffect, useCallback, useMemo } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps, IntlShape } from "react-intl";
import moment from "moment";
import isValid from "date-fns/isValid/index.js";
import parse from "date-fns/parse/index.js";
import format from "date-fns/format/index.js";
import { useId } from "@gooddata/sdk-ui-kit";

import { DateRangePickerInputFieldBody } from "./DateRangePickerInputFieldBody.js";

import { convertPlatformDateStringToDate } from "../utils/DateConversions.js";
import { TIME_FORMAT } from "../constants/Platform.js";
import { getPlatformStringFromDate, getTimeStringFromDate } from "./utils.js";
import { IDateTimePickerErrors, DateParseError } from "../interfaces/index.js";
import isEmpty from "lodash/isEmpty.js";
import { getLocalizedDateFormat } from "../utils/FormattingUtils.js";

const InputDescription: React.FC<{
    descriptionId: string;
    error?: string;
    dateFormat: string;
    intl: IntlShape;
}> = ({ descriptionId, error, dateFormat, intl }) => {
    if (!error) {
        return null;
    }
    return (
        <div
            id={descriptionId}
            className={cx("gd-date-range-picker-input__description", {
                "gd-date-range-picker-input__description--error": !!error,
                "s-absolute-range-error": !!error,
            })}
        >
            {intl.formatMessage({ id: error }, { format: dateFormat || getLocalizedDateFormat(intl.locale) })}
        </div>
    );
};

function formatDate(date: Date, dateFormat: string): string {
    if (date === undefined || isNaN(date.getTime())) {
        return undefined;
    }
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

interface IDateTimePickerAccessibilityConfig {
    dateAriaLabel?: React.AriaAttributes["aria-label"];
    timeAriaLabel?: React.AriaAttributes["aria-label"];
    dateInputHintId?: string;
    timeInputHintId?: string;
}

interface IDateTimePickerOwnProps {
    dateFormat: string;
    onChange: (value: Date, error?: DateParseError) => void;
    onInputMarkedValid: (date: Date) => void;
    value: Date;
    handleDayClick: () => void;
    isMobile: boolean;
    isTimeEnabled: boolean;
    className: string;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    defaultTime?: string;
    errors?: IDateTimePickerErrors;
    accessibilityConfig?: IDateTimePickerAccessibilityConfig;
    dateInputLabel?: string;
    timeInputLabel?: string;
    intl: IntlShape;
}

type DateTimePickerComponentProps = IDateTimePickerOwnProps & WrappedComponentProps;

const buildAriaDescribedByValue = (values: string[]) => values.filter((value) => !!value).join(" ");

// make sure it contains appropriate time if enabled
const adjustTime = (parsedDate: Date, previousDate: Date, isTimeEnabled: boolean) => {
    if (isTimeEnabled && parsedDate) {
        parsedDate.setHours(previousDate.getHours());
        parsedDate.setMinutes(previousDate.getMinutes());
    }
    return parsedDate;
};

const useDateTimePicker = ({
    value,
    onChange,
    onInputMarkedValid,
    dateFormat,
    isTimeEnabled,
    errors,
}: DateTimePickerComponentProps) => {
    // keeping local copy to enable time update onBlur
    const [pickerTime, setPickerTime] = useState<string>(getTimeStringFromDate(value));

    const [inputValue, setInputValue] = useState<string>(formatDate(value, dateFormat));

    useEffect(() => {
        setInputValue(formatDate(value, dateFormat));
    }, [value, dateFormat]);

    const previousDate = useMemo(
        () => value ?? moment(pickerTime, TIME_FORMAT).toDate(),
        [value, pickerTime],
    );

    const onMobileDateChange = useCallback(
        (value: string) => {
            const selectedDate = convertPlatformDateStringToDate(value);
            onChange(adjustTime(selectedDate, previousDate, isTimeEnabled));
        },
        [isTimeEnabled, onChange, previousDate],
    );

    const onDateInputChange = useCallback(
        (value: string) => {
            setInputValue(value);
            const date = parseDate(value, dateFormat);
            if (date) {
                onInputMarkedValid(adjustTime(date, previousDate, isTimeEnabled));
            }
        },
        [dateFormat, isTimeEnabled, onInputMarkedValid, previousDate],
    );

    const onDateInputBlur = useCallback(() => {
        if (isEmpty(inputValue)) {
            onChange(undefined, "empty");
            return;
        }
        const date = parseDate(inputValue, dateFormat);
        if (date === undefined) {
            onChange(undefined, "invalid");
            return;
        }
        onChange(adjustTime(date, previousDate, isTimeEnabled));
    }, [dateFormat, inputValue, isTimeEnabled, onChange, previousDate]);

    const onTimeInputChange = useCallback(
        (input: string) => {
            const date = value ?? new Date(); // set today in case of invalid date
            const time = moment(input, TIME_FORMAT);
            if (time.isValid()) {
                date.setHours(time.hours());
                date.setMinutes(time.minutes());
                setPickerTime(input);
                onInputMarkedValid(date);
            }
        },
        [onInputMarkedValid, value],
    );

    const onTimeInputBlur = useCallback(() => {
        const date = value ?? new Date(); // set today in case of invalid date
        const time = moment(pickerTime, TIME_FORMAT);
        if (time.isValid()) {
            date.setHours(time.hours());
            date.setMinutes(time.minutes());
        }
        onChange(date);
    }, [onChange, pickerTime, value]);

    const { dateError, timeError } = errors ?? {};

    // mobile view still renders errors below inputs, unlike accessible version that has errors split
    // below the input that triggered the error
    const hasSomeError = !!dateError || !!timeError;

    return {
        inputValue,
        pickerTime,
        onMobileDateChange,
        onDateInputChange,
        onDateInputBlur,
        onTimeInputChange,
        onTimeInputBlur,
        hasSomeError,
        dateError,
        timeError,
    };
};

const DateTimePickerComponent = React.forwardRef<HTMLInputElement, DateTimePickerComponentProps>(
    (props: DateTimePickerComponentProps, ref) => {
        const {
            dateInputLabel,
            timeInputLabel,
            value,
            dateFormat,
            handleDayClick,
            isMobile,
            isTimeEnabled,
            onKeyDown,
            className,
            accessibilityConfig,
            intl,
        } = props;

        const dateInputLabelId = useId();
        const dateInputErrorId = useId();
        const timeInputLabelId = useId();
        const timeInputErrorId = useId();
        const { dateAriaLabel, timeAriaLabel, dateInputHintId, timeInputHintId } = accessibilityConfig ?? {};

        const {
            inputValue,
            pickerTime,
            onMobileDateChange,
            onDateInputChange,
            onDateInputBlur,
            onTimeInputChange,
            onTimeInputBlur,
            hasSomeError,
            dateError,
            timeError,
        } = useDateTimePicker(props);

        return (
            <div className={cx(className, isTimeEnabled && "gd-date-range-row")}>
                <fieldset>
                    {isMobile ? (
                        <div className="gd-date-range-column">
                            {dateInputLabel ? <label id={dateInputLabelId}>{dateInputLabel}</label> : null}
                            <DateRangePickerInputFieldBody
                                type="date"
                                className={cx(
                                    "s-date-range-picker-date",
                                    "gd-date-range-picker-input",
                                    "gd-date-range-picker-input-native",
                                    {
                                        "gd-date-range-picker-input-error": hasSomeError,
                                        "has-error": hasSomeError,
                                    },
                                )}
                                onChange={(event) => onMobileDateChange(event.target.value)}
                                value={getPlatformStringFromDate(value)}
                            />
                            <InputDescription
                                descriptionId={dateInputErrorId}
                                error={dateError}
                                dateFormat={dateFormat}
                                intl={intl}
                            />
                        </div>
                    ) : (
                        <div className="gd-date-range-column">
                            {dateInputLabel ? <label id={dateInputLabelId}>{dateInputLabel}</label> : null}
                            <div
                                className={cx("gd-date-range-picker-input", {
                                    "gd-date-range-picker-input-error": !!dateError,
                                    "has-error": !!dateError,
                                })}
                            >
                                <span className="gd-icon-calendar" />
                                <input
                                    onKeyDown={onKeyDown}
                                    ref={ref}
                                    aria-label={dateAriaLabel}
                                    placeholder={dateFormat}
                                    onChange={(event) => onDateInputChange(event.target.value)}
                                    onClick={handleDayClick}
                                    onBlur={onDateInputBlur}
                                    value={inputValue}
                                    className="input-text s-date-range-picker-input-field"
                                    aria-labelledby={dateInputLabel ? dateInputLabelId : undefined}
                                    aria-describedby={buildAriaDescribedByValue([
                                        dateInputHintId,
                                        dateError ? dateInputErrorId : undefined,
                                    ])}
                                    {...(dateError ? { "aria-invalid": true } : {})}
                                />
                            </div>
                            <InputDescription
                                descriptionId={dateInputErrorId}
                                error={dateError}
                                dateFormat={dateFormat}
                                intl={intl}
                            />
                        </div>
                    )}
                    {isTimeEnabled ? (
                        <div className="gd-date-range-column">
                            {timeInputLabel ? <label id={timeInputLabelId}>{timeInputLabel}</label> : null}
                            <span
                                className={cx(
                                    "gd-date-range-picker-input",
                                    "gd-date-range-picker-input-time",
                                    "s-date-range-picker-input-time",
                                    {
                                        "gd-date-range-picker-input-error": !!timeError,
                                        "has-error": !!timeError,
                                    },
                                )}
                            >
                                <span className="gd-icon-clock" />
                                <input
                                    type="time"
                                    className="input-text"
                                    aria-label={timeAriaLabel}
                                    onChange={(event) => onTimeInputChange(event.target.value)}
                                    onBlur={onTimeInputBlur}
                                    value={pickerTime}
                                    aria-labelledby={timeInputLabel ? timeInputLabelId : undefined}
                                    aria-describedby={buildAriaDescribedByValue([
                                        timeInputHintId,
                                        timeError ? timeInputErrorId : undefined,
                                    ])}
                                    {...(timeError ? { "aria-invalid": true } : {})}
                                />
                            </span>
                            <InputDescription
                                descriptionId={timeInputErrorId}
                                error={timeError}
                                dateFormat={dateFormat}
                                intl={intl}
                            />
                        </div>
                    ) : null}
                </fieldset>
            </div>
        );
    },
);

DateTimePickerComponent.displayName = "DateTimePickerComponent";

const DateTimePickerWithIntl = injectIntl(DateTimePickerComponent, { forwardRef: true });

DateTimePickerWithIntl.displayName = "DateTimePicker";

export type { DateTimePickerComponentProps };
export { DateTimePickerWithIntl };
