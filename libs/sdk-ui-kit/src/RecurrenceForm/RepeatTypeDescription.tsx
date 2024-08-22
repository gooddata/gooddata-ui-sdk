// (C) 2024 GoodData Corporation

import React from "react";
import { WeekStart } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";

import { RecurrenceType } from "./types.js";
import { transformRecurrenceTypeToDescription } from "./utils.js";

interface IRepeatTypeDescriptionProps {
    repeatType: RecurrenceType;
    startDate?: Date | null;
    weekStart?: WeekStart;
}

export const RepeatTypeDescription: React.FC<IRepeatTypeDescriptionProps> = (props) => {
    const intl = useIntl();
    const { repeatType, startDate, weekStart } = props;

    return (
        <div className="gd-recurrence-form-repeat-type-description s-recurrence-form-repeat-type-description">
            <div>{transformRecurrenceTypeToDescription(intl, repeatType, startDate, weekStart)}</div>
        </div>
    );
};
