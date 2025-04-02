// (C) 2007-2025 GoodData Corporation
import {
    IExtendedDateFilterErrors,
    DateFilterOption,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
    IDateFilterOptionsByType,
    IDateFilterOptionChangedDetails,
    isAbsoluteDateFilterOptionChangedDetails,
    IAbsoluteDateFilterOptionChangedDetails,
    IDateFilterAbsoluteDateTimeFormErrors,
    IDateTimePickerErrors,
} from "../interfaces/index.js";
import { isAbsoluteDateFilterForm, isRelativeDateFilterForm } from "@gooddata/sdk-model";
import { convertPlatformDateStringToDate } from "../utils/DateConversions.js";
import { messages } from "../../locales.js";

const validateVisibility = (filterOption: DateFilterOption): IExtendedDateFilterErrors => {
    const errors: { [key in keyof IDateFilterOptionsByType]?: object } = {};
    if (!filterOption.visible) {
        // indicate that the Apply button should be disabled, it makes no sense for hidden forms
        errors[filterOption.type] = {};
    }
    return errors;
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

const setError = (
    errors: IExtendedDateFilterErrors,
    field: keyof IDateFilterAbsoluteDateTimeFormErrors,
    errorType: keyof IDateTimePickerErrors,
    errorId: string,
): IExtendedDateFilterErrors => {
    return {
        ...errors,
        absoluteForm: {
            ...(errors.absoluteForm ?? {}),
            [field]: {
                ...(errors.absoluteForm?.[field] ?? {}),
                [errorType]: errorId,
            },
        },
    };
};

const setDateError = (
    errors: IExtendedDateFilterErrors,
    field: keyof IDateFilterAbsoluteDateTimeFormErrors,
    errorId: string,
) => setError(errors, field, "dateError", errorId);

const setTimeError = (
    errors: IExtendedDateFilterErrors,
    field: keyof IDateFilterAbsoluteDateTimeFormErrors,
    errorId: string,
) => setError(errors, field, "timeError", errorId);

const validateStartAfterEnd = (
    errors: IExtendedDateFilterErrors,
    filterOption: IUiAbsoluteDateFilterForm,
    changeDetails: IAbsoluteDateFilterOptionChangedDetails | undefined,
) => {
    const start = convertPlatformDateStringToDate(filterOption.from);
    const end = convertPlatformDateStringToDate(filterOption.to);
    if (start > end) {
        if (changeDetails?.rangePosition === "from") {
            if (isSameDay(start, end)) {
                return setTimeError(errors, "from", messages.errorStartTimeAfterEndTime.id);
            }
            return setDateError(errors, "from", messages.errorStartDateAfterEndDate.id);
        } else {
            if (isSameDay(start, end)) {
                return setTimeError(errors, "to", messages.errorEndTimeBeforeStartTime.id);
            }
            return setDateError(errors, "to", messages.errorEndDateBeforeStartDate.id);
        }
    }
    return errors;
};

const validateAbsoluteForm = (
    filterOption: IUiAbsoluteDateFilterForm,
    changeDetails: IAbsoluteDateFilterOptionChangedDetails | undefined,
): IExtendedDateFilterErrors => {
    const parseError = changeDetails?.parseError;
    let errors = validateVisibility(filterOption);

    if (filterOption.from === undefined) {
        // the logic prioritizes "invalid" because "empty" is considered default when no details are provided
        errors = setDateError(
            errors,
            "from",
            parseError === "invalid" ? messages.errorInvalidStartDate.id : messages.errorEmptyStartDate.id,
        );
    }

    if (filterOption.to === undefined) {
        errors = setDateError(
            errors,
            "to",
            parseError === "invalid" ? messages.errorInvalidEndDate.id : messages.errorEmptyEndDate.id,
        );
    }

    // both dates are correct, lets proceed to checks that requires both dates
    if (errors.absoluteForm === undefined) {
        errors = validateStartAfterEnd(errors, filterOption, changeDetails);
    }

    return errors.absoluteForm === undefined ? {} : errors;
};

const validateRelativeForm = (filterOption: IUiRelativeDateFilterForm): IExtendedDateFilterErrors => {
    const errors = validateVisibility(filterOption);
    const relativeFormKeys: Array<keyof IExtendedDateFilterErrors["relativeForm"]> = ["from", "to"];
    relativeFormKeys.forEach((field) => {
        if (filterOption[field] === undefined) {
            errors.relativeForm = errors.relativeForm || {};
            // There is no validation message as we have no place to show it
        }
    });
    return errors.relativeForm ? errors : {};
};

export const validateFilterOption = (
    filterOption: DateFilterOption,
    changeDetails?: IDateFilterOptionChangedDetails,
): IExtendedDateFilterErrors => {
    if (isAbsoluteDateFilterForm(filterOption)) {
        return validateAbsoluteForm(
            filterOption,
            isAbsoluteDateFilterOptionChangedDetails(changeDetails) ? changeDetails : undefined,
        );
    } else if (isRelativeDateFilterForm(filterOption)) {
        return validateRelativeForm(filterOption);
    } else {
        return validateVisibility(filterOption);
    }
};
