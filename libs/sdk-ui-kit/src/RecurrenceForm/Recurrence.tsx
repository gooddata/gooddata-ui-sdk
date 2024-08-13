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
    cronValue: string;
    weekStart?: WeekStart;
    onRepeatTypeChange: (repeatType: string) => void;
    onCronValueChange: (cronValue: string) => void;
    allowHourlyRecurrence?: boolean;
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
        onRepeatTypeChange,
        onCronValueChange,
        allowHourlyRecurrence,
        showRepeatTypeDescription,
        weekStart = "Sunday",
    } = props;

    return (
        <div className="gd-recurrence-form-repeat gd-input-component">
            {Boolean(label) && <label className="gd-input-label">{label}</label>}
            <div className="gd-recurrence-form-repeat-inner">
                <RepeatTypeSelect
                    repeatType={recurrenceType}
                    startDate={startDate}
                    onChange={onRepeatTypeChange}
                    allowHourlyRecurrence={allowHourlyRecurrence}
                />
                {recurrenceType !== RECURRENCE_TYPES.CRON && showRepeatTypeDescription ? (
                    <RepeatTypeDescription
                        repeatType={recurrenceType}
                        startDate={startDate}
                        weekStart={weekStart}
                    />
                ) : null}
                {recurrenceType === RECURRENCE_TYPES.CRON ? (
                    <CronExpression expression={cronValue} onChange={onCronValueChange} />
                ) : null}
            </div>
        </div>
    );
};
