// (C) 2024 GoodData Corporation

import React from "react";
import { RepeatTypeSelect } from "./RepeatTypeSelect.js";
import { CronExpression } from "./CronExpression.js";
import { RECURRENCE_TYPES } from "./constants.js";
import { RecurrenceType } from "./types.js";

interface IRecurrenceProps {
    label: string;
    recurrenceType: RecurrenceType;
    startDate: Date;
    cronValue: string;
    onRepeatTypeChange: (repeatType: string) => void;
    onCronValueChange: (cronValue: string) => void;
    allowHourlyRecurrence?: boolean;
}

export const Recurrence: React.FC<IRecurrenceProps> = (props) => {
    const {
        label,
        recurrenceType,
        startDate,
        cronValue,
        onRepeatTypeChange,
        onCronValueChange,
        allowHourlyRecurrence,
    } = props;

    return (
        <div className="gd-recurrence-form-repeat gd-input-component">
            <label className="gd-label">{label}</label>
            <RepeatTypeSelect
                repeatType={recurrenceType}
                startDate={startDate}
                onChange={onRepeatTypeChange}
                allowHourlyRecurrence={allowHourlyRecurrence}
            />
            {recurrenceType === RECURRENCE_TYPES.CRON ? (
                <CronExpression expression={cronValue} onChange={onCronValueChange} />
            ) : null}
        </div>
    );
};
