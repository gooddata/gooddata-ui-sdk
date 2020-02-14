// (C) 2019 GoodData Corporation
import range = require("lodash/range");
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";
import { IMessageTranslator } from "../utils/Translations/Translators";
import { granularityIntlCodes } from "../constants/i18n";
import { DynamicSelectItem, DynamicSelectOption } from "./DynamicSelect";

import { getSelectableItems } from "../Select/utils";

export const DAY: ExtendedDateFilters.DateFilterGranularity = "GDC.time.date";
export const WEEK_US: ExtendedDateFilters.DateFilterGranularity = "GDC.time.week_us";
export const MONTH: ExtendedDateFilters.DateFilterGranularity = "GDC.time.month";
export const QUARTER: ExtendedDateFilters.DateFilterGranularity = "GDC.time.quarter";
export const YEAR: ExtendedDateFilters.DateFilterGranularity = "GDC.time.year";
export const GRANULARITIES: ExtendedDateFilters.DateFilterGranularity[] = [
    DAY,
    WEEK_US,
    MONTH,
    QUARTER,
    YEAR,
];

type InputCategory = "Empty" | "TooBig" | "Numeric" | "Textual";

interface IInputInfoBase {
    inputCategory: InputCategory;
}

interface IEmptyInputInfo extends IInputInfoBase {
    inputCategory: "Empty";
}

interface ITooBigInputInfo extends IInputInfoBase {
    inputCategory: "TooBig";
}

interface INumericInputInfo extends IInputInfoBase {
    inputCategory: "Numeric";
    isOnlyNumber: boolean;
    offset: number;
}

interface ITextualInputInfo extends IInputInfoBase {
    inputCategory: "Textual";
    trimmedValue: string;
}

type InputInfo = IEmptyInputInfo | ITooBigInputInfo | INumericInputInfo | ITextualInputInfo;

const emptyInputInfo: IEmptyInputInfo = {
    inputCategory: "Empty",
};

const tooBigInputInfo: ITooBigInputInfo = {
    inputCategory: "TooBig",
};

const granularityOffsetLimits: { [key in ExtendedDateFilters.DateFilterGranularity]: number } = {
    [DAY]: 365,
    [WEEK_US]: 104,
    [MONTH]: 60,
    [QUARTER]: 20,
    [YEAR]: 20,
};

const offsetMaxValue = 99_999;

const getTrimmedInput = (input: string) => input && input.trim();

const isOffsetReasonablyBig = (offset: number) => Math.abs(offset) <= offsetMaxValue;

const parseInput = (trimmedInput: string): InputInfo => {
    if (!trimmedInput) {
        return emptyInputInfo;
    }

    // matches only integers, we do not want to support floats
    const numericMatch = /^[^-\d]*(-?\d+)(?:\s|$)/.exec(trimmedInput);
    if (numericMatch) {
        const numericText = numericMatch[1];
        const numericValue = Number.parseInt(numericText, 10);
        return isOffsetReasonablyBig(numericValue)
            ? {
                  offset: numericValue,
                  isOnlyNumber: numericText === trimmedInput,
                  inputCategory: "Numeric",
              }
            : tooBigInputInfo;
    }

    return {
        inputCategory: "Textual",
        trimmedValue: trimmedInput,
    };
};

const getOption = (
    offset: number,
    granularity: ExtendedDateFilters.DateFilterGranularity,
    intl: IMessageTranslator,
): DynamicSelectOption => {
    const dateCode = granularityIntlCodes[granularity];
    const offsetCode = offset < 0 ? "history" : offset === 0 ? "today" : "future";

    return {
        type: "option",
        value: offset,
        label: intl.formatMessage(
            { id: `filters.floatingRange.option.${dateCode}.offset.${offsetCode}` },
            { offset, n: Math.abs(offset) },
        ),
    };
};

const getOptionsForOffsets = (
    offsets: number[],
    granularity: ExtendedDateFilters.DateFilterGranularity,
    intl: IMessageTranslator,
): DynamicSelectOption[] => offsets.map(offset => getOption(offset, granularity, intl));

const getDefaultOptions = (
    granularity: ExtendedDateFilters.DateFilterGranularity,
    intl: IMessageTranslator,
): DynamicSelectItem[] => {
    const optionRange = granularityOffsetLimits[granularity];
    const negativeOptions = getOptionsForOffsets(range(-optionRange, 0), granularity, intl);
    const positiveOptions = getOptionsForOffsets(range(1, optionRange + 1), granularity, intl);

    return [
        ...negativeOptions,
        { type: "separator" },
        getOption(0, granularity, intl),
        { type: "separator" },
        ...positiveOptions,
    ];
};

const getTooBigOptions = (intl: IMessageTranslator): DynamicSelectItem[] => [
    {
        type: "error",
        label: intl.formatMessage({ id: "filters.floatingRange.tooBig" }, { limit: offsetMaxValue }),
    },
];

const getNoMatchOptions = (intl: IMessageTranslator): DynamicSelectItem[] => [
    {
        type: "error",
        label: intl.formatMessage({ id: "filters.floatingRange.noMatch" }),
    },
];

const getOptionsByNumber = (
    offset: number,
    granularity: ExtendedDateFilters.DateFilterGranularity,
    intl: IMessageTranslator,
): DynamicSelectOption[] => {
    // for positive offsets, show the "ahead" option first
    // to allow power users to use positive numbers for "ahead" and negative for "ago"
    // and doing just -5 -> enter -> 5 -> enter to make the filter from 5 ago to 5 ahead
    const offsets = offset > 0 ? [offset, -offset] : [offset];
    return getOptionsForOffsets(offsets, granularity, intl);
};

const getFullTextOptions = (
    offset: number | undefined,
    granularity: ExtendedDateFilters.DateFilterGranularity,
    intl: IMessageTranslator,
): DynamicSelectOption[] => {
    const coreOffsets = [-1, 0, 1];
    const absOffset = Math.abs(offset);
    const offsets =
        offset !== undefined && absOffset > 1 ? [-absOffset, ...coreOffsets, absOffset] : coreOffsets;

    return getOptionsForOffsets(offsets, granularity, intl);
};

const getFullTextMatches = (
    trimmedInput: string,
    offset: number | undefined,
    granularity: ExtendedDateFilters.DateFilterGranularity,
    intl: IMessageTranslator,
): DynamicSelectItem[] => {
    const searchString = trimmedInput.toLowerCase();
    const matches = getFullTextOptions(offset, granularity, intl).filter(option =>
        option.label.toLowerCase().includes(searchString),
    );

    return matches.length > 0 ? matches : getNoMatchOptions(intl);
};

export const findRelativeDateFilterOptionByLabel = (
    options: DynamicSelectItem[],
    input: string,
): DynamicSelectOption | null => {
    const trimmedInput = getTrimmedInput(input);
    return getSelectableItems(options).find(option => option.label === trimmedInput);
};

export const findRelativeDateFilterOptionByValue = (
    options: DynamicSelectItem[],
    value: number,
): DynamicSelectOption | null => {
    return getSelectableItems(options).find(option => option.value === value);
};

export const getRelativeDateFilterItems = (
    input: string = "",
    granularity: ExtendedDateFilters.DateFilterGranularity = DAY,
    intl: IMessageTranslator,
): DynamicSelectItem[] => {
    const trimmedInput = getTrimmedInput(input);
    const inputInfo = parseInput(trimmedInput);

    switch (inputInfo.inputCategory) {
        case "Empty":
            return getDefaultOptions(granularity, intl);
        case "TooBig":
            return getTooBigOptions(intl);
        case "Textual":
            return getFullTextMatches(inputInfo.trimmedValue, undefined, granularity, intl);
        case "Numeric":
            const { offset, isOnlyNumber } = inputInfo;
            return isOnlyNumber
                ? getOptionsByNumber(offset, granularity, intl)
                : getFullTextMatches(trimmedInput, offset, granularity, intl);
    }
};
