// (C) 2024-2025 GoodData Corporation

import React, { useCallback } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { WeekStart } from "@gooddata/sdk-model";
import {
    ValidationContextStore,
    createInvalidDatapoint,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";

import { DEFAULT_DROPDOWN_ZINDEX, TIME_ANCHOR } from "./constants.js";
import { parseDate } from "../Datepicker/Datepicker.js";
import { Datepicker } from "../Datepicker/index.js";
import { Timepicker, normalizeTime } from "../Timepicker/index.js";
import { useIdPrefixed } from "../utils/useId.js";

interface IDateTimeProps {
    label: string;
    date: Date | null;
    locale?: string;
    timezone?: string;
    weekStart?: WeekStart;
    dateFormat?: string;
    timeFormat?: string;
    onDateChange: (date: Date | null, valid: boolean) => void;
    closeOnParentScroll?: boolean;
    onKeyDownSubmit?: (e: React.KeyboardEvent) => void;
}

const errorMessages = defineMessages({
    empty: { id: "recurrence.datetime.empty.error" },
    wrongFormat: { id: "recurrence.datetime.wrong.format.error" },
});

export const DateTime: React.FC<IDateTimeProps> = (props) => {
    const {
        label,
        date,
        dateFormat,
        locale,
        timezone,
        onDateChange,
        weekStart,
        timeFormat,
        closeOnParentScroll,
        onKeyDownSubmit,
    } = props;

    const { formatMessage } = useIntl();

    const dateFormatId = useIdPrefixed("label");
    const timezoneId = useIdPrefixed("timezone");

    const validationContextValue = useValidationContextValue(createInvalidNode({ id: "DateTime" }));
    const { setInvalidDatapoints, isValid } = validationContextValue;
    const invalidDatapoints = validationContextValue.getInvalidDatapoints();

    const validate = useCallback(
        (selectedDate: string) => {
            const parsedDate = parseDate(selectedDate, dateFormat);

            if (selectedDate.length === 0) {
                setInvalidDatapoints(() => [
                    createInvalidDatapoint({ message: formatMessage(errorMessages.empty) }),
                ]);
            } else if (parsedDate) {
                setInvalidDatapoints(() => []);
            } else {
                setInvalidDatapoints(() => [
                    createInvalidDatapoint({ message: formatMessage(errorMessages.wrongFormat) }),
                ]);
            }
        },
        [dateFormat, formatMessage, setInvalidDatapoints],
    );

    const handleDateChange = useCallback(
        (selectedDate: Date | null) => {
            const newDate = normalizeTime(date, selectedDate, TIME_ANCHOR);
            onDateChange(newDate, !!selectedDate);
        },
        [date, onDateChange],
    );

    const handleDateBlur = useCallback(
        (selectedDate: string) => {
            validate(selectedDate);
        },
        [validate],
    );

    const handleDateValidate = useCallback(
        (value: string) => {
            if (!isValid) {
                validate(value);
            }
        },
        [isValid, validate],
    );

    const handleTimeChange = useCallback(
        (selectedTime: Date | null) => {
            const newDate = normalizeTime(selectedTime, date, TIME_ANCHOR);
            onDateChange(newDate, !!selectedTime);
        },
        [date, onDateChange],
    );

    const handleOnDateInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        validate(e.currentTarget.value);
        onKeyDownSubmit?.(e);
    };

    const datePickerClassNames = cx("gd-recurrence-form-datetime-date s-recurrence-form-datetime-date", {
        "has-error": !isValid,
    });

    return (
        <ValidationContextStore value={validationContextValue}>
            <div className="gd-recurrence-form-datetime s-recurrence-form-datetime gd-input-component">
                <div className="gd-label">{label}</div>
                <div className="gd-recurrence-form-datetime-inner">
                    <div className="gd-recurrence-form-date">
                        <Datepicker
                            className={datePickerClassNames}
                            date={date}
                            dateFormat={dateFormat}
                            locale={locale}
                            placeholder={dateFormat}
                            onChange={handleDateChange}
                            onValidateInput={handleDateValidate}
                            onBlur={handleDateBlur}
                            weekStart={weekStart}
                            accessibilityConfig={{
                                ariaDescribedBy: isValid
                                    ? dateFormatId
                                    : invalidDatapoints.map((d) => d.id).join(" "),
                            }}
                            onDateInputKeyDown={handleOnDateInputKeyDown}
                        />
                        {isValid ? (
                            <span className="gd-recurrence-form-datetime-help" id={dateFormatId}>
                                <FormattedMessage
                                    id="recurrence.datetime.format.help"
                                    values={{ dateFormat }}
                                />
                            </span>
                        ) : (
                            <>
                                {invalidDatapoints.map((datapoint) => (
                                    <span
                                        key={datapoint.id}
                                        id={datapoint.id}
                                        className="gd-recurrence-form-datetime-error-message"
                                    >
                                        {datapoint.message}
                                    </span>
                                ))}
                            </>
                        )}
                    </div>
                    <Timepicker
                        className="gd-recurrence-form-datetime-time s-recurrence-form-datetime-time"
                        time={date}
                        onChange={handleTimeChange}
                        overlayPositionType="sameAsTarget"
                        overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
                        timeAnchor={TIME_ANCHOR}
                        timeFormat={timeFormat}
                        closeOnParentScroll={closeOnParentScroll}
                        ariaDescribedBy={timezone ? timezoneId : undefined}
                    />
                </div>
                {timezone ? (
                    <div className="gd-recurrence-form-datetime-timezone s-recurrence-form-datetime-timezone">
                        <div className={"sr-only"} id={timezoneId}>
                            <FormattedMessage id="recurrence.datetime.timezone.help" values={{ timezone }} />
                        </div>
                        {timezone}
                    </div>
                ) : null}
            </div>
        </ValidationContextStore>
    );
};
