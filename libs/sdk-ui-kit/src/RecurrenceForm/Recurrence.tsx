// (C) 2024 GoodData Corporation

import React from "react";
import { RepeatTypeSelect } from "./RepeatTypeSelect.js";
import { CronExpression } from "./CronExpression.js";
import { RECURRENCE_TYPES } from "./constants.js";

interface IRecurrenceProps {
    label: string;
    recurrenceType: string;
    startDate: Date;
    cronValue: string;
    onRepeatTypeChange: (repeatType: string) => void;
    onCronValueChange: (cronValue: string) => void;
}

export const Recurrence: React.FC<IRecurrenceProps> = (props) => {
    const { label, recurrenceType, startDate, cronValue, onRepeatTypeChange, onCronValueChange } = props;

    return (
        <div className="gd-recurrence-form-repeat gd-input-component">
            <label className="gd-label">{label}</label>
            <RepeatTypeSelect
                repeatType={recurrenceType}
                startDate={startDate}
                onChange={onRepeatTypeChange}
            />
            {recurrenceType === RECURRENCE_TYPES.CRON ? (
                <CronExpression expression={cronValue} onChange={onCronValueChange} />
            ) : null}
        </div>
    );
};
