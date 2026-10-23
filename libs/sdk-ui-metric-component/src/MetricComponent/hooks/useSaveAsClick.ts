// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { useEvents } from "../../shared/eventing/useEvents.js";
import { useConflictDetection } from "../ConflictContext/useConflictDetection.js";
import { type IEditMetricContentProps, SaveNameMode } from "../Content/EditMetricContent.data.js";
import { events } from "../Content/EditMetricContent.events.js";
import { FormField } from "../Form/data.js";
import { usePrefixes } from "../Form/Prefixes/usePrefixes.js";
import { type IMeasureDef, prepareMetricForSaveAs } from "../metric/metricHelpers.js";

export function useSaveAsClick(
    defaultId: string,
    initialValueMetric: IMeasureDef,
    metrics: Array<IMeasureMetadataObject>,
    onSave: IEditMetricContentProps["onSave"],
    setInitialValueMetric: (metric: IMeasureDef) => void,
    setFocusedField: (filed: FormField) => void,
    setSaveMode: (saveMode: SaveNameMode) => void,
    setRegenerateId: (state: boolean) => void,
): (metricToSaveAs: IMeasureDef) => Promise<void> {
    const { metricSavedAsNewEvent, metricConflictedIdEvent } = useEvents(events);
    const getConflicts = useConflictDetection();
    const prefix = usePrefixes();

    return useCallback(
        (metricToSaveAs: IMeasureDef) => {
            const { metric, updatedFields } = prepareMetricForSaveAs(
                initialValueMetric,
                metricToSaveAs,
                metrics || [],
                prefix.current,
                prefix.parents,
            );
            const startTime = Date.now();
            const formField = deriveFormField(updatedFields);

            return getConflicts(metric.id).then((conflicts) => {
                if (conflicts.conflictWith.length > 0) {
                    metricConflictedIdEvent(metric.id);
                    metric.id = conflicts.usableIds[0];
                    updatedFields.id = false;
                }

                setSaveMode(SaveNameMode.saveAsNew);
                setRegenerateId(updatedFields.id);

                return onSave({
                    metric,
                    formField,
                    regenerateId: updatedFields.id,
                    saveMode: SaveNameMode.saveAsNew,
                })
                    .catch(() => {}) // error is processed in onSaveHandler
                    .then(() => {
                        metricSavedAsNewEvent(defaultId, Date.now() - startTime);
                        setInitialValueMetric(metric);
                        setFocusedField(formField);
                    });
            });
        },
        [
            prefix,
            defaultId,
            initialValueMetric,
            metricSavedAsNewEvent,
            metricConflictedIdEvent,
            metrics,
            onSave,
            setFocusedField,
            setInitialValueMetric,
            setSaveMode,
            setRegenerateId,
            getConflicts,
        ],
    );
}

function deriveFormField(updatedFields: { id: boolean; title: boolean }) {
    if (updatedFields.title) {
        return FormField.title;
    }

    if (updatedFields.id) {
        return FormField.id;
    }

    return FormField.expression;
}
