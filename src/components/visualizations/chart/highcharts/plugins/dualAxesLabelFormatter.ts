// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import head = require('lodash/head');
import last = require('lodash/last');
import { formatAsPercent, isInPercent } from '../customConfiguration';

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
    const numberStr = removeDecimal(value.toString());
    return roundNumber(numberStr, head(tickPositions), last(tickPositions));
}

export function dualAxesLabelFormatter() {
    const tickPositions: number[] = get(this, 'axis.tickPositions', []);
    this.value = formatLabel(this.value, tickPositions);

    const format = get(this, 'axis.userOptions.defaultFormat', '');
    const isPercent = isInPercent(format);

    return isPercent ?
        formatAsPercent.call(this) : // 100%
        this.axis.defaultLabelFormatter.call(this); // 1000 -> 1k, 1500000 -> 1.5M
}
