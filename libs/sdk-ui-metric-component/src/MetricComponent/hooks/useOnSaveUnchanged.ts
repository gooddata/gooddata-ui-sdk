// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useMemo } from "react";

import { CancelMode } from "../Content/EditMetricContent.data.js";
import { type IEditMetricDialogFormApi } from "../Form/EditMetricContentForm.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";

export function useOnSaveUnchanged(
    setShowUnsavedChangesConfirmDialog: (value: boolean) => void,
    comp: MutableRefObject<IEditMetricDialogFormApi | undefined>,
    metricToSave: IMeasureDef | undefined,
    onCancel: (value: { cancelMode: CancelMode }) => void,
): {
    onSaveUnchangedChangesCallback: () => void;
    onCloseUnchangedChangesCallback: () => void;
    onCancelUnchangedChangesCallback: () => void;
} {
    return useMemo(() => {
        function onSaveUnchangedChangesCallback() {
            setShowUnsavedChangesConfirmDialog(false);
            if (metricToSave && comp.current) {
                if (metricToSave.isLocked) {
                    comp.current.saveAs();
                } else {
                    comp.current?.save();
                }
            }
        }

        function onCloseUnchangedChangesCallback() {
            setShowUnsavedChangesConfirmDialog(false);
        }

        function onCancelUnchangedChangesCallback() {
            setShowUnsavedChangesConfirmDialog(false);
            onCancel({ cancelMode: CancelMode.Continue });
        }

        return {
            onSaveUnchangedChangesCallback,
            onCloseUnchangedChangesCallback,
            onCancelUnchangedChangesCallback,
        };
    }, [comp, metricToSave, setShowUnsavedChangesConfirmDialog, onCancel]);
}
