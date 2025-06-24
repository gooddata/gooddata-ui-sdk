// (C) 2024-2025 GoodData Corporation

import { useCallback, useState } from "react";
import * as cronParser from "cron-parser";
import { isCronExpressionValid } from "./utils/utils.js";
import { defineMessages } from "react-intl";

export enum RecurrenceFormCronErrorTypes {
    EMPTY = "EMPTY",
    WRONG_FORMAT = "WRONG_FORMAT",
    FREQUENCY_TOO_HIGH = "FREQUENCY_TOO_HIGH",
}

const errorMessages = defineMessages({
    empty: { id: "recurrence.error.empty" },
    wrongFormat: { id: "recurrence.error.wrongFormat" },
    frequencyTooHigh: { id: "recurrence.error.too_often" },
});

interface IUseCronValidationProps {
    allowHourlyRecurrence: boolean;
    onCronValueChange: (cronValue: string, isValid: boolean) => void;
}

interface UseCronValidationResult {
    cronError: string | null;
    handleOnBlur: (value: string) => void;
    handleChange: (expression: string) => void;
}

const getErrorMessage = (errorType: RecurrenceFormCronErrorTypes): string => {
    switch (errorType) {
        case RecurrenceFormCronErrorTypes.EMPTY:
            return errorMessages.empty.id;
        case RecurrenceFormCronErrorTypes.WRONG_FORMAT:
            return errorMessages.wrongFormat.id;
        case RecurrenceFormCronErrorTypes.FREQUENCY_TOO_HIGH:
            return errorMessages.frequencyTooHigh.id;
        default:
            return "";
    }
};

export const useCronValidation = (props: IUseCronValidationProps): UseCronValidationResult => {
    const { allowHourlyRecurrence, onCronValueChange } = props;
    const [cronError, setCronError] = useState<string | null>(null);

    const parseCron = useCallback((expression: string): boolean => {
        try {
            cronParser.CronExpressionParser.parse(expression);
            return true;
        } catch {
            return false;
        }
    }, []);

    const validate = useCallback(
        (expression: string) => {
            const trimmedCronExpression = expression.trim();
            const parts = expression.split(/\s+/).filter(Boolean);

            if (trimmedCronExpression.length === 0) {
                return RecurrenceFormCronErrorTypes.EMPTY;
            }

            if (parts.length !== 6) {
                return RecurrenceFormCronErrorTypes.WRONG_FORMAT;
            }

            const isValidCron = parseCron(expression);
            if (!isValidCron) {
                return RecurrenceFormCronErrorTypes.WRONG_FORMAT;
            }

            const isValid = isCronExpressionValid(expression, allowHourlyRecurrence);
            if (!isValid) {
                return RecurrenceFormCronErrorTypes.FREQUENCY_TOO_HIGH;
            }

            return null;
        },
        [allowHourlyRecurrence, parseCron],
    );

    const handleValidation = useCallback(
        (expression: string) => {
            const validationResult = validate(expression);
            setCronError(validationResult ? getErrorMessage(validationResult) : null);
            return !validationResult;
        },
        [validate],
    );

    const handleChange = useCallback(
        (expression: string) => {
            const validationResult = validate(expression);

            if (cronError) {
                setCronError(validationResult ? getErrorMessage(validationResult) : null);
            }

            onCronValueChange(expression, !validationResult);
        },
        [cronError, validate, onCronValueChange],
    );

    const handleOnBlur = useCallback(
        (value: string) => {
            handleValidation(value);
        },
        [handleValidation],
    );

    return {
        cronError,
        handleOnBlur,
        handleChange,
    };
};
