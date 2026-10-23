// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type AnalyticalBackendError } from "@gooddata/sdk-backend-spi";
import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { useEvents } from "../../../shared/eventing/useEvents.js";
import { useMetrics } from "../../../shared/metrics/useMetrics.js";
import { useReloadMetrics } from "../../../shared/metrics/useReloadMetrics.js";
import { type ITab } from "../../../shared/Tabs/Tab.js";
import { type MetricIdConflicts, useConflictDetection } from "../../ConflictContext/useConflictDetection.js";
import { SaveNameMode } from "../../Content/EditMetricContent.data.js";
import { events } from "../../Content/EditMetricContent.events.js";
import { useWriteMetricAccess } from "../../Form/Header/share/useApplyMetricAccess.js";
import { usePrefixes } from "../../Form/Prefixes/usePrefixes.js";
import { useMetricSave } from "../../hooks/useMetricSave.js";
import { metricHasChangedId, metricOverridesExistingId } from "../../metric/idChangeHelper.js";
import { type IMeasureDef, prepareMetricForSaveAs } from "../../metric/metricHelpers.js";
import { type ISaveMetricInfo, createSaveMetricInfo } from "../../metric/saveInfo.js";
import { transformToMetricDefinition } from "../../metric/transformer.js";
import { type IMetricInfo } from "../metricState.data.js";

export const useSaveTab = (
    handleChangeId: (
        saveMode: SaveNameMode | undefined,
        oldId: string,
        newId: string,
        changedId: boolean,
        conflicts: MetricIdConflicts,
    ) => Promise<string>,
    onMetricsChange?: (metric: IMeasureDef) => void,
    onSave?: (
        metric: IMeasureMetadataObject,
        info: ISaveMetricInfo,
        err: Error | null,
    ) => Promise<void> | void,
): ((tab: ITab<IMetricInfo>) => Promise<IMeasureMetadataObject>) => {
    const metrics = useMetrics();
    const saveMetricHandler = useMetricSave();
    const getConflicts = useConflictDetection();
    const { needMetricReload } = useReloadMetrics();
    const { metricConflictedIdEvent } = useEvents(events);
    const prefix = usePrefixes();
    const writeAccess = useWriteMetricAccess();

    return useCallback(
        (tab: ITab<IMetricInfo>) => {
            const { initial, current, saveMode } = tab.data;
            const metric = getMetricDefinition(metrics.result || [], current, prefix.current, prefix.parents);
            const changeIdPromise = getConflicts(current.id).then((conflicts) => {
                const metricConflicts = metricOverridesExistingId(initial.id, current.id, conflicts);
                const idChanged = metricHasChangedId(initial.id, current.id, saveMode);
                const changed = idChanged || metricConflicts.conflictWith.length > 0;
                if (metricConflicts.conflictWith.length > 0) {
                    metricConflictedIdEvent(current.id);
                }
                return changed
                    ? handleChangeId(
                          saveMode,
                          initial.id as string,
                          current.id as string,
                          idChanged,
                          metricConflicts,
                      )
                    : Promise.resolve(current.id);
            });
            return changeIdPromise.then((newId?: string) => {
                metric.id = newId;
                return saveMetricHandler(metric)
                    .then(async (metric) => {
                        // This path, not the editor's save, runs when a dirty new metric is
                        // closed with Save. Dropped first so a repeat cannot resend it.
                        const draft = tab.data.draftAccess;
                        if (draft) {
                            tab.data.draftAccess = undefined;
                            await writeAccess(metric, draft);
                        }
                        return metric;
                    })
                    .then((metric) => {
                        if (onMetricsChange) {
                            onMetricsChange(metric);
                        }
                        return metric;
                    })
                    .then((metric) => {
                        needMetricReload();
                        if (onSave) {
                            onSaveTab(tab, onSave, null);
                        }
                        return metric;
                    })
                    .catch((error) => {
                        if (onSave) {
                            onSaveTab(tab, onSave, error);
                        }
                        throw error;
                    });
            });
        },
        [
            prefix,
            metrics.result,
            saveMetricHandler,
            needMetricReload,
            metricConflictedIdEvent,
            onMetricsChange,
            onSave,
            handleChangeId,
            getConflicts,
            writeAccess,
        ],
    );
};

function getMetricDefinition(
    metrics: IMeasureMetadataObject[] = [],
    current: IMeasureDef,
    prefix = "",
    parents: string[] = [],
) {
    if (!current.isLocked) {
        return current;
    }

    const { metric } = prepareMetricForSaveAs(current, current, metrics, prefix, parents);
    return metric;
}

const onSaveTab = (
    tab: ITab<IMetricInfo>,
    onSave: (
        metric: IMeasureMetadataObject,
        info: ISaveMetricInfo,
        err: Error | null,
    ) => Promise<void> | void,
    error: AnalyticalBackendError | null,
): Promise<void> | void => {
    return onSave?.(
        transformToMetricDefinition(tab.data.current) as unknown as IMeasureMetadataObject,
        createSaveMetricInfo(tab.data.initial, {}, SaveNameMode.save),
        error,
    );
};
