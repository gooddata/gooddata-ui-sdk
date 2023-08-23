// (C) 2019-2020 GoodData Corporation
import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { ISeparators } from "@gooddata/sdk-model";
import escape from "lodash/escape";
import unescape from "lodash/unescape";

const customEscape = (str: string) => str && escape(unescape(str));

export function formatValueForTooltip(
    val: string | number,
    format: string | undefined,
    separators?: ISeparators,
): string {
    if (!format) {
        return `${val}`;
    }

    const convertedValue = ClientFormatterFacade.convertValue(val);

    const { formattedValue } = ClientFormatterFacade.formatValue(convertedValue, format, separators);

    return customEscape(formattedValue);
}

export function getTooltipContentWidth(
    isFullScreenTooltip: boolean,
    chartWidth: number,
    tooltipMaxWidth: number,
): number {
    return isFullScreenTooltip ? chartWidth : Math.min(chartWidth, tooltipMaxWidth);
}
