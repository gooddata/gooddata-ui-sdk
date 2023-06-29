// (C) 2019-2022 GoodData Corporation
import range from "lodash/range.js";
import { IMessageTranslator } from "../utils/Translations/Translators.js";
import { granularityIntlCodes } from "../constants/i18n.js";
import { getSelectableItems } from "../Select/utils.js";
import { DynamicSelectItem, DynamicSelectOption } from "./types.js";
import { DateFilterGranularity } from "@gooddata/sdk-model";
import { messages } from "../../locales.js";

export const MINUTE: DateFilterGranularity = "GDC.time.minute";
export const HOUR: DateFilterGranularity = "GDC.time.hour";
export const DAY: DateFilterGranularity = "GDC.time.date";
export const WEEK_US: DateFilterGranularity = "GDC.time.week_us";
export const MONTH: DateFilterGranularity = "GDC.time.month";
export const QUARTER: DateFilterGranularity = "GDC.time.quarter";
export const YEAR: DateFilterGranularity = "GDC.time.year";

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

const granularityOffsetLimits: { [key in DateFilterGranularity]: number } = {
    [MINUTE]: 120,
    [HOUR]: 48,
    [DAY]: 365,
    [WEEK_US]: 104,
    [MONTH]: 60,
    [QUARTER]: 20,
    [YEAR]: 20,
};

const offsetMaxValue = 99_999;

const getTrimmedInput = (input: string) => input?.trim();

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
    granularity: DateFilterGranularity,
    intl: IMessageTranslator,
): DynamicSelectOption => {
    const dateCode = granularityIntlCodes[granularity];
    const offsetCode = offset < 0 ? "history" : offset === 0 ? "today" : "future";

    return {
        type: "option",
        value: offset,
        label: intl.formatMessage(messages[`${dateCode}_${offsetCode}`], { offset, n: Math.abs(offset) }),
    };
};

const getOptionsForOffsets = (
    offsets: number[],
    granularity: DateFilterGranularity,
    intl: IMessageTranslator,
): DynamicSelectOption[] => offsets.map((offset) => getOption(offset, granularity, intl));

const getDefaultOptions = (
    granularity: DateFilterGranularity,
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
    granularity: DateFilterGranularity,
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
    granularity: DateFilterGranularity,
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
    granularity: DateFilterGranularity,
    intl: IMessageTranslator,
): DynamicSelectItem[] => {
    const searchString = trimmedInput.toLowerCase();
    const matches = getFullTextOptions(offset, granularity, intl).filter((option) =>
        option.label.toLowerCase().includes(searchString),
    );

    return matches.length > 0 ? matches : getNoMatchOptions(intl);
};

export const findRelativeDateFilterOptionByLabel = (
    options: DynamicSelectItem[],
    input: string,
): DynamicSelectOption | null => {
    const trimmedInput = getTrimmedInput(input);
    return getSelectableItems(options).find((option) => option.label === trimmedInput);
};

export const findRelativeDateFilterOptionByValue = (
    options: DynamicSelectItem[],
    value: number,
): DynamicSelectOption | null => {
    return getSelectableItems(options).find((option) => option.value === value);
};

export function getRelativeDateFilterItems(
    input: string = "",
    granularity: DateFilterGranularity = DAY,
    intl: IMessageTranslator,
): DynamicSelectItem[] {
    const trimmedInput = getTrimmedInput(input);
    const inputInfo = parseInput(trimmedInput);

    switch (inputInfo.inputCategory) {
        case "Empty":
            return getDefaultOptions(granularity, intl);
        case "TooBig":
            return getTooBigOptions(intl);
        case "Textual":
            return getFullTextMatches(inputInfo.trimmedValue, undefined, granularity, intl);
        case "Numeric": {
            const { offset, isOnlyNumber } = inputInfo;
            return isOnlyNumber
                ? getOptionsByNumber(offset, granularity, intl)
                : getFullTextMatches(trimmedInput, offset, granularity, intl);
        }
    }
}
