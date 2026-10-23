// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useRef, useState } from "react";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { useMetrics } from "../../shared/metrics/useMetrics.js";
import { type MetricIdConflicts } from "../ConflictContext/useConflictDetection.js";
import { SaveNameMode } from "../Content/EditMetricContent.data.js";
import { type FormField } from "../Form/data.js";
import { type IEditMetricDialogFormApi } from "../Form/EditMetricContentForm.js";
import { usePrefixes } from "../Form/Prefixes/usePrefixes.js";
import { type IMeasureDef, type IMeasureSetting } from "../metric/metricHelpers.js";
import { addPrefixToMeasure } from "../metric/prefixHelper.js";

import { useDirtyChanged } from "./useDirtyChanged.js";
import { type CancelData, type SaveData } from "./useEditCallbacks.js";
import { useFocusedField } from "./useFocusedField.js";
import { useIdCallbacks } from "./useIdCallbacks.js";
import { useInitialValueMetric } from "./useInitialValueMetric.js";
import { useOnCloseOrCancel } from "./useOnCloseOrCancel.js";
import { useOnSaveUnchanged } from "./useOnSaveUnchanged.js";
import { useSaveAsClick } from "./useSaveAsClick.js";
import { useSaveClick } from "./useSaveClick.js";

export type MetricContentState = {
    comp: MutableRefObject<IEditMetricDialogFormApi | undefined>;
    showIdChangeConfirmDialog: {
        visible: boolean;
        conflicts: MetricIdConflicts;
        idChanged: boolean;
        oldId: string;
        newId: string;
    };
    showUnsavedChangesConfirmDialog: boolean;
    initialValueMetric: IMeasureDef;
    initialFocusedField: FormField;
    initialRegenerateId: boolean;
    defaultId: string;
    defaultPrefix: string;
    onSaveClick: (metricToSave: IMeasureDef, force?: boolean) => Promise<void>;
    onSaveAsClick: (metricToSave: IMeasureDef) => Promise<void>;
    onDirtyChangedCallback: (dirty: boolean) => void;
    onValueChangedCallback: (value: IMeasureDef, valid: boolean) => void;
    onSaveKeepIdClick: () => void;
    onSaveChangeIdClick: () => void;
    onCloseIdChange: () => void;
    onCloseCallback: (metric: Partial<IMeasureDef>, valid: boolean) => void;
    onCancelCallback: () => void;
    onSaveUnchangedChangesCallback: () => void;
    onCloseUnchangedChangesCallback: () => void;
    onCancelUnchangedChangesCallback: () => void;
    onSettingsChangeCallback: (settings: Partial<IMeasureSetting>) => void;
};
export function useMetricContentState(
    metric: IMeasureDef,
    focusedField: FormField | undefined,
    regenerateId: boolean | undefined,
    saveMode: SaveNameMode | undefined,
    onSave: (value: Required<SaveData>) => Promise<void>,
    onCancel: (value: CancelData) => void,
    onDirtyChanged?: (dirty: boolean, id: string) => void,
    onValueChange?: (value: IMeasureDef, valid: boolean) => void,
    onSettingsChange?: (settings: Partial<IMeasureSetting>) => void,
): MetricContentState {
    const comp = useRef<IEditMetricDialogFormApi>(undefined);
    const [idChangeData, setChangeData] = useState({
        visible: false,
        conflicts: { conflictWith: [], usableIds: [] } as MetricIdConflicts,
        idChanged: false,
        oldId: "",
        newId: "",
    });
    const [showUnsavedChangesConfirmDialog, setShowUnsavedChangesConfirmDialog] = useState(false);
    const [metricToSave, setMetricToSave] = useState<IMeasureDef>();
    const [dirty, setDirty] = useState(false);
    const prefixes = usePrefixes();

    const updatedMetric = addPrefixToMeasure(metric, prefixes?.current);
    const [initialValueMetric, setInitialValueMetric] = useInitialValueMetric(updatedMetric);

    const [initialFocusedField, setInitialFocusedField] = useFocusedField(initialValueMetric, focusedField);

    const [initialSaveMode, setInitialSaveMode] = useState(
        saveMode || (hasRef(initialValueMetric) ? SaveNameMode.save : SaveNameMode.saveAsNew),
    );
    const [initialRegenerateId, setInitialRegenerateId] = useState(
        Boolean(
            regenerateId ||
            (initialSaveMode === SaveNameMode.saveAsNew && saveMode !== SaveNameMode.saveAsNew),
        ),
    );

    const [defaultId] = useState(updatedMetric.id || "");
    const [defaultPrefix] = useState(updatedMetric.prefix || "");
    const metrics = useMetrics();

    const onSaveClick = useSaveClick(defaultId, setChangeData, setMetricToSave, onSave, initialSaveMode);

    const onSaveAsClick = useSaveAsClick(
        defaultId,
        initialValueMetric,
        metrics.result || [],
        onSave,
        setInitialValueMetric,
        setInitialFocusedField,
        setInitialSaveMode,
        setInitialRegenerateId,
    );

    const { onSaveKeepIdClick, onSaveChangeIdClick, onCloseIdChange } = useIdCallbacks(
        idChangeData,
        setChangeData,
        comp,
        metricToSave,
        defaultId,
    );

    const onDirtyChangedCallback = useDirtyChanged(onDirtyChanged, setDirty, defaultId);
    const { onCloseCallback, onCancelCallback } = useOnCloseOrCancel(
        dirty,
        onCancel,
        setMetricToSave,
        setShowUnsavedChangesConfirmDialog,
    );
    const {
        onSaveUnchangedChangesCallback,
        onCloseUnchangedChangesCallback,
        onCancelUnchangedChangesCallback,
    } = useOnSaveUnchanged(setShowUnsavedChangesConfirmDialog, comp, metricToSave, onCancel);

    const onValueChangedCallback = useCallback(
        (value: IMeasureDef, valid: boolean) => onValueChange?.(value, valid),
        [onValueChange],
    );

    const onSettingsChangeCallback = useCallback(
        (setting: Partial<IMeasureSetting>) => onSettingsChange?.(setting),
        [onSettingsChange],
    );

    return {
        comp,
        defaultId,
        defaultPrefix,
        // The suggestion only runs while there is no object to name. Once the metric exists its
        // ID is its API identifier, and following the title would replace the metric on save.
        initialRegenerateId: initialRegenerateId && !hasRef(initialValueMetric),
        showIdChangeConfirmDialog: idChangeData,
        showUnsavedChangesConfirmDialog,
        initialValueMetric,
        initialFocusedField,
        onSaveClick,
        onSaveAsClick,
        onDirtyChangedCallback,
        onValueChangedCallback,
        onSaveKeepIdClick,
        onSaveChangeIdClick,
        onCloseIdChange,
        onSaveUnchangedChangesCallback,
        onCloseUnchangedChangesCallback,
        onCancelUnchangedChangesCallback,
        onSettingsChangeCallback,
        onCloseCallback,
        onCancelCallback,
    };
}

function hasRef(metric: IMeasureDef): metric is IMeasureMetadataObject {
    return Boolean((metric as IMeasureMetadataObject).ref);
}
