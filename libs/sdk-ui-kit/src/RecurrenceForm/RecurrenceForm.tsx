// (C) 2024 GoodData Corporation

import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { WeekStart } from "@gooddata/sdk-model";
import cx from "classnames";
import { RecurrenceType } from "./types.js";
import { transformCronExpressionToRecurrenceType, constructCronExpression } from "./utils.js";
import { DateTime } from "./DateTime.js";
import { Recurrence } from "./Recurrence.js";
import { messages } from "./locales.js";
import { DEFAULT_DATE_FORMAT, DEFAULT_LOCALE, DEFAULT_TIME_FORMAT, DEFAULT_WEEK_START } from "./constants.js";

/**
 * @internal
 */
export interface IRecurrenceFormProps {
    startDate?: Date | null;
    cronExpression: string;
    onChange: (cronExpression: string, startDate: Date | null) => void;
    locale?: string;
    dateFormat?: string;
    timeFormat?: string;
    weekStart?: WeekStart;
    timezone?: string;
    startLabel?: string;
    repeatLabel?: string;
    className?: string;
    allowHourlyRecurrence?: boolean;
    showRepeatTypeDescription?: boolean;
}

const RecurrenceFormCore: React.FC<IRecurrenceFormProps> = (props) => {
    const {
        startDate = null,
        cronExpression,
        onChange,
        locale = DEFAULT_LOCALE,
        dateFormat = DEFAULT_DATE_FORMAT,
        timeFormat = DEFAULT_TIME_FORMAT,
        weekStart = DEFAULT_WEEK_START,
        timezone,
        startLabel,
        repeatLabel,
        className,
        allowHourlyRecurrence = true,
        showRepeatTypeDescription,
    } = props;
    const intl = useIntl();

    const [dateValue, setDateValue] = useState<Date | null>(startDate);
    const [cronValue, setCronValue] = useState<string>(cronExpression);
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
        transformCronExpressionToRecurrenceType(dateValue, cronExpression, allowHourlyRecurrence, weekStart),
    );

    const onDateChange = useCallback(
        (date: Date) => {
            setDateValue(date);
            onChange(constructCronExpression(date, recurrenceType, cronExpression, weekStart), date);
        },
        [cronExpression, onChange, recurrenceType, weekStart],
    );

    const onRepeatTypeChange = useCallback(
        (type: RecurrenceType) => {
            setRecurrenceType(type);
            onChange(constructCronExpression(dateValue, type, cronValue, weekStart), dateValue);
        },
        [cronValue, dateValue, onChange, weekStart],
    );

    const onCronValueChange = useCallback(
        (cron: string) => {
            setCronValue(cron);
            onChange(cron, dateValue);
        },
        [dateValue, onChange],
    );

    return (
        <div className={cx("gd-recurrence-form s-recurrence-form", className)}>
            {Boolean(startDate) && (
                <DateTime
                    label={startLabel ?? intl.formatMessage({ id: messages.starts.id })}
                    date={dateValue}
                    onDateChange={onDateChange}
                    locale={locale}
                    dateFormat={dateFormat}
                    timezone={timezone}
                    weekStart={weekStart}
                    timeFormat={timeFormat}
                />
            )}
            <Recurrence
                label={repeatLabel ?? intl.formatMessage({ id: messages.repeats.id })}
                showRepeatTypeDescription={showRepeatTypeDescription}
                recurrenceType={recurrenceType}
                startDate={dateValue}
                cronValue={cronValue}
                onRepeatTypeChange={onRepeatTypeChange}
                onCronValueChange={onCronValueChange}
                allowHourlyRecurrence={allowHourlyRecurrence}
                weekStart={weekStart}
            />
        </div>
    );
};

/**
 * @internal
 */
export const RecurrenceForm: React.FC<IRecurrenceFormProps> = (props) => (
    <IntlWrapper locale={props.locale}>
        <RecurrenceFormCore {...props} />
    </IntlWrapper>
);
