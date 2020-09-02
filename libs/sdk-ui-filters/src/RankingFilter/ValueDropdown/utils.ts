// (C) 2020 GoodData Corporation
import { DynamicSelectItem } from "../../DateFilter/DynamicSelect/types";
import { IntlShape } from "react-intl";

const MAX_VALUE = 99_999;

const DEFAULT_ITEMS: DynamicSelectItem[] = [3, 5, 10, 15, 20, 25, 50, 100].map((value) => ({
    type: "option",
    value,
    label: `${value}`,
}));

const trimInput = (input: string) => input && input.trim();

const matchNumericValues = (input: string) => /^[^-\d]*(-?\d+)(?:\s|$)/.exec(input);

const sanitizeNumericValue = (value: number, intl: IntlShape): DynamicSelectItem[] => {
    if (value < 1) {
        return [{ type: "error", label: intl.formatMessage({ id: "rankingFilter.valueTooSmall" }) }];
    } else if (value > MAX_VALUE) {
        return [{ type: "error", label: intl.formatMessage({ id: "rankingFilter.valueTooLarge" }) }];
    }

    return [{ type: "option", value: value, label: `${value}` }];
};

export const sanitizeInput = (input: string, intl: IntlShape): DynamicSelectItem[] => {
    if (!input) {
        return DEFAULT_ITEMS;
    }

    const trimmedInput = trimInput(input);
    const numericMatch = matchNumericValues(trimmedInput);

    if (numericMatch) {
        const numericText = numericMatch[1];
        const numericValue = Number.parseInt(numericText, 10);
        return sanitizeNumericValue(numericValue, intl);
    }

    return [{ type: "error", label: intl.formatMessage({ id: "rankingFilter.noMatch" }) }];
};
