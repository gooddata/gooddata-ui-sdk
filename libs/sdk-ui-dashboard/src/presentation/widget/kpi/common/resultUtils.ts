// (C) 2022-2023 GoodData Corporation
import { IntlShape } from "react-intl";
import isNil from "lodash/isNil.js";
import isNumber from "lodash/isNumber.js";
import round from "lodash/round.js";
import {
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    ISeparators,
    isMeasureFormatInPercent,
    measureLocalId,
} from "@gooddata/sdk-model";
import { createNumberJsFormatter, DataViewFacade, IDataSeries } from "@gooddata/sdk-ui";
import { IKpiAlertResult, IKpiResult } from "./types.js";

function getSeriesResult(series: IDataSeries | undefined): number | null {
    if (!series) {
        return null;
    }

    const value = series.dataPoints()[0].rawValue;

    if (isNil(value)) {
        return null;
    }

    if (isNumber(value)) {
        return value;
    }

    return Number.parseFloat(value);
}

function getNoDataKpiResult(
    result: DataViewFacade | undefined,
    primaryMeasure: IMeasure,
): IKpiResult | undefined {
    if (!result) {
        return;
    }

    return {
        measureDescriptor: result.meta().measureDescriptor(measureLocalId(primaryMeasure)),
        measureFormat: result.meta().measureDescriptor(measureLocalId(primaryMeasure))?.measureHeaderItem
            ?.format,
        measureResult: undefined,
        measureForComparisonResult: undefined,
    };
}

function getKpiResultInner(
    result: DataViewFacade | undefined,
    primaryMeasure: IMeasure,
    secondaryMeasure:
        | IMeasure<IPoPMeasureDefinition>
        | IMeasure<IPreviousPeriodMeasureDefinition>
        | undefined,
    separators: ISeparators,
): IKpiResult | undefined {
    const series = result?.data({ valueFormatter: createNumberJsFormatter(separators) }).series();
    const primarySeries = series?.firstForMeasure(primaryMeasure);

    if (secondaryMeasure && result?.meta().measureDescriptors().length !== 2) {
        return undefined;
    }

    const secondarySeries = secondaryMeasure ? series?.firstForMeasure(secondaryMeasure) : undefined;

    return primarySeries
        ? {
              measureDescriptor: primarySeries.descriptor.measureDescriptor,
              measureFormat: primarySeries.measureFormat(),
              measureResult: getSeriesResult(primarySeries)!,
              measureForComparisonResult: getSeriesResult(secondarySeries)!,
          }
        : undefined;
}

export function getKpiResult(
    result: DataViewFacade | undefined,
    primaryMeasure: IMeasure,
    secondaryMeasure:
        | IMeasure<IPoPMeasureDefinition>
        | IMeasure<IPreviousPeriodMeasureDefinition>
        | undefined,
    separators: ISeparators,
): IKpiResult | undefined {
    return !result?.dataView.totalCount[0]
        ? getNoDataKpiResult(result, primaryMeasure)
        : getKpiResultInner(result, primaryMeasure, secondaryMeasure, separators);
}

export function getKpiAlertResult(
    result: DataViewFacade | undefined,
    primaryMeasure: IMeasure,
    separators: ISeparators,
): IKpiAlertResult | undefined {
    const alertSeries = result?.data({ valueFormatter: createNumberJsFormatter(separators) }).series();
    return alertSeries
        ? {
              measureFormat: alertSeries.count
                  ? alertSeries.firstForMeasure(primaryMeasure).measureFormat()
                  : undefined,
              measureResult: alertSeries.count
                  ? getSeriesResult(alertSeries.firstForMeasure(primaryMeasure))!
                  : 0,
          }
        : undefined;
}

export function getAlertThresholdInfo(kpiResult: IKpiResult | undefined, intl: IntlShape) {
    const isThresholdRepresentingPercent = kpiResult?.measureFormat
        ? isMeasureFormatInPercent(kpiResult.measureFormat)
        : false;

    const value = round(kpiResult?.measureResult || 0, 2); // sure about rounding?
    const thresholdPlaceholder = isThresholdRepresentingPercent
        ? `${intl.formatMessage({ id: "kpi.alertBox.example" })} ${value * 100}`
        : `${intl.formatMessage({ id: "kpi.alertBox.example" })} ${value}`; // TODO fix floating point multiply

    return {
        isThresholdRepresentingPercent,
        thresholdPlaceholder,
    };
}
