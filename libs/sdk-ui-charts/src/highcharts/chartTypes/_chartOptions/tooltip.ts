// (C) 2007-2022 GoodData Corporation
import { ClientFormatterFacade } from "@gooddata/number-formatter";
import isEmpty from "lodash/isEmpty";
import { ISeparators } from "@gooddata/sdk-model";
import { customEscape, percentFormatter } from "../_util/common";
import isNil from "lodash/isNil";
import { IUnsafeHighchartsTooltipPoint } from "../../typings/unsafe";

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
    const { target, y, format } = point;
    const isNotStackToPercent =
        stackMeasuresToPercent === false || isNil(percentageValue) || isDualChartWithRightAxis;
    return isNotStackToPercent
        ? formatValueForTooltip(target ?? y, format, separators)
        : percentFormatter(percentageValue, format);
}
