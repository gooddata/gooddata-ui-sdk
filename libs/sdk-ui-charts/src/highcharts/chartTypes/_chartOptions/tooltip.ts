// (C) 2007-2025 GoodData Corporation
import { isEmpty } from "lodash-es";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { type ISeparators } from "@gooddata/sdk-model";

import { type IUnsafeHighchartsTooltipPoint } from "../../typings/unsafe.js";
import { customEscape, percentFormatter } from "../_util/common.js";

export function formatValueForTooltip(
    value: string | number,
    format: string,
    separators?: ISeparators,
): string {
    const parsedNumber = ClientFormatterFacade.convertValue(value);

    // Based on the tests, when a format is not provided, we should refrain from formatting the value using the formatter, as the default format "#,##0.00" will be used.
    // Additionally, the test necessitates that the value should remain unformatted.
    if (!isEmpty(format)) {
        const result = ClientFormatterFacade.formatValue(parsedNumber, format, separators);
        return customEscape(result.formattedValue);
    }

    if (parsedNumber === null || parsedNumber === undefined) {
        return "";
    } else {
        return parsedNumber.toString();
    }
}

export function getFormattedValueForTooltip(
    isDualChartWithRightAxis: boolean,
    stackMeasuresToPercent: boolean,
    point: IUnsafeHighchartsTooltipPoint,
    separators?: ISeparators,
    percentageValue?: number,
): string {
    const { target, y, low, high } = point;

    if (!(low === null || low === undefined) && !(high === null || high === undefined)) {
        const lowValue = getFormattedValue(
            isDualChartWithRightAxis,
            stackMeasuresToPercent,
            point,
            low,
            separators,
            percentageValue,
        );
        const highValue = getFormattedValue(
            isDualChartWithRightAxis,
            stackMeasuresToPercent,
            point,
            high,
            separators,
            percentageValue,
        );

        return `${lowValue} - ${highValue}`;
    }

    return getFormattedValue(
        isDualChartWithRightAxis,
        stackMeasuresToPercent,
        point,
        target ?? y,
        separators,
        percentageValue,
    );
}

function getFormattedValue(
    isDualChartWithRightAxis: boolean,
    stackMeasuresToPercent: boolean,
    point: IUnsafeHighchartsTooltipPoint,
    value: number,
    separators?: ISeparators,
    percentageValue?: number,
) {
    const { format } = point;
    const isNotStackToPercent =
        stackMeasuresToPercent === false ||
        percentageValue === null ||
        percentageValue === undefined ||
        isDualChartWithRightAxis;
    return isNotStackToPercent
        ? formatValueForTooltip(value, format, separators)
        : percentFormatter(percentageValue, format);
}
