// (C) 2024-2025 GoodData Corporation

import cx from "classnames";
import { RepeatTypeSelect } from "./RepeatTypeSelect.js";
import { CronExpression } from "./CronExpression.js";
import { RECURRENCE_TYPES } from "./constants.js";
import { RecurrenceType } from "./types.js";
import { RepeatTypeDescription } from "./RepeatTypeDescription.js";
import { WeekStart } from "@gooddata/sdk-model";
import { CronExpressionSuggestion } from "./CronExpressionSuggestion.js";
import { useCronValidation } from "./useCronValidation.js";
import { useIdPrefixed } from "../utils/useId.js";

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
    cronDescription?: string;
    weekStart?: WeekStart;
    onRepeatTypeChange: (repeatType: string) => void;
    onCronValueChange: (cronValue: string, isValid: boolean) => void;
    allowHourlyRecurrence?: boolean;
    showTimezoneInOccurrence?: boolean;
    isWhiteLabeled?: boolean;
    onRecurrenceDropdownOpen?: () => void;
    closeOnParentScroll?: boolean;
}

/**
 * @internal
 *
 * Recurrence component is used to select recurrence type and set cron expression.
 * @param props - IRecurrenceProps
 */
export function Recurrence({
    label,
    recurrenceType,
    inheritRecurrenceType,
    startDate,
    cronValue,
    cronPlaceholder,
    cronDescription,
    timezone,
    onRepeatTypeChange,
    onCronValueChange,
    allowHourlyRecurrence,
    showTimezoneInOccurrence,
    showRepeatTypeDescription,
    showInheritValue,
    isWhiteLabeled,
    weekStart = "Sunday",
    onRecurrenceDropdownOpen,
    closeOnParentScroll,
}: IRecurrenceProps) {
    const { cronError, handleChange, handleOnBlur } = useCronValidation({
        allowHourlyRecurrence,
        onCronValueChange,
    });

    const labelId = useIdPrefixed("label");
    const errorId = useIdPrefixed("error");

    const recurrenceFormClasses = cx("gd-recurrence-form-repeat", "gd-input-component", {
        "gd-recurrence-form-repeat-cron": recurrenceType === RECURRENCE_TYPES.CRON,
    });

    const isInherit = recurrenceType === RECURRENCE_TYPES.INHERIT;
    const isCron =
        recurrenceType === RECURRENCE_TYPES.CRON ||
        (isInherit && inheritRecurrenceType === RECURRENCE_TYPES.CRON);
    const isSpecified =
        recurrenceType !== RECURRENCE_TYPES.CRON ||
        (isInherit && inheritRecurrenceType !== RECURRENCE_TYPES.CRON);

    return (
        <>
            <div className={recurrenceFormClasses}>
                {label ? (
                    <label htmlFor={labelId} className="gd-label">
                        {label}
                    </label>
                ) : null}
                <div className="gd-recurrence-form-repeat-inner">
                    <RepeatTypeSelect
                        id={labelId}
                        repeatType={recurrenceType}
                        startDate={startDate}
                        onChange={onRepeatTypeChange}
                        allowHourlyRecurrence={allowHourlyRecurrence}
                        showInheritValue={showInheritValue}
                        onRepeatDropdownOpen={onRecurrenceDropdownOpen}
                        closeOnParentScroll={closeOnParentScroll}
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
                            expression={isInherit ? cronPlaceholder : cronValue}
                            description={cronDescription}
                            onChange={handleChange}
                            allowHourlyRecurrence={allowHourlyRecurrence}
                            timezone={timezone}
                            showTimezone={showTimezoneInOccurrence}
                            validationError={cronError}
                            onBlur={handleOnBlur}
                            accessibilityConfig={{
                                ariaDescribedBy: cronError ? errorId : undefined,
                                ariaLabelledBy: labelId,
                            }}
                            disabled={isInherit}
                        />
                    ) : null}
                </div>
            </div>
            {!isInherit ? (
                <CronExpressionSuggestion
                    errorId={errorId}
                    validationError={cronError}
                    recurrenceType={recurrenceType}
                    isWhiteLabeled={isWhiteLabeled}
                />
            ) : null}
        </>
    );
}
