// (C) 2007-2019 GoodData Corporation
import { ExtendedDateFilters, IExtendedDateFilterErrors } from "../interfaces/ExtendedDateFilters";

const validateVisibility = (
    filterOption: ExtendedDateFilters.DateFilterOption,
): IExtendedDateFilterErrors => {
    const errors: IExtendedDateFilterErrors = {};
    if (!filterOption.visible) {
        // indicate that the Apply button should be disabled, it makes no sense for hidden forms
        errors[filterOption.type] = {};
    }
    return errors;
};

const validateAbsoluteForm = (
    filterOption: ExtendedDateFilters.IAbsoluteDateFilterForm,
): IExtendedDateFilterErrors => {
    const errors = validateVisibility(filterOption);
    const absoluteFormKeys: Array<keyof IExtendedDateFilterErrors["absoluteForm"]> = ["from", "to"];
    absoluteFormKeys.forEach(field => {
        if (!filterOption[field]) {
            errors.absoluteForm = errors.absoluteForm || {};
            // null means empty, undefined means invalid
            // this is dictated by react-day-picker that returns undefined on invalid values
            if (filterOption[field] === undefined) {
                errors.absoluteForm[field] = "filters.staticPeriod.incorrectFormat";
            }
        }
    });
    return errors.absoluteForm ? errors : {};
};

const validateRelativeForm = (
    filterOption: ExtendedDateFilters.IRelativeDateFilterForm,
): IExtendedDateFilterErrors => {
    const errors = validateVisibility(filterOption);
    const relativeFormKeys: Array<keyof IExtendedDateFilterErrors["relativeForm"]> = ["from", "to"];
    relativeFormKeys.forEach(field => {
        if (filterOption[field] === undefined) {
            errors.relativeForm = errors.relativeForm || {};
            // There is no validation message as we have no place to show it
        }
    });
    return errors.relativeForm ? errors : {};
};

export const validateFilterOption = (
    filterOption: ExtendedDateFilters.DateFilterOption,
): IExtendedDateFilterErrors => {
    if (ExtendedDateFilters.isAbsoluteDateFilterForm(filterOption)) {
        return validateAbsoluteForm(filterOption);
    } else if (ExtendedDateFilters.isRelativeDateFilterForm(filterOption)) {
        return validateRelativeForm(filterOption);
    } else {
        return validateVisibility(filterOption);
    }
};
