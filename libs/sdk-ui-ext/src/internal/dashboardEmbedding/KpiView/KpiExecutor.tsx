// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import { IAnalyticalBackend, isNoDataError, IWidgetAlert, ISeparators } from "@gooddata/sdk-backend-spi";
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
    IDataSeries,
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
    DataViewFacade,
    OnError,
    createNumberJsFormatter,
} from "@gooddata/sdk-ui";
import compact from "lodash/compact";
import { IKpiValueInfo, KpiRenderer } from "./KpiRenderer";
import { injectIntl, WrappedComponentProps } from "react-intl";

interface IKpiExecutorProps {
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
}

/**
 * Executes the given measures and displays them as KPI
 * @internal
 */
export const KpiExecutorCore: React.FC<IKpiExecutorProps & WrappedComponentProps> = ({
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
    intl,
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
            <KpiRenderer onDrill={handleOnDrill} />
        ) : (
            <ErrorComponent message={error.message} />
        );
    }

    const series = result.data({ valueFormatter: createNumberJsFormatter(separators) }).series();
    const primarySeries = series.firstForMeasure(primaryMeasure);
    const secondarySeries = secondaryMeasure ? series.firstForMeasure(secondaryMeasure) : undefined;

    const primaryValue = buildKpiValueInfo(
        primarySeries,
        result,
        primarySeries.measureTitle(),
        drillableItems,
    );
    const secondaryValue =
        secondarySeries &&
        buildKpiValueInfo(
            secondarySeries,
            result,
            intl.formatMessage({ id: "filters.allTime.previousPeriod" }), // TODO use the complex logic from KD when we migrate to KPI component
            drillableItems,
        );

    return (
        <KpiRenderer
            disableDrillUnderline={disableDrillUnderline}
            primaryValue={primaryValue}
            secondaryValue={secondaryValue}
            alert={alert}
            onDrill={handleOnDrill}
        />
    );
};

export const KpiExecutor = injectIntl(KpiExecutorCore);

function buildKpiValueInfo(
    series: IDataSeries,
    dv: DataViewFacade,
    title: string,
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>,
): IKpiValueInfo {
    const predicates = drillableItems ? convertDrillableItemsToPredicates(drillableItems) : [];
    const isDrillable = isSomeHeaderPredicateMatched(predicates, series.descriptor.measureDescriptor, dv);

    return {
        formattedValue: series.dataPoints()[0].formattedValue(),
        isDrillable,
        title,
        value: series.dataPoints()[0].rawValue,
        measureDescriptor: series.descriptor.measureDescriptor,
    };
}
