// (C) 2007-2019 GoodData Corporation
import { colors2Object, INumberObject, ISeparators, numberFormat } from "@gooddata/numberjs";
import isNil = require("lodash/isNil");
import { customEscape } from "./chartOptionsBuilder";
import { percentFormatter } from "../../../helpers/utils";
import { IPointData } from "../../../interfaces/Config";

export function formatValueForTooltip(
    val: string | number,
    format: string,
    separators?: ISeparators,
): string {
    const formattedObject: INumberObject = colors2Object(numberFormat(val, format, undefined, separators));
    return customEscape(formattedObject.label);
}

export function getFormattedValueForTooltip(
    isDualChartWithRightAxis: boolean,
    stackMeasuresToPercent: boolean,
    point: IPointData,
    separators?: ISeparators,
    percentageValue?: number,
): string {
    const isNotStackToPercent =
        stackMeasuresToPercent === false || isNil(percentageValue) || isDualChartWithRightAxis;
    return isNotStackToPercent
        ? formatValueForTooltip(point.y, point.format, separators)
        : percentFormatter(percentageValue);
}
