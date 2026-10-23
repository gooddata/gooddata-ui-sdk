// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { defineMessages } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IMeasureMetadataObject,
    type IdentifierRef,
    isMeasureMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useCopyObjectPermissions } from "@gooddata/sdk-ui-ext";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { useFeaturesAndSettings } from "../FeaturesAndSettings/index.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";

// `defineMessages` rather than an inline `{ id }`: the locale checker only reads the former.
const messages = defineMessages({
    accessNotCopied: { id: "metricComponent.editMetric.accessNotCopied" },
});

/** Copies the access of the metric being replaced onto its replacement. False if it did not land. */
type CopyAccess = (from: IMeasureMetadataObject, to: IMeasureMetadataObject) => Promise<boolean>;

export function useMetricSave(): (metric: IMeasureDef) => Promise<IMeasureMetadataObject> {
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();
    const { enableMetricPermissions } = useFeaturesAndSettings();
    const copyPermissions = useCopyObjectPermissions();
    const { addWarning } = useToastMessage();

    const copyAccess = useCallback<CopyAccess>(
        async (from, to) => {
            if (!enableMetricPermissions) {
                return true;
            }
            const copied = await copyPermissions(
                { kind: "measure", ref: from.ref },
                { kind: "measure", ref: to.ref },
            );
            if (!copied) {
                addWarning(messages.accessNotCopied);
            }
            return copied;
        },
        [enableMetricPermissions, copyPermissions, addWarning],
    );

    return useCallback(
        (metric: IMeasureDef) => {
            return saveMetric(backend, workspaceId, metric, enableMetricPermissions, copyAccess);
        },
        [backend, workspaceId, enableMetricPermissions, copyAccess],
    );
}

async function saveMetric(
    backend: IAnalyticalBackend,
    workspaceId: string,
    metric: IMeasureDef,
    loadPermissions: boolean,
    copyAccess: CopyAccess,
): Promise<IMeasureMetadataObject> {
    const metricsService = backend.workspace(workspaceId).measures();

    if (isMeasureMetadataObjectDefinition(metric)) {
        return metricsService.createMeasure(metric, { loadPermissions });
    }

    const metricObject = metric as IMeasureMetadataObject;
    const ref = metricObject.ref as IdentifierRef;
    if (metricObject.id !== ref.identifier) {
        // A metric's ID is its API identifier, so a new one means a new object. Its access is
        // attached to the ID, so it is copied over first.
        const createdMetric = await metricsService.createMeasure(metric, { loadPermissions });
        // The original goes only once its access is on the replacement. A failed copy keeps
        // both, so nobody loses a metric they could reach.
        if (await copyAccess(metricObject, createdMetric)) {
            await metricsService.deleteMeasure(metricObject.ref);
        }
        return createdMetric;
    }

    return metricsService.updateMeasure(metric);
}
