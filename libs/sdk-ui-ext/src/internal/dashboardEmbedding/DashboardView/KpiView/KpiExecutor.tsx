// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import {
    IAnalyticalBackend,
    isNoDataError,
    IWidgetAlert,
    ISeparators,
    IWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    IFilter,
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
} from "@gooddata/sdk-model";
import {
    useExecution,
    useDataView,
    IErrorProps,
    ILoadingProps,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
    IDrillableItem,
    IHeaderPredicate,
    OnFiredDrillEvent,
    IDrillEventContext,
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
    OnError,
    createNumberJsFormatter,
    IDataSeries,
} from "@gooddata/sdk-ui";
import compact from "lodash/compact";
import isNil from "lodash/isNil";
import isNumber from "lodash/isNumber";
import { KpiRenderer } from "./KpiRenderer";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IKpiResult } from "../../KpiContent";

interface IKpiExecutorProps {
    kpiWidget: IWidgetDefinition;
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure<IPoPMeasureDefinition> | IMeasure<IPreviousPeriodMeasureDefinition>;
    alert?: IWidgetAlert;
    filters?: IFilter[];
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    onError?: OnError;
    backend: IAnalyticalBackend;
    workspace: string;
    separators: ISeparators;
    disableDrillUnderline?: boolean;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    clientWidth?: number;
}

/**
 * Executes the given measures and displays them as KPI
 * @internal
 */
export const KpiExecutorCore: React.FC<IKpiExecutorProps & WrappedComponentProps> = ({
    kpiWidget,
    primaryMeasure,
    secondaryMeasure,
    alert,
    filters,
    drillableItems,
    onDrill,
    onError,
    backend,
    workspace,
    separators,
    disableDrillUnderline,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
    clientWidth,
}) => {
    const execution = useExecution({
        seriesBy: compact([primaryMeasure, secondaryMeasure]),
        filters,
        backend,
        workspace,
    });

    const { error, result, status } = useDataView({ execution, onError }, [execution.fingerprint()]);

    const handleOnDrill = useCallback(
        (drillContext: IDrillEventContext): ReturnType<OnFiredDrillEvent> => {
            if (!onDrill || !result) {
                return false;
            }

            return onDrill({
                dataView: result.dataView,
                drillContext,
            });
        },
        [onDrill, result],
    );

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (status === "error") {
        return isNoDataError(error) ? (
            <KpiRenderer
                kpi={kpiWidget}
                kpiResult={null}
                filters={filters}
                disableDrillUnderline={disableDrillUnderline}
                isDrillable={false}
                onDrill={onDrill && handleOnDrill}
                alert={alert}
                clientWidth={clientWidth}
                separators={separators}
            />
        ) : (
            <ErrorComponent message={error.message} />
        );
    }

    const series = result.data({ valueFormatter: createNumberJsFormatter(separators) }).series();
    const primarySeries = series.firstForMeasure(primaryMeasure);
    const secondarySeries = secondaryMeasure ? series.firstForMeasure(secondaryMeasure) : undefined;

    const kpiResult: IKpiResult = {
        measureDescriptor: primarySeries.descriptor.measureDescriptor,
        measureFormat: primarySeries.measureFormat(),
        measureResult: getSeriesResult(primarySeries),
        measureForComparisonResult: getSeriesResult(secondarySeries),
    };

    const predicates = drillableItems ? convertDrillableItemsToPredicates(drillableItems) : [];
    const isDrillable =
        kpiWidget.drills.length > 0 ||
        isSomeHeaderPredicateMatched(predicates, primarySeries.descriptor.measureDescriptor, result);

    return (
        <KpiRenderer
            kpi={kpiWidget}
            kpiResult={kpiResult}
            filters={filters}
            disableDrillUnderline={disableDrillUnderline}
            isDrillable={isDrillable}
            onDrill={onDrill && handleOnDrill}
            alert={alert}
            clientWidth={clientWidth}
            separators={separators}
        />
    );
};

export const KpiExecutor = injectIntl(KpiExecutorCore);

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
