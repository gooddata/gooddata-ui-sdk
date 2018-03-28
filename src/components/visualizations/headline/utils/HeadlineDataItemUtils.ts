// (C) 2007-2018 GoodData Corporation
import { colors2Object, numberFormat } from '@gooddata/numberjs';
import isEmpty = require('lodash/isEmpty');
import { IFormattedHeadlineDataItem, IHeadlineDataItem } from '../../../../interfaces/Headlines';

const DEFAULT_VALUE_WHEN_EMPTY = '–';
const INVALID_VALUE = 'NaN';

function processStringForNumberJs(value: string | null, format: string) {
    return value === null && !isEmpty(format)
        ? '' // return empty string for null value for number.js to apply [=null] format
        : parseFloat(value as string);
}

function formatValueToLabelWithColors(value: string | null, format: string) {
    const processedValue = processStringForNumberJs(value, format);
    const formattedValue = numberFormat(processedValue, format);
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
 * Format {HeadlineData} value.
 *
 * The method processes the provided item and returns object with value that can be rendered as it is and 'cssStyle'
 * object that can be passed into the react element 'style' attribute.
 *
 * @param item
 * @returns {{cssStyle: {color, backgroundColor}, value: string, isValueEmpty: boolean}}
 */
export default function formatItemValue(item: IHeadlineDataItem): IFormattedHeadlineDataItem {
    const { label, color, backgroundColor } = formatValueToLabelWithColors(item.value, item.format);
    const isValueEmpty = label === INVALID_VALUE || label === '';
    const value = isValueEmpty
        ? DEFAULT_VALUE_WHEN_EMPTY
        : label;
    return {
        cssStyle: buildCssStyle(color, backgroundColor),
        value,
        isValueEmpty
    };
}
