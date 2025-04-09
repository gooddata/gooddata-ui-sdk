// (C) 2024-2025 GoodData Corporation

import React from "react";
import { RepeatTypeSelect } from "./RepeatTypeSelect.js";
import { CronExpression } from "./CronExpression.js";
import { RECURRENCE_TYPES } from "./constants.js";
import { RecurrenceType } from "./types.js";
import { RepeatTypeDescription } from "./RepeatTypeDescription.js";
import { WeekStart } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IRecurrenceProps {
    label: string;
    showRepeatTypeDescription?: boolean;
    showInheritValue?: boolean;
    recurrenceType: RecurrenceType;
    inheritRecurrenceType?: RecurrenceType;
    startDate?: Date | null;
    timezone?: string;
    cronValue: string;
    cronPlaceholder?: string;
    weekStart?: WeekStart;
    onRepeatTypeChange: (repeatType: string) => void;
    onCronValueChange: (cronValue: string, isValid: boolean) => void;
    allowHourlyRecurrence?: boolean;
    showTimezoneInOccurrence?: boolean;
    onRecurrenceDropdownOpen?: () => void;
}

/**
 * @internal
 *
 * Recurrence component is used to select recurrence type and set cron expression.
 * @param props - IRecurrenceProps
 */
export const Recurrence: React.FC<IRecurrenceProps> = (props) => {
    const {
        label,
        recurrenceType,
        inheritRecurrenceType,
        startDate,
        cronValue,
        cronPlaceholder,
        timezone,
        onRepeatTypeChange,
        onCronValueChange,
        allowHourlyRecurrence,
        showTimezoneInOccurrence,
        showRepeatTypeDescription,
        showInheritValue,
        weekStart = "Sunday",
        onRecurrenceDropdownOpen,
    } = props;

    const isInherit = recurrenceType === RECURRENCE_TYPES.INHERIT;
    const isCron =
        recurrenceType === RECURRENCE_TYPES.CRON ||
        (isInherit && inheritRecurrenceType === RECURRENCE_TYPES.CRON);
    const isSpecified =
        recurrenceType !== RECURRENCE_TYPES.CRON ||
        (isInherit && inheritRecurrenceType !== RECURRENCE_TYPES.CRON);

    const accessibilityValue = "schedule.recurrence";
    return (
        <div className="gd-recurrence-form-repeat gd-input-component">
            {label ? (
                <label htmlFor={accessibilityValue} className="gd-label">
                    {label}
                </label>
            ) : null}
            <div className="gd-recurrence-form-repeat-inner">
                <RepeatTypeSelect
                    id={accessibilityValue}
                    repeatType={recurrenceType}
                    startDate={startDate}
                    onChange={onRepeatTypeChange}
                    allowHourlyRecurrence={allowHourlyRecurrence}
                    showInheritValue={showInheritValue}
                    onRepeatDropdownOpen={onRecurrenceDropdownOpen}
                />
                {isSpecified && showRepeatTypeDescription ? (
                    <RepeatTypeDescription
                        repeatType={isInherit ? inheritRecurrenceType : recurrenceType}
                        startDate={startDate}
                        weekStart={weekStart}
                        timezone={timezone}
                        showTimezone={Boolean(showTimezoneInOccurrence && !isInherit)}
                    />
                ) : null}
                {isCron ? (
                    <CronExpression
                        id={accessibilityValue}
                        expression={isInherit ? cronPlaceholder : cronValue}
                        onChange={onCronValueChange}
                        allowHourlyRecurrence={allowHourlyRecurrence}
                        timezone={timezone}
                        showTimezone={showTimezoneInOccurrence}
                        disabled={isInherit}
                    />
                ) : null}
            </div>
        </div>
    );
};
