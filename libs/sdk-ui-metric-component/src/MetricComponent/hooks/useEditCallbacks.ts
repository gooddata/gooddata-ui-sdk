// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { type AnalyticalBackendError, type IMeasureReferencing } from "@gooddata/sdk-backend-spi";
import { type IMeasureMetadataObject, isMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import { useEvents } from "../../shared/eventing/useEvents.js";
import { useReloadMetrics } from "../../shared/metrics/useReloadMetrics.js";
import { type CancelMode, SaveNameMode } from "../Content/EditMetricContent.data.js";
import { events } from "../EditMetric.events.js";
import { type FormField } from "../Form/data.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";
import { type ISaveMetricInfo, createSaveMetricInfo } from "../metric/saveInfo.js";
import { MetricContextMode } from "../MetricsContext/MetricsContext.js";
import { useMetricsContext } from "../MetricsContext/useMetricsContext.js";

import { useMetricSave } from "./useMetricSave.js";

export type SaveData = {
    metric: IMeasureDef;
    saveMode: SaveNameMode | undefined;
    formField: FormField | undefined;
    regenerateId: boolean | undefined;
};
export type CancelData = {
    cancelMode: CancelMode;
};

export function useEditCallbacks(
    metric: IMeasureDef,
    setCurrentMetric: (metric: IMeasureDef) => void,
    usage: IMeasureReferencing,
    onCancel?: (cancelMode: CancelMode | undefined) => void,
    onDelete?: (metric: IMeasureMetadataObject) => void,
    onSave?: (
        metric: IMeasureMetadataObject,
        info: ISaveMetricInfo,
        err: Error | null,
    ) => Promise<void> | void,
    onMetricsChange?: (metric: IMeasureDef) => void,
    /** Runs after the metric is persisted, with what the backend returned. Failures are swallowed. */
    onSaved?: (metric: IMeasureMetadataObject) => Promise<void> | void,
): {
    onSaveHandler: (data: SaveData) => Promise<void>;
    onCancelHandler: (data: CancelData) => void;
    onDeleteHandler: () => void;
} {
    const { needMetricReload } = useReloadMetrics();
    const {
        metricSavedAndClosedEvent,
        metricSaveFailedEvent,
        metricSaveAsNewFailedEvent,
        metricClosedWithoutSaveEvent,
        metricDeleteClickEvent,
    } = useEvents(events);
    const { mode } = useMetricsContext();

    const saveMetricHandler = useMetricSave();

    return useMemo(() => {
        function handleMetricsChange(
            savedMetric: IMeasureMetadataObject,
            serverMetric: IMeasureMetadataObject,
        ): IMeasureMetadataObject {
            if (onMetricsChange) {
                onMetricsChange(savedMetric);
            }
            return serverMetric;
        }

        function handleSave(
            savedMetric: IMeasureMetadataObject,
            serverMetric: IMeasureMetadataObject,
            saveMode: SaveNameMode | undefined,
            formField: FormField | undefined,
            regenerateId: boolean | undefined,
        ): Promise<void> | void {
            const resolvedMetric = keepPermissions(savedMetric, serverMetric);

            //NOTE: In multiple metrics mode we dont want to propagate changes into current form in save as new mode
            if (saveMode !== SaveNameMode.saveAsNew || mode === MetricContextMode.Single) {
                setCurrentMetric(resolvedMetric);
            }
            return onSave?.(
                resolvedMetric,
                createSaveMetricInfo(metric, usage, saveMode, regenerateId, formField),
                null,
            );
        }

        function handleSuccess(savedMetric: IMeasureMetadataObject, start: number) {
            metricSavedAndClosedEvent(
                savedMetric.id,
                savedMetric.expression,
                Date.now() - start,
                isMeasureMetadataObjectDefinition(metric),
            );
        }

        function handlerError(
            savedMetric: IMeasureMetadataObject,
            saveMode: SaveNameMode | undefined,
            formField: FormField | undefined,
            regenerateId: boolean | undefined,
            err: AnalyticalBackendError,
        ) {
            if (saveMode === SaveNameMode.saveAsNew) {
                metricSaveAsNewFailedEvent(err);
            } else {
                metricSaveFailedEvent(err);
            }
            if (onSave) {
                onSave(
                    savedMetric,
                    createSaveMetricInfo(metric, usage, saveMode, regenerateId, formField),
                    err,
                );
            }
        }

        function onSaveHandler({ metric, saveMode, formField, regenerateId }: SaveData) {
            const savedMetric = metric as IMeasureMetadataObject;
            const startTime = Date.now();

            return saveMetricHandler(savedMetric)
                .then((serverMetrics) => handleMetricsChange(savedMetric, serverMetrics))
                .then(async (serverMetric) => {
                    needMetricReload();
                    try {
                        await onSaved?.(serverMetric);
                    } catch {
                        // The metric is saved by now, so a failing follow-up must not report
                        // a failed save. try/catch, not `.catch`, which a sync throw escapes.
                    }
                    return handleSave(savedMetric, serverMetric, saveMode, formField, regenerateId);
                })
                .then(() => handleSuccess(savedMetric, startTime))
                .catch((err) => handlerError(savedMetric, saveMode, formField, regenerateId, err));
        }

        function onDeleteHandler() {
            needMetricReload();
            if (onDelete) {
                onDelete(metric as IMeasureMetadataObject);
            }
            metricDeleteClickEvent((metric as IMeasureMetadataObject).id);
        }

        function onCancelHandler({ cancelMode }: CancelData) {
            if (onCancel) {
                onCancel(cancelMode);
            }
            metricClosedWithoutSaveEvent();
        }

        return { onSaveHandler, onDeleteHandler, onCancelHandler };
    }, [
        mode,
        metric,
        metricClosedWithoutSaveEvent,
        metricDeleteClickEvent,
        metricSaveAsNewFailedEvent,
        metricSaveFailedEvent,
        metricSavedAndClosedEvent,
        needMetricReload,
        onCancel,
        onDelete,
        onMetricsChange,
        onSave,
        onSaved,
        saveMetricHandler,
        setCurrentMetric,
        usage,
    ]);
}

// Create returns the new object's own permissions, but the update endpoint cannot return them at
// all. Saving content does not change them, so on update keep the ones the metric was opened with.
function keepPermissions(
    savedMetric: IMeasureMetadataObject,
    serverMetric: IMeasureMetadataObject,
): IMeasureMetadataObject {
    if (serverMetric.permissions || !savedMetric.permissions) {
        return serverMetric;
    }
    return { ...serverMetric, permissions: savedMetric.permissions };
}
