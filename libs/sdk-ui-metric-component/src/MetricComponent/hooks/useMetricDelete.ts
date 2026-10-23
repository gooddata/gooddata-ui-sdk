// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IMeasureMetadataObject, type ObjRef } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { type IMeasureDef } from "../metric/metricHelpers.js";

export function useMetricDelete(): (metric: IMeasureDef) => Promise<void> {
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();

    return useCallback(
        (metric: IMeasureDef) => {
            const metricToDelete = metric as IMeasureMetadataObject;
            return deleteMetric(backend, workspaceId, metricToDelete.ref);
        },
        [backend, workspaceId],
    );
}

function deleteMetric(backend: IAnalyticalBackend, workspaceId: string, metricRef: ObjRef): Promise<void> {
    return backend.workspace(workspaceId).measures().deleteMeasure(metricRef);
}
