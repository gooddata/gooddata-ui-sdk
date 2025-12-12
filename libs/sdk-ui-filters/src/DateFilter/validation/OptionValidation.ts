// (C) 2007-2025 GoodData Corporation
import { isAbsoluteDateFilterForm, isRelativeDateFilterForm } from "@gooddata/sdk-model";

import {
    type DateFilterOption,
    type IDateFilterAbsoluteDateTimeFormErrors,
    type IDateFilterOptionsByType,
    type IDateFilterRelativeFormErrors,
    type IExtendedDateFilterErrors,
    type IUiAbsoluteDateFilterForm,
    type IUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import { convertPlatformDateStringToDate } from "../utils/DateConversions.js";

const validateVisibility = (filterOption: DateFilterOption): IExtendedDateFilterErrors => {
    const errors: { [key in keyof IDateFilterOptionsByType]?: object } = {};
    if (!filterOption.visible) {
        // indicate that the Apply button should be disabled, it makes no sense for hidden forms
        errors[filterOption.type] = {};
    }
    return errors;
};

const setError = (
    errors: IExtendedDateFilterErrors,
    field: keyof IDateFilterAbsoluteDateTimeFormErrors,
): IExtendedDateFilterErrors => {
    return {
        ...errors,
        absoluteForm: {
            ...(errors.absoluteForm ?? {}),
            [field]: true,
        },
    };
};

// The responsibility to show specific errors and warnings is absolute date filter form component
// responsibility as the error states are hyper specific to the user input. Here we only check for issues that
// prevents form submitting.
const validateAbsoluteForm = (filterOption: IUiAbsoluteDateFilterForm): IExtendedDateFilterErrors => {
    let errors = validateVisibility(filterOption);

    if (filterOption.from === undefined) {
        errors = setError(errors, "invalidStartDate");
    }

    if (filterOption.to === undefined) {
        errors = setError(errors, "invalidEndDate");
    }

    // both dates are correct, lets proceed to checks that requires both dates
    if (errors.absoluteForm === undefined) {
        const start = convertPlatformDateStringToDate(filterOption.from) ?? 0;
        const end = convertPlatformDateStringToDate(filterOption.to) ?? 0;
        if (start > end) {
            errors = setError(errors, "startDateAfterEndDate");
        }
    }

    return errors.absoluteForm === undefined ? {} : errors;
};

const validateRelativeForm = (filterOption: IUiRelativeDateFilterForm): IExtendedDateFilterErrors => {
    const errors = validateVisibility(filterOption);
    const relativeFormKeys: Array<keyof IDateFilterRelativeFormErrors> = ["from", "to"];
    relativeFormKeys.forEach((field) => {
        if (filterOption[field] === undefined) {
            errors.relativeForm = errors.relativeForm || {};
            // There is no validation message as we have no place to show it
        }
    });
    return errors.relativeForm ? errors : {};
};

export const validateFilterOption = (filterOption: DateFilterOption): IExtendedDateFilterErrors => {
    if (isAbsoluteDateFilterForm(filterOption)) {
        return validateAbsoluteForm(filterOption);
    } else if (isRelativeDateFilterForm(filterOption)) {
        return validateRelativeForm(filterOption);
    } else {
        return validateVisibility(filterOption);
    }
};
