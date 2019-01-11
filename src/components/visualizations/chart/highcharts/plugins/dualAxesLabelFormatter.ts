// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import head = require('lodash/head');
import last = require('lodash/last');
import { formatAsPercent, isInPercent } from '../customConfiguration';

const DEFAULT_LIMIT_LENGTH = 4; // length of '0.00' is 4
const DEFAULT_PADDING = 2;
const DEFAULT_SHALLOW_RANGE = 10;

/**
 * Get limit length to cut off value less than one
 * @param value
 */
function getLimitLength(value: number): number {
    const valueStr = value.toString();
    const isFloat = valueStr.indexOf('.') > 0;
    const length = isFloat ? valueStr.length : valueStr.length + 1;
    return length + DEFAULT_PADDING;
}

function isValueInShallowRange(min: number, max: number): boolean {
    return min !== max && Math.abs(max - min) < DEFAULT_SHALLOW_RANGE;
}

/**
 * Format value in shallow range
 * value=0.000375, min=0,   max=0.001  => 0.00037 (length = length of max + padding)
 * value=0.0125,   min=0,   max=0.1    => 0.012   (length = length of max + padding)
 * value=0.13125,  min=0,   max=1      => 0.13    (length = default length)
 * value=11.13125, min=11,  max=12     => 11.13   (length = length of max + padding + 1)
 *
 * @param value
 * @param min
 * @param max
 */
export function formatValueInShallowRange(value: number, min: number, max: number): number {
    const limitLength = Math.max(getLimitLength(min), getLimitLength(max), DEFAULT_LIMIT_LENGTH);
    const newValue = value.toString().substr(0, limitLength);
    return parseFloat(newValue);
}

export function removeDecimal(value: string): string {
    const decimalPos = value.indexOf('.');
    if (decimalPos === -1) {
        return value;
    }

    const length = value.length;
    const endIndex = decimalPos + 2;
    if (decimalPos <= 3 && length >= endIndex) {
        return value.substring(0, decimalPos + 2);
    }

    return value.substring(0, decimalPos); // 1000.10000000 -> 1000
}

export function roundNumber(value: string, min: number, max: number): number {
    const zeroLength = getZeroLength(min, max);
    const valueNum = parseFloat(value);
    if (zeroLength <= 2) {
        return valueNum;
    }

    const zeros = Array.apply(null, { length: zeroLength - 1 }).reduce((result: string) => {
        return result + '0';
    }, '');
    const numberWithZero = parseInt(`1${zeros}`, 10);

    return Math.round(valueNum / numberWithZero) * numberWithZero;
}

function getZeroLength(min: number, max: number): number {
    const sub = Math.abs(Math.ceil(max) - Math.floor(min));
    let length = `${sub}`.length;

    // 01 -> 99: not need to round number
    if (length <= 2) {
        return 0;
    }

    if (length % 3 === 0) { // 100000 -> length = 6, should minus one unit
        length -= 1;
    }

    return Math.floor(length / 3) * 3;
}

function formatLabel(value: number, tickPositions: number[]): number {
    const min = head(tickPositions);
    const max = last(tickPositions);

    if (isValueInShallowRange(min, max)) {
        return formatValueInShallowRange(value, min, max);
    }
    const numberStr = removeDecimal(value.toString());
    return roundNumber(numberStr, min, max);
}

export function dualAxesLabelFormatter() {
    const tickPositions: number[] = get(this, 'axis.tickPositions', []);
    this.value = formatLabel(this.value, tickPositions);

    const stackMeasuresToPercent = get(this, 'chart.userOptions.stackMeasuresToPercent', false);
    if (stackMeasuresToPercent) {
        const opposite = get(this, 'axis.opposite', false);
        if (opposite === false) {
            return formatAsPercent.call(this, 1);
        }
    }

    const format = get(this, 'axis.userOptions.defaultFormat', '');
    const isPercent = isInPercent(format);

    return isPercent ?
        formatAsPercent.call(this) : // 100%
        this.axis.defaultLabelFormatter.call(this); // 1000 -> 1k, 1500000 -> 1.5M
}
