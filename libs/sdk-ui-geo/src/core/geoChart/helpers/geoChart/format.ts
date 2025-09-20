// (C) 2019-2025 GoodData Corporation
import { escape, unescape } from "lodash-es";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { ISeparators } from "@gooddata/sdk-model";

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
