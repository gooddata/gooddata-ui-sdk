// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { useEvents } from "../../shared/eventing/useEvents.js";
import { type MetricIdConflicts, useConflictDetection } from "../ConflictContext/useConflictDetection.js";
import { type IEditMetricContentProps, SaveNameMode } from "../Content/EditMetricContent.data.js";
import { events } from "../Content/EditMetricContent.events.js";
import { metricHasChangedId, metricOverridesExistingId } from "../metric/idChangeHelper.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";

export function useSaveClick(
    defaultId: string,
    setIdDialogData: (data: {
        visible: boolean;
        conflicts: MetricIdConflicts;
        idChanged: boolean;
        oldId: string;
        newId: string;
    }) => void,
    setMetricToSave: (metric: IMeasureDef | undefined) => void,
    onSave: IEditMetricContentProps["onSave"],
    saveMode: SaveNameMode,
): (metricToSave: IMeasureDef, force?: boolean) => Promise<void> {
    const getConflicts = useConflictDetection();
    const { metricConflictedIdEvent } = useEvents(events);

    return useCallback(
        (metricToSave: IMeasureDef, force?: boolean) => {
            return getConflicts(metricToSave.id).then((conflicts) => {
                const metricConflicts = metricOverridesExistingId(
                    defaultId,
                    metricToSave.id,
                    conflicts,
                    force,
                );
                const idChanged = metricHasChangedId(defaultId, metricToSave.id, saveMode, force);
                //check
                if (idChanged || metricConflicts.conflictWith.length > 0) {
                    if (metricConflicts.conflictWith.length > 0) {
                        metricConflictedIdEvent(metricToSave.id);
                    }
                    setIdDialogData({
                        visible: true,
                        conflicts: metricConflicts,
                        idChanged,
                        oldId: defaultId,
                        newId: metricToSave.id || "",
                    });
                    setMetricToSave(metricToSave);
                    return Promise.resolve();
                }
                //save
                return onSave({
                    metric: metricToSave,
                    saveMode: SaveNameMode.save,
                    regenerateId: undefined,
                    formField: undefined,
                }).catch(() => {}); // error is processed in onSaveHandler;
            });
        },
        [
            onSave,
            setIdDialogData,
            setMetricToSave,
            defaultId,
            saveMode,
            getConflicts,
            metricConflictedIdEvent,
        ],
    );
}
