// (C) 2020 GoodData Corporation
import React from "react";
import { IAnalyticalBackend, IWidget } from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
import {
    useExecution,
    useDataView,
    IErrorProps,
    ILoadingProps,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
} from "@gooddata/sdk-ui";
import { InvariantError } from "ts-invariant";
import compact from "lodash/compact";

import { getMeasures } from "./utils";

export interface IKpiViewProps {
    kpiWidget: IWidget;
    filters?: IFilter[];
    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the insight exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Component to render if embedding fails.
     */
    ErrorComponent?: React.ComponentType<IErrorProps>;

    /**
     * Component to render while the insight is loading.
     */
    LoadingComponent?: React.ComponentType<ILoadingProps>;
}

export const KpiView: React.FC<IKpiViewProps> = ({
    kpiWidget,
    backend,
    workspace,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
}) => {
    if (!kpiWidget.kpi) {
        throw new InvariantError("The provided widget is not a KPI widget.");
    }

    const { primaryMeasure, secondaryMeasure } = getMeasures(kpiWidget);

    // TODO memoize and invalidate?
    const execution = useExecution({
        seriesBy: compact([primaryMeasure, secondaryMeasure]),
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
