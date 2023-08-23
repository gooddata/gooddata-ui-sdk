// (C) 2007-2023 GoodData Corporation
import { ClientColors, ClientFormatterFacade } from "@gooddata/number-formatter";
import { ISeparators } from "@gooddata/sdk-model";
import { IChartConfig } from "../../../../interfaces";
import { IFormattedHeadlineDataItem, IHeadlineDataItem } from "../../Headlines";
import isEmpty from "lodash/isEmpty";
import isNaN from "lodash/isNaN";

const DEFAULT_VALUE_WHEN_EMPTY = "–";
const INVALID_VALUE = "NaN";
const PERCENTAGE_VALUE_LIMIT = 999;

function formatValueToLabelWithColors(value: string | null, format: string, separators?: ISeparators) {
    const parsedNumber = ClientFormatterFacade.convertValue(value);

    // Based on the tests, when a format is not provided, we should refrain from formatting the value using the formatter, as the default format "#,##0.00" will be used.
    // Additionally, the test necessitates that the value should remain unformatted.
    if (!isEmpty(format)) {
        return ClientFormatterFacade.formatValue(parsedNumber, format, separators);
    }

    if (parsedNumber === null || parsedNumber === undefined) {
        return { formattedValue: "", colors: {} };
    } else {
        return { formattedValue: parsedNumber.toString(), colors: {} };
    }
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
    const { formattedValue: label, colors } = formatValueToLabelWithColors(
        item.value,
        item.format,
        separators,
    );

    const isValueEmpty = label === INVALID_VALUE || label === "";
    const value = isValueEmpty ? DEFAULT_VALUE_WHEN_EMPTY : label;

    const usedColors: ClientColors = isValueEmpty ? {} : colors;

    return {
        cssStyle: buildCssStyle(usedColors.color, usedColors.backgroundColor),
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
