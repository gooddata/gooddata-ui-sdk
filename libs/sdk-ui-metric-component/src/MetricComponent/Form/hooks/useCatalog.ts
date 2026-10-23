// (C) 2022-2026 GoodData Corporation

import { type DependencyList } from "react";

import { type IAnalyticalBackend, type IWorkspaceCatalog } from "@gooddata/sdk-backend-spi";
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

export function useCatalog(
    measure: IMeasureDef,
    selected: ICatalogAttribute[] = [],
    deps?: DependencyList,
): UseCancelablePromiseState<{ available: ICatalogAttribute[]; all: ICatalogAttribute[] }, Error> {
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();

    const attributes = useAttributes(backend, workspaceId, deps);
    const available = useAvailableAttributes(attributes.result, measure, selected, deps);
    const status = getStatus<unknown>(attributes, available);
    const error = attributes.error || available.error || undefined;

    switch (status) {
        case "error":
            return {
                status,
                error,
                result: undefined,
            };
        case "success":
            return {
                status,
                error: undefined,
                result: {
                    available: available.result?.availableAttributes() ?? [],
                    all: attributes.result?.attributes() ?? [],
                },
            };
        default:
            return {
                status,
                error: undefined,
                result: undefined,
            };
    }
}

function useAttributes(backend: IAnalyticalBackend, workspaceId: string, deps?: DependencyList) {
    return useCancelablePromise(
        {
            promise: () => {
                return backend.workspace(workspaceId).catalog().forTypes(["attribute"]).load();
            },
        },
        [backend, workspaceId, ...(deps || [])],
    );
}

function useAvailableAttributes(
    catalog: IWorkspaceCatalog | undefined,
    measure: IMeasureDef,
    selected: ICatalogAttribute[],
    deps?: DependencyList,
) {
    const metric = transformToMetricDefinition(measure);
    return useCancelablePromise(
        {
            promise: () => {
                const inline = createInlineMeasure(metric);
                const attrs = selected.map(createAttribute);
                return catalog
                    ? catalog
                          .availableItems()
                          .forItems(inline ? [inline, ...attrs] : attrs)
                          .load()
                    : Promise.resolve(undefined);
            },
        },
        [catalog, selected, ...(deps || [])],
    );
}

function getStatus<T, E = Error>(
    ...args: UseCancelablePromiseState<T, E>[]
): UseCancelablePromiseState<T, E>["status"] {
    const status = args.map((arg) => arg.status);
    const data = args.every((arg) => !!arg.result);

    if (status.includes("error")) {
        return "error";
    }
    if (status.includes("pending")) {
        return "pending";
    }
    if (status.includes("loading") || !data) {
        return "loading";
    }
    return "success";
}
