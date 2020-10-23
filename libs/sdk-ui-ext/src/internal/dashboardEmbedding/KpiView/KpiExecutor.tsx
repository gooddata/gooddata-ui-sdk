// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import { IAnalyticalBackend, isNoDataError } from "@gooddata/sdk-backend-spi";
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
} from "@gooddata/sdk-ui";
import compact from "lodash/compact";
import { IKpiValueInfo, KpiRenderer } from "./KpiRenderer";

interface IKpiExecutorProps {
    title: string;
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure<IPoPMeasureDefinition> | IMeasure<IPreviousPeriodMeasureDefinition>;
    filters?: IFilter[];
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    backend: IAnalyticalBackend;
    workspace: string;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
}

/**
 * Executes the given measures and displays them as KPI
 * @internal
 */
export const KpiExecutor: React.FC<IKpiExecutorProps> = ({
    title,
    primaryMeasure,
    secondaryMeasure,
    filters,
    drillableItems,
    onDrill,
    backend,
    workspace,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
}) => {
    const execution = useExecution({
        seriesBy: compact([primaryMeasure, secondaryMeasure]),
        filters,
        backend,
        workspace,
    });

    const { error, result, status } = useDataView({ execution });

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
            <KpiRenderer title={title} onDrill={handleOnDrill} />
        ) : (
            <ErrorComponent message={error.message} />
        );
    }

    const series = result.data().series();
    const primarySeries = series.firstForMeasure(primaryMeasure);
    const secondarySeries = secondaryMeasure ? series.firstForMeasure(secondaryMeasure) : undefined;

    const primaryValue = buildKpiValueInfo(primarySeries, result, drillableItems);
    const secondaryValue = secondarySeries && buildKpiValueInfo(secondarySeries, result, drillableItems);

    return (
        <KpiRenderer
            primaryValue={primaryValue}
            secondaryValue={secondaryValue}
            onDrill={handleOnDrill}
            title={title}
        />
    );
};

function buildKpiValueInfo(
    series: IDataSeries,
    dv: DataViewFacade,
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>,
): IKpiValueInfo {
    const predicates = drillableItems ? convertDrillableItemsToPredicates(drillableItems) : [];
    const isDrillable = isSomeHeaderPredicateMatched(predicates, series.descriptor.measureDescriptor, dv);

    return {
        formattedValue: series.dataPoints()[0].formattedValue(),
        isDrillable,
        title: series.measureTitle(),
        value: series.dataPoints()[0].rawValue,
        measureDescriptor: series.descriptor.measureDescriptor,
    };
}
