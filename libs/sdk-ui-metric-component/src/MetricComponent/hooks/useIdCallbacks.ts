// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useMemo } from "react";

import { type MetricIdConflicts } from "../ConflictContext/useConflictDetection.js";
import { type IEditMetricDialogFormApi } from "../Form/EditMetricContentForm.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";

export function useIdCallbacks(
    idChangedData: {
        visible: boolean;
        conflicts: MetricIdConflicts;
        idChanged: boolean;
        oldId: string;
        newId: string;
    },
    setIdDialogData: (data: {
        visible: boolean;
        conflicts: MetricIdConflicts;
        idChanged: boolean;
        oldId: string;
        newId: string;
    }) => void,
    comp: MutableRefObject<IEditMetricDialogFormApi | undefined>,
    metricToSave: IMeasureDef | undefined,
    defaultId: string,
): {
    onSaveKeepIdClick: () => void;
    onSaveChangeIdClick: () => void;
    onCloseIdChange: () => void;
} {
    return useMemo(() => {
        const onSaveKeepIdClick = () => {
            setIdDialogData({
                ...idChangedData,
                visible: false,
                conflicts: { conflictWith: [], usableIds: [] },
                idChanged: false,
            });
            //not change ids, but conflict exists
            if (!idChangedData.idChanged && idChangedData.conflicts.conflictWith.length > 0) {
                const newId = idChangedData.conflicts.usableIds[0];
                if (metricToSave && comp.current) {
                    comp.current.saveForce({ id: newId });
                }
                return;
            }
            //changed id, keep default
            if (metricToSave && comp.current) {
                comp.current.saveForce({ id: defaultId });
            }
        };

        const onSaveChangeIdClick = () => {
            setIdDialogData({
                ...idChangedData,
                visible: false,
                conflicts: { conflictWith: [], usableIds: [] },
                idChanged: false,
            });
            if (metricToSave && comp.current) {
                comp.current.saveForce();
            }
        };

        const onCloseIdChange = () => {
            setIdDialogData({
                ...idChangedData,
                visible: false,
                conflicts: { conflictWith: [], usableIds: [] },
                idChanged: false,
            });
        };

        return { onSaveKeepIdClick, onSaveChangeIdClick, onCloseIdChange };
    }, [comp, defaultId, metricToSave, setIdDialogData, idChangedData]);
}
