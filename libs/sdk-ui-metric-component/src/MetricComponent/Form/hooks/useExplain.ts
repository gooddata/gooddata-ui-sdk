// (C) 2021-2026 GoodData Corporation

import { type DependencyList } from "react";

import { useIntl } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type ICatalogAttribute } from "@gooddata/sdk-model";
import {
    type UseCancelablePromiseState,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { type IMeasureDef } from "../../metric/metricHelpers.js";
import { transformToMetricDefinition } from "../../metric/transformer.js";
import { createAttribute } from "../attribute.js";
import { createInlineMeasure } from "../inlineMeasure.js";

export function useExplain(
    measure?: IMeasureDef | null,
    {
        attributes,
    }: {
        attributes?: Array<ICatalogAttribute>;
    } = {},
    deps?: DependencyList,
): Omit<UseCancelablePromiseState<string, Error>, "result"> & { sql: string } {
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();
    const intl = useIntl();

    const { status, result, error } = useCancelablePromise<string | void, Error>(
        {
            promise: () =>
                measure ? callSqlExplain(backend, workspaceId, measure, attributes) : Promise.resolve(),
        },
        [...(deps || []), attributes],
    );

    if (!result && status === "success") {
        return {
            status: "error",
            sql: "",
            error: new Error(intl.formatMessage({ id: "metricComponent.editMetric.metric.sql.error" })),
        };
    }

    return {
        status,
        error,
        sql: result || "",
    };
}

function callSqlExplain(
    backend: IAnalyticalBackend,
    workspaceId: string,
    measure: IMeasureDef,
    attributes?: Array<ICatalogAttribute>,
): Promise<string | void> {
    const metric = transformToMetricDefinition(measure);
    const inline = createInlineMeasure(metric);

    //Can not call for not existing metric
    if (!inline) {
        return Promise.resolve();
    }

    return backend
        .workspace(workspaceId)
        .execution()
        .forDefinition({
            workspace: workspaceId,
            measures: inline ? [inline] : [],
            filters: [],
            dimensions: [],
            sortBy: [],
            buckets: [],
            attributes: (attributes || []).map(createAttribute),
            postProcessing: {},
            executionConfig: {},
        })
        .explain({ explainType: "SQL" })
        .data();
}
