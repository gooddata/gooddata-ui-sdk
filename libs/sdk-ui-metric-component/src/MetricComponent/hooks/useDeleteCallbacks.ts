// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { useEvents } from "../../shared/eventing/useEvents.js";
import { useReloadMetrics } from "../../shared/metrics/useReloadMetrics.js";
import { events } from "../DeleteMetric.events.js";
import { type IDeleteMetricInfo, createDeleteMetricInfo } from "../metric/deleteInfo.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";

import { useMetricDelete } from "./useMetricDelete.js";
import { useMetricUsage } from "./useMetricUsage.js";

export function useDeleteCallbacks(
    metric: IMeasureDef,
    onDelete?: (metric: IMeasureMetadataObject, info: IDeleteMetricInfo, err: Error | null) => void,
    onMetricsChange?: (metric: IMeasureDef) => void,
): {
    onDeleteHandler: () => Promise<void>;
} {
    const { metricDeletedEvent, metricDeleteFailedEvent } = useEvents(events);
    const { needMetricReload } = useReloadMetrics();

    const usage = useMetricUsage(metric);
    const deleteMetricHandler = useMetricDelete();

    return useMemo(() => {
        function handleMetricsChange(removedMetric: IMeasureMetadataObject) {
            if (onMetricsChange) {
                onMetricsChange(removedMetric);
            }
        }

        function onDeleteHandler() {
            const metricToDelete = metric as IMeasureMetadataObject;
            const startTime = Date.now();
            return deleteMetricHandler(metricToDelete)
                .then(() => handleMetricsChange(metricToDelete))
                .then(() => {
                    needMetricReload();
                    if (onDelete) {
                        onDelete(metricToDelete, createDeleteMetricInfo(usage), null);
                    }
                })
                .then(() => {
                    metricDeletedEvent(metricToDelete.id, Date.now() - startTime);
                })
                .catch((err) => {
                    if (onDelete) {
                        onDelete(metricToDelete, { references: usage }, err);
                    }
                    metricDeleteFailedEvent(err);
                });
        }

        return { onDeleteHandler };
    }, [
        deleteMetricHandler,
        metric,
        metricDeleteFailedEvent,
        metricDeletedEvent,
        needMetricReload,
        onDelete,
        onMetricsChange,
        usage,
    ]);
}
