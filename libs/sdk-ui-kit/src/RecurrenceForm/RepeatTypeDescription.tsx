// (C) 2024-2025 GoodData Corporation

import { WeekStart } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";

import { RecurrenceType } from "./types.js";
import { transformRecurrenceTypeToDescription } from "./utils/utils.js";

interface IRepeatTypeDescriptionProps {
    repeatType: RecurrenceType;
    startDate?: Date | null;
    weekStart?: WeekStart;
    timezone?: string;
    showTimezone?: boolean;
}

export function RepeatTypeDescription({
    repeatType,
    startDate,
    weekStart,
    timezone,
    showTimezone,
}: IRepeatTypeDescriptionProps) {
    const intl = useIntl();

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
