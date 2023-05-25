// (C) 2019-2020 GoodData Corporation
import { colors2Object, INumberObject, numberFormat } from "@gooddata/numberjs";
import { ISeparators } from "@gooddata/sdk-ui";
import escape from "lodash/escape.js";
import unescape from "lodash/unescape.js";

const customEscape = (str: string) => str && escape(unescape(str));

export function formatValueForTooltip(
    val: string | number,
    format: string | undefined,
    separators?: ISeparators,
): string {
    if (!format) {
        return `${val}`;
    }

    const formattedObject: INumberObject = colors2Object(numberFormat(val, format, undefined, separators));
    return customEscape(formattedObject.label);
}

export function getTooltipContentWidth(
    isFullScreenTooltip: boolean,
    chartWidth: number,
    tooltipMaxWidth: number,
): number {
    return isFullScreenTooltip ? chartWidth : Math.min(chartWidth, tooltipMaxWidth);
}
