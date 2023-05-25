// (C) 2007-2020 GoodData Corporation
import { colors2Object, ISeparators, numberFormat } from "@gooddata/numberjs";
import { IChartConfig } from "../../../../interfaces/index.js";
import { IFormattedHeadlineDataItem, IHeadlineDataItem } from "../../Headlines.js";
import isEmpty from "lodash/isEmpty.js";
import isNaN from "lodash/isNaN.js";

const DEFAULT_VALUE_WHEN_EMPTY = "–";
const INVALID_VALUE = "NaN";
const PERCENTAGE_VALUE_LIMIT = 999;

function processStringForNumberJs(value: string | null, format: string) {
    return value === null && !isEmpty(format)
        ? "" // return empty string for null value for number.js to apply [=null] format
        : parseFloat(value as string);
}

function formatValueToLabelWithColors(value: string | null, format: string, separators?: ISeparators) {
    const processedValue = processStringForNumberJs(value, format);
    const formattedValue = numberFormat(processedValue, format, undefined, separators);
    return colors2Object(formattedValue);
}

function buildCssStyle(color?: string, backgroundColor?: string) {
    const style: any = {};
    if (color !== undefined) {
        style.color = color;
    }
    if (backgroundColor !== undefined) {
        style.backgroundColor = backgroundColor;
    }
    return style;
}

/**
 * Format {@link IHeadlineDataItem} value.
 *
 * The method processes the provided item and returns object with value that can be rendered as it is and 'cssStyle'
 * object that can be passed into the react element 'style' attribute.
 */
export function formatItemValue(
    item: IHeadlineDataItem,
    config: IChartConfig = {},
): IFormattedHeadlineDataItem {
    const { separators } = config;
    const { label, color, backgroundColor } = formatValueToLabelWithColors(
        item.value,
        item.format,
        separators,
    );
    const isValueEmpty = label === INVALID_VALUE || label === "";
    const value = isValueEmpty ? DEFAULT_VALUE_WHEN_EMPTY : label;
    return {
        cssStyle: buildCssStyle(color, backgroundColor),
        value,
        isValueEmpty,
    };
}

/**
 * The method processes the provided IHeadlineDataItem and returns object with formatted value and isValueEmpty flag.
 *
 * Formatted value conditions:
 *  - value is rounded to Integer
 *  - shows `>999%` when value is above the limit
 *  - shows `<-999%` when value is below the limit
 *  - otherwise shows 'value%'
 */
export function formatPercentageValue(item: IHeadlineDataItem): IFormattedHeadlineDataItem {
    if (!item || item.value === null || isNaN(parseFloat(item.value))) {
        return {
            value: DEFAULT_VALUE_WHEN_EMPTY,
            isValueEmpty: true,
        };
    }

    const roundedNumber = Math.round(parseFloat(item.value));

    const isOverLimit = roundedNumber > PERCENTAGE_VALUE_LIMIT;
    const isUnderLimit = roundedNumber < -PERCENTAGE_VALUE_LIMIT;

    let formattedValue = `${roundedNumber}%`;
    if (isOverLimit) {
        formattedValue = `>${PERCENTAGE_VALUE_LIMIT}%`;
    } else if (isUnderLimit) {
        formattedValue = `<-${PERCENTAGE_VALUE_LIMIT}%`;
    }

    return {
        value: formattedValue,
        isValueEmpty: false,
    };
}
