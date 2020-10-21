// (C) 2020 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
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
} from "@gooddata/sdk-ui";
import compact from "lodash/compact";

interface IKpiExecutorProps {
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure<IPoPMeasureDefinition> | IMeasure<IPreviousPeriodMeasureDefinition>;
    filters?: IFilter[];
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
    primaryMeasure,
    secondaryMeasure,
    filters,
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

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (status === "error") {
        return <ErrorComponent message={error.message} />;
    }

    const primarySeries = result.data().series().firstForMeasure(primaryMeasure);
    const secondarySeries = secondaryMeasure
        ? result.data().series().firstForMeasure(secondaryMeasure)
        : null;

    return (
        <div>
            <div>{primarySeries.measureTitle()}</div>
            <div>{primarySeries.dataPoints()[0].formattedValue()}</div>
            {secondarySeries && <div>{secondarySeries.dataPoints()[0].formattedValue()}</div>}
        </div>
    );
};
