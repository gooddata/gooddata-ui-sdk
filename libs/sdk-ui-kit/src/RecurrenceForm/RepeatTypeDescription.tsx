// (C) 2024-2025 GoodData Corporation

import React from "react";

import { useIntl } from "react-intl";

import { WeekStart } from "@gooddata/sdk-model";

import { RecurrenceType } from "./types.js";
import { transformRecurrenceTypeToDescription } from "./utils/utils.js";

interface IRepeatTypeDescriptionProps {
    repeatType: RecurrenceType;
    startDate?: Date | null;
    weekStart?: WeekStart;
    timezone?: string;
    showTimezone?: boolean;
}

export function RepeatTypeDescription(props: IRepeatTypeDescriptionProps) {
    const intl = useIntl();
    const { repeatType, startDate, weekStart, timezone, showTimezone } = props;

    return (
        <div className="gd-recurrence-form-repeat-type-description s-recurrence-form-repeat-type-description">
            <span>
                {transformRecurrenceTypeToDescription(intl, repeatType, startDate, weekStart)}
                {showTimezone && timezone ? (
                    <>
                        {" "}
                        {timezone} {intl.formatMessage({ id: "gs.time" })}
                    </>
                ) : null}
            </span>
        </div>
    );
}
