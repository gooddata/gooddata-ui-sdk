// (C) 2020-2022 GoodData Corporation
import { IntlShape } from "react-intl";

import { DynamicSelectItem } from "../../DateFilter/DynamicSelect/types.js";
import { ISelectItemOption } from "../../DateFilter/Select/types.js";

const MAX_VALUE = 99_999;

const DEFAULT_ITEMS: ISelectItemOption<number>[] = [3, 5, 10, 15, 20, 25, 50, 100].map((value) => ({
    type: "option",
    value,
    label: `${value}`,
}));

const trimInput = (input: string) => input?.trim();

const matchNumericValues = (input: string) => /^[^-\d]*(-?\d+)(?:\s|$)/.exec(input);

const sanitizeNumericValue = (value: number, intl: IntlShape): DynamicSelectItem[] => {
    if (value < 1) {
        return [{ type: "error", label: intl.formatMessage({ id: "rankingFilter.valueTooSmall" }) }];
    } else if (value > MAX_VALUE) {
        return [{ type: "error", label: intl.formatMessage({ id: "rankingFilter.valueTooLarge" }) }];
    }
    return DEFAULT_ITEMS.filter((item) => item.label.toLowerCase().includes(value.toString()));
};

export const sanitizeCustomInput = (input: string): boolean =>
    input && matchNumericValues(input) && Number(input) > 0 && Number(input) <= MAX_VALUE;

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

    return [{ type: "error", label: intl.formatMessage({ id: "rankingFilter.valueTooSmall" }) }];
};
