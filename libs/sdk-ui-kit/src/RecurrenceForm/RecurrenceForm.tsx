// (C) 2024-2025 GoodData Corporation

import { type KeyboardEvent, useCallback, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type WeekStart } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_LOCALE,
    DEFAULT_TIME_FORMAT,
    DEFAULT_WEEK_START,
    RECURRENCE_TYPES,
} from "./constants.js";
import { DateTime } from "./DateTime.js";
import { messages } from "./locales.js";
import { Recurrence } from "./Recurrence.js";
import { type RecurrenceType } from "./types.js";
import {
    constructCronExpression,
    isCronExpressionValid,
    transformCronExpressionToRecurrenceType,
} from "./utils/utils.js";

/**
 * @internal
 */
export interface IRecurrenceFormProps {
    startDate?: Date | null;
    cronExpression?: string;
    cronDescription?: string;
    placeholder?: string;
    onChange: (cronExpression: string, startDate: Date | null, isValid: boolean) => void;
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
    showTimezoneInOccurrence?: boolean;
    showInheritValue?: boolean;
    isWhiteLabeled?: boolean;
    onRecurrenceDropdownOpen?: () => void;
    closeDropdownsOnParentScroll?: boolean;
    onKeyDownSubmit?: (e: KeyboardEvent) => void;
    customRecurrenceTypeMappingFn?: (
        date?: Date | null,
        cronExpression?: string,
        allowHourlyRecurrence?: boolean,
        showInheritValue?: boolean,
        weekStart?: WeekStart,
    ) => RecurrenceType;
}

function RecurrenceFormCore({
    startDate = null,
    cronExpression = "",
    cronDescription = "",
    placeholder,
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
    showTimezoneInOccurrence,
    showInheritValue,
    isWhiteLabeled,
    onRecurrenceDropdownOpen,
    closeDropdownsOnParentScroll,
    onKeyDownSubmit,
    customRecurrenceTypeMappingFn,
}: IRecurrenceFormProps) {
    const intl = useIntl();
    const mapRecurrenceType = customRecurrenceTypeMappingFn ?? transformCronExpressionToRecurrenceType;

    const [dateValue, setDateValue] = useState<Date | null>(startDate);
    const [cronValue, setCronValue] = useState<string>(cronExpression);
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
        mapRecurrenceType(
            dateValue,
            cronExpression,
            allowHourlyRecurrence ?? false,
            showInheritValue ?? false,
            weekStart,
        ),
    );
    const [inheritRecurrenceType] = useState<RecurrenceType>(
        mapRecurrenceType(dateValue, placeholder, allowHourlyRecurrence, false, weekStart),
    );

    const onDateChange = useCallback(
        (date: Date, valid: boolean) => {
            setDateValue(date);
            const newExpression =
                constructCronExpression(date, recurrenceType, cronExpression ?? "", weekStart ?? "Sunday") ??
                "";
            onChange(
                newExpression,
                date,
                valid && isCronExpressionValid(newExpression, allowHourlyRecurrence),
            );
        },
        [cronExpression, onChange, recurrenceType, weekStart, allowHourlyRecurrence],
    );

    const onRepeatTypeChange = useCallback(
        (type: RecurrenceType) => {
            setRecurrenceType(type);
            const newExpression =
                constructCronExpression(dateValue, type, cronValue ?? "", weekStart ?? "Sunday") ?? "";
            onChange(
                newExpression,
                dateValue,
                type === RECURRENCE_TYPES.INHERIT
                    ? true
                    : isCronExpressionValid(newExpression, allowHourlyRecurrence),
            );
        },
        [cronValue, dateValue, onChange, weekStart, allowHourlyRecurrence],
    );

    const onCronValueChange = useCallback(
        (cron: string, isValid: boolean) => {
            setCronValue(cron);
            onChange(cron, dateValue, isValid);
        },
        [dateValue, onChange],
    );

    return (
        <div className={cx("gd-recurrence-form s-recurrence-form", className)}>
            {Boolean(startDate) && (
                <DateTime
                    label={startLabel ?? intl.formatMessage({ id: messages["starts"].id })}
                    date={dateValue}
                    onDateChange={onDateChange as (date: Date | null, valid: boolean) => void}
                    locale={locale}
                    dateFormat={dateFormat}
                    timezone={timezone}
                    weekStart={weekStart}
                    timeFormat={timeFormat}
                    closeOnParentScroll={closeDropdownsOnParentScroll}
                    onKeyDownSubmit={onKeyDownSubmit}
                />
            )}
            <Recurrence
                label={repeatLabel ?? intl.formatMessage({ id: messages["repeats"].id })}
                showRepeatTypeDescription={showRepeatTypeDescription}
                recurrenceType={recurrenceType}
                inheritRecurrenceType={inheritRecurrenceType}
                startDate={dateValue}
                cronValue={cronValue}
                cronPlaceholder={placeholder}
                cronDescription={cronDescription}
                onRepeatTypeChange={onRepeatTypeChange}
                onCronValueChange={onCronValueChange}
                allowHourlyRecurrence={allowHourlyRecurrence}
                weekStart={weekStart}
                timezone={timezone}
                showInheritValue={showInheritValue}
                showTimezoneInOccurrence={showTimezoneInOccurrence}
                onRecurrenceDropdownOpen={onRecurrenceDropdownOpen}
                isWhiteLabeled={isWhiteLabeled}
                closeOnParentScroll={closeDropdownsOnParentScroll}
            />
        </div>
    );
}

/**
 * @internal
 */
export function RecurrenceForm(props: IRecurrenceFormProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <RecurrenceFormCore {...props} />
        </IntlWrapper>
    );
}
