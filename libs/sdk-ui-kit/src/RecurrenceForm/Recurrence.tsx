// (C) 2024 GoodData Corporation

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
    recurrenceType: RecurrenceType;
    startDate?: Date | null;
    timezone?: string;
    cronValue: string;
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
        startDate,
        cronValue,
        timezone,
        onRepeatTypeChange,
        onCronValueChange,
        allowHourlyRecurrence,
        showTimezoneInOccurrence,
        showRepeatTypeDescription,
        weekStart = "Sunday",
        onRecurrenceDropdownOpen,
    } = props;

    return (
        <div className="gd-recurrence-form-repeat gd-input-component">
            {label ? <label className="gd-label">{label}</label> : null}
            <div className="gd-recurrence-form-repeat-inner">
                <RepeatTypeSelect
                    repeatType={recurrenceType}
                    startDate={startDate}
                    onChange={onRepeatTypeChange}
                    allowHourlyRecurrence={allowHourlyRecurrence}
                    onRepeatDropdownOpen={onRecurrenceDropdownOpen}
                />
                {recurrenceType !== RECURRENCE_TYPES.CRON && showRepeatTypeDescription ? (
                    <RepeatTypeDescription
                        repeatType={recurrenceType}
                        startDate={startDate}
                        weekStart={weekStart}
                        timezone={timezone}
                        showTimezone={showTimezoneInOccurrence}
                    />
                ) : null}
                {recurrenceType === RECURRENCE_TYPES.CRON ? (
                    <CronExpression
                        expression={cronValue}
                        onChange={onCronValueChange}
                        allowHourlyRecurrence={allowHourlyRecurrence}
                        timezone={timezone}
                        showTimezone={showTimezoneInOccurrence}
                    />
                ) : null}
            </div>
        </div>
    );
};
