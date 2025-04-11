// (C) 2024-2025 GoodData Corporation

import React, { useState, useCallback } from "react";
import cx from "classnames";
import { RepeatTypeSelect } from "./RepeatTypeSelect.js";
import { CronExpression } from "./CronExpression.js";
import { RECURRENCE_TYPES } from "./constants.js";
import { RecurrenceType } from "./types.js";
import { RepeatTypeDescription } from "./RepeatTypeDescription.js";
import { WeekStart } from "@gooddata/sdk-model";
import { defineMessages } from "react-intl";
import cronParser from "cron-parser";
import { CronExpressionSuggestion } from "./CronExpressionSuggestion.js";
import { isCronExpressionValid } from "./utils.js";

enum RecurrenceFormCronErrorTypes {
    EMPTY = "EMPTY",
    WRONG_FORMAT = "WRONG_FORMAT",
    FREQUENCY_TOO_HIGH = "FREQUENCY_TOO_HIGH",
}

const errorMessages = defineMessages({
    empty: { id: "recurrence.error.empty" },
    wrongFormat: { id: "recurrence.error.wrongFormat" },
    frequencyTooHigh: { id: "recurrence.error.too_often" },
});

const RECURRENCE_CRON_HINT_ID = "recurrence-cron-hint-id";

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

    const [cronError, setCronError] = useState<string | null>(null);

    const parseCron = useCallback((expression: string) => {
        let isValid = true;
        try {
            cronParser.CronExpressionParser.parse(expression, { strict: true });
        } catch (err) {
            isValid = false;
        }

        return isValid;
    }, []);

    const validate = useCallback(
        (expression: string) => {
            const trimmedCronExpression = expression.replace(/\s+/g, "");
            const parts = expression.split(/\s+/);

            if (trimmedCronExpression.length === 0) {
                return RecurrenceFormCronErrorTypes.EMPTY;
            }

            const isValid = isCronExpressionValid(expression, allowHourlyRecurrence);
            if (!isValid) {
                return RecurrenceFormCronErrorTypes.FREQUENCY_TOO_HIGH;
            }

            if (parts.length === 6 || trimmedCronExpression.length === 6) {
                const isValid = parseCron(expression);

                if (isValid) {
                    return null;
                }
            }

            return RecurrenceFormCronErrorTypes.WRONG_FORMAT;
        },
        [allowHourlyRecurrence, parseCron],
    );

    const handleChange = useCallback(
        (expression: string) => {
            const validationResult = validate(expression);

            if (cronError) {
                // NESTOR
                if (validationResult) {
                    switch (validationResult) {
                        case RecurrenceFormCronErrorTypes.EMPTY:
                            setCronError(errorMessages.empty.id);
                            break;
                        case RecurrenceFormCronErrorTypes.WRONG_FORMAT:
                            setCronError(errorMessages.wrongFormat.id);
                            break;
                        case RecurrenceFormCronErrorTypes.FREQUENCY_TOO_HIGH:
                            setCronError(errorMessages.frequencyTooHigh.id);
                            break;
                    }
                } else {
                    setCronError(null);
                }
            }
            // NESTOR
            onCronValueChange(expression, !validationResult);
        },
        [cronError, validate, onCronValueChange],
    );

    const handleOnBlur = useCallback(
        (value: string) => {
            const validationResult = validate(value);
            // NESTOR
            if (validationResult) {
                switch (validationResult) {
                    case RecurrenceFormCronErrorTypes.EMPTY:
                        setCronError(errorMessages.empty.id);
                        break;
                    case RecurrenceFormCronErrorTypes.WRONG_FORMAT:
                        setCronError(errorMessages.wrongFormat.id);
                        break;
                    case RecurrenceFormCronErrorTypes.FREQUENCY_TOO_HIGH:
                        setCronError(errorMessages.frequencyTooHigh.id);
                        break;
                }
            } else {
                setCronError(null);
            }
        },
        [validate],
    );

    const accessibilityValue = "schedule.recurrence";

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
                    {!isCron && showRepeatTypeDescription ? (
                        <RepeatTypeDescription
                            repeatType={recurrenceType}
                            startDate={startDate}
                            weekStart={weekStart}
                            timezone={timezone}
                            showTimezone={showTimezoneInOccurrence}
                        />
                    ) : null}
                    {isCron ? (
                        <CronExpression
                            id={accessibilityValue}
                            expression={isInherit ? cronPlaceholder : cronValue}
                            onChange={handleChange}
                            allowHourlyRecurrence={allowHourlyRecurrence}
                            timezone={timezone}
                            showTimezone={showTimezoneInOccurrence}
                            validationError={cronError}
                            onBlur={handleOnBlur}
                            accessibilityConfig={{
                                ariaDescribedBy: RECURRENCE_CRON_HINT_ID,
                            }}
                            disabled={isInherit}
                        />
                    ) : null}
                </div>
            </div>
            {!isInherit ? (
                <CronExpressionSuggestion
                    id={RECURRENCE_CRON_HINT_ID}
                    validationError={cronError}
                    recurrenceType={recurrenceType}
                />
            ) : null}
        </>
    );
};
