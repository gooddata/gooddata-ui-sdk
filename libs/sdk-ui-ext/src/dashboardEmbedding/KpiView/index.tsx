// (C) 2020 GoodData Corporation
import React from "react";
import { IAnalyticalBackend, IWidget } from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
import {
    IErrorProps,
    ILoadingProps,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
} from "@gooddata/sdk-ui";
import { InvariantError } from "ts-invariant";

import { useKpiMeasures } from "./utils";
import { KpiExecutor } from "./KpiExecutor";

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
    filters,
    backend,
    workspace,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
}) => {
    if (!kpiWidget.kpi) {
        throw new InvariantError("The provided widget is not a KPI widget.");
    }

    const { error, result, status } = useKpiMeasures({
        kpiWidget,
        backend,
        filters,
        workspace,
    });

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (status === "error") {
        return <ErrorComponent message={error.message} />;
    }

    return (
        <KpiExecutor
            primaryMeasure={result.primaryMeasure}
            secondaryMeasure={result.secondaryMeasure}
            filters={filters}
            backend={backend}
            workspace={workspace}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
        />
    );
};
