// (C) 2025 GoodData Corporation

import { useState } from "react";

import {
    IDateTimePickerErrors,
    IDateFilterAbsoluteDateTimeFormErrors,
    IExtendedDateFilterErrors,
} from "../interfaces/index.js";
import { messages } from "../../locales.js";

import { DateParseError, ChangeSource } from "./types.js";

type DateRangePosition = "from" | "to";

type FieldError = "date_empty" | "date_invalid" | "date_before" | "time_before";

const getFieldKey = (fieldError: FieldError): keyof IDateTimePickerErrors => {
    if (["date_empty", "date_invalid", "date_before"].includes(fieldError)) {
        return "dateError";
    }
    if (fieldError === "time_before") {
        return "timeError";
    }
    return undefined;
};

const getErrorMessageId = (fieldError: FieldError, position: DateRangePosition): string => {
    switch (fieldError) {
        case "date_empty":
            return position === "from" ? messages.errorEmptyStartDate.id : messages.errorEmptyEndDate.id;
        case "date_invalid":
            return position === "from" ? messages.errorInvalidStartDate.id : messages.errorInvalidEndDate.id;
        case "date_before":
            return position === "from"
                ? messages.errorStartDateAfterEndDate.id
                : messages.errorEndDateBeforeStartDate.id;
        case "time_before":
            return position === "from"
                ? messages.errorStartTimeAfterEndTime.id
                : messages.errorEndTimeBeforeStartTime.id;
        default:
            return undefined;
    }
};

const setFieldError = (
    errors: IDateTimePickerErrors,
    fieldKey: keyof IDateTimePickerErrors,
    errorMessageId: string,
) => ({
    ...errors,
    [fieldKey]: errorMessageId,
});

const setError = (
    errors: IDateFilterAbsoluteDateTimeFormErrors,
    position: DateRangePosition,
    error: FieldError,
): IDateFilterAbsoluteDateTimeFormErrors => {
    const fieldKey = getFieldKey(error);
    const errorMessageId = getErrorMessageId(error, position);
    return {
        from: position === "from" ? setFieldError(errors.from, fieldKey, errorMessageId) : errors.from,
        to: position === "to" ? setFieldError(errors.to, fieldKey, errorMessageId) : errors.to,
    };
};

const unsetFieldError = (errors: IDateTimePickerErrors, fieldKeys: Array<keyof IDateTimePickerErrors>) =>
    fieldKeys.reduce((acc, key) => ({ ...acc, [key]: undefined }), { ...errors });

const unsetError = (
    errors: IDateFilterAbsoluteDateTimeFormErrors,
    position: DateRangePosition,
    fieldKeys: Array<keyof IDateTimePickerErrors> | keyof IDateTimePickerErrors,
): IDateFilterAbsoluteDateTimeFormErrors => {
    const keys = Array.isArray(fieldKeys) ? fieldKeys : [fieldKeys];
    return {
        from: position === "from" ? unsetFieldError(errors.from, keys) : errors.from,
        to: position === "to" ? unsetFieldError(errors.to, keys) : errors.to,
    };
};

const isSameDay = (d1: Date, d2: Date): boolean => {
    return (
        !!d1 &&
        !!d2 &&
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

export const useErrorValidation = () => {
    const [errors, setErrors] = useState<IExtendedDateFilterErrors["absoluteDateTimeForm"] | undefined>({
        from: {},
        to: {},
    });

    const validateDateField = (
        startDate: Date,
        endDate: Date,
        position: DateRangePosition,
        _source: ChangeSource,
        parseError?: DateParseError,
    ) => {
        const isRangeFromSameDay = isSameDay(startDate, endDate);
        if (parseError) {
            setErrors(setError(errors, position, parseError === "empty" ? "date_empty" : "date_invalid"));
            return;
        }
        if (startDate < endDate) {
            const modifiedDate = position === "from" ? startDate : endDate;
            const otherDate = position === "from" ? endDate : startDate;

            const sanitizedPositionErrors = modifiedDate
                ? unsetError(errors, position, ["dateError", "timeError"])
                : errors;
            const reversedPosition = position === "from" ? "to" : "from";
            const sanitizedReversedPositionErrors = otherDate
                ? unsetError(sanitizedPositionErrors, reversedPosition, ["dateError", "timeError"])
                : sanitizedPositionErrors;
            setErrors(sanitizedReversedPositionErrors);
        } else {
            const sanitizedErrors = unsetError(errors, position === "from" ? "to" : "from", [
                "dateError",
                "timeError",
            ]);
            setErrors(
                setError(sanitizedErrors, position, isRangeFromSameDay ? "time_before" : "date_before"),
            );
        }
    };

    const validateFromField = (
        newStartDate: Date,
        previousEndDate: Date,
        source: ChangeSource,
        parseError?: DateParseError,
    ) => {
        validateDateField(newStartDate, previousEndDate, "from", source, parseError);
    };

    const validateToField = (
        previousStartDate: Date,
        newEndDate: Date,
        source: ChangeSource,
        parseError?: DateParseError,
    ) => {
        validateDateField(previousStartDate, newEndDate, "to", source, parseError);
    };

    const clearError = (
        position: DateRangePosition,
        fieldKeys: Array<keyof IDateTimePickerErrors> | keyof IDateTimePickerErrors,
    ) => {
        setErrors((errors) => unsetError(errors, position, fieldKeys));
    };

    const onInputMarkedValid = (
        startDate: Date,
        endDate: Date,
        source: ChangeSource,
        editedField: DateRangePosition,
        otherField: DateRangePosition,
    ) => {
        clearError(editedField, source === "date" ? ["dateError", "timeError"] : ["timeError"]);

        if (startDate < endDate) {
            clearError(otherField, ["dateError", "timeError"]);
        }
    };

    const onFromInputMarkedValid = (newStartDate: Date, previousEndDate: Date, source: ChangeSource) => {
        onInputMarkedValid(newStartDate, previousEndDate, source, "from", "to");
    };

    const onToInputMarkedValid = (previousStartDate: Date, newEndDate: Date, source: ChangeSource) => {
        onInputMarkedValid(previousStartDate, newEndDate, source, "to", "from");
    };

    return {
        errors,
        validateFromField,
        validateToField,
        clearError,
        onFromInputMarkedValid,
        onToInputMarkedValid,
    };
};
