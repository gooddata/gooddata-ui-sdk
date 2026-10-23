// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import {
    type IInsight,
    type IMeasureMetadataObject,
    type IMetadataObject,
    type IWorkspacePermissions,
} from "@gooddata/sdk-model";

import { fullWorkspacePermissions } from "../../shared/permissions.js";
import { type IUseTabsProps } from "../../shared/Tabs/hooks/useTabs.js";
import { type ITab } from "../../shared/Tabs/Tab.js";
import { SaveNameMode } from "../Content/EditMetricContent.data.js";
import { type IDeleteMetricInfo } from "../metric/deleteInfo.js";
import {
    type IMeasureDef,
    createDraftEditMetricInfo,
    createDraftNewMetricInfo,
} from "../metric/metricHelpers.js";
import { type ISaveMetricInfo } from "../metric/saveInfo.js";
import { type IMultipleMetricsContextType } from "../MultipleMetricsState.js";

import { useChangeIdDialog } from "./hooks/useChangeIdDialog.js";
import { useDirtyChanged } from "./hooks/useDirtyChanged.js";
import { useSaveTab } from "./hooks/useSaveTab.js";
import { revertTabFromMetricInfo, useTabsData } from "./hooks/useTabsData.js";
import { useUnsavedChanges } from "./hooks/useUnsavedChanges.js";
import { useUpdateMetricData } from "./hooks/useUpdateMetricData.js";
import { useUpdateMetricTab } from "./hooks/useUpdateMetricTab.js";
import {
    CloseAllStatus,
    type CloseAllTabsResult,
    type IMetricInfo,
    type IMetricInfoDraft,
} from "./metricState.data.js";

export interface IUseMetricStateProps {
    active: number;
    metrics: IMetricInfo[];
    permissions?: IWorkspacePermissions;
    onSave?: (
        metric: IMeasureMetadataObject,
        info: ISaveMetricInfo,
        err: Error | null,
    ) => Promise<void> | void;
    onDelete?: (metric: IMeasureMetadataObject, info: IDeleteMetricInfo, err: Error | null) => void;
    onDirtyChanged?: (dirty: boolean) => void;
    onMetricsChange?: (metric: IMeasureDef) => void;
    activeInsight?: IInsight;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
    onCancel?: (metricInfo: IMetricInfo) => void;
    onClose?: (metricInfos: IMetricInfo[]) => void;
    activateTab?: (metricInfo: IMetricInfo) => void;
    createTab?: (metricInfo: IMetricInfoDraft) => void;
    openTab?: (metricInfo: IMetricInfoDraft) => void;
}

export const useMetricState = ({
    active,
    metrics,
    permissions = fullWorkspacePermissions(),
    activateTab,
    createTab,
    openTab,
    onSave,
    onDelete,
    onDirtyChanged,
    onMetricsChange,
    metricOpenType,
    onMetricClick,
    activeInsight,
    insightOpenType,
    onInsightClick,
    onClose,
    onCancel,
}: IUseMetricStateProps): IMultipleMetricsContextType => {
    const [data, setData] = useTabsData(metrics, active);
    const { canCreateMetric } = permissions;

    const updateTab = useUpdateMetricTab(setData);
    const updateData = useUpdateMetricData(data);

    const { changeIdDialog, handleChangeId, cancelChangeId, saveChangeId, closeChangeId } =
        useChangeIdDialog();

    const saveTabHandler = useSaveTab(handleChangeId, onMetricsChange, onSave);

    const {
        unsavedChangesDialog,
        openUnsavedChangesDialog,
        closeUnsavedChangesDialog,
        cancelUnsavedChangesDialog,
        saveUnsavedChangesDialog,
    } = useUnsavedChanges(onClose, saveTabHandler);

    const onCancelCallback = useCallback(
        (tab: ITab<IMetricInfo>) => {
            if (onCancel) {
                onCancel(tab.data);
            }
        },
        [onCancel],
    );

    const createHandler = useCallback(() => {
        if (createTab) {
            createTab(createDraftNewMetricInfo());
        }
    }, [createTab]);

    const closeTabHandler = useCallback(
        (tab: ITab<IMetricInfo>) => {
            if (tab.states?.dirty) {
                openUnsavedChangesDialog([tab]);
            } else {
                if (onClose) {
                    onClose([tab.data]);
                }
            }
        },
        [onClose, openUnsavedChangesDialog],
    );

    const closeAllTabs = useCallback((): Promise<CloseAllTabsResult> => {
        const isAnyDirty = data.metrics.some((tab) => tab.states?.dirty === true);
        if (!isAnyDirty) {
            const resolvedData = {
                status: CloseAllStatus.Complete,
                closedTabs: data.metrics.map((tab) => tab.data),
                invalidTabs: [],
            };
            if (onClose) {
                onClose(resolvedData.closedTabs);
            }
            return Promise.resolve(resolvedData);
        }
        return openUnsavedChangesDialog(data.metrics);
    }, [onClose, openUnsavedChangesDialog, data.metrics]);

    const activateTabHandler = useCallback(
        (tab: ITab<IMetricInfo>) => {
            if (activateTab) {
                activateTab(tab.data);
            }
        },
        [activateTab],
    );

    const tabsProps: IUseTabsProps<IMetricInfo> = useMemo(
        () => ({
            tabs: data.metrics,
            active: data.active,
            creatable: canCreateMetric,
            onTabActivate: activateTabHandler,
            onTabClose: closeTabHandler,
        }),
        [data, activateTabHandler, closeTabHandler, canCreateMetric],
    );

    const onSaveCallback = useCallback(
        (
            tab: ITab<IMetricInfo>,
            metric: IMeasureMetadataObject,
            info: ISaveMetricInfo,
            err: Error | null,
        ) => {
            if (!err) {
                if (metric?.id && info.saveMode === SaveNameMode.saveAsNew) {
                    const { formField, regenerateId, saveMode } = info;
                    updateTab(tab, revertTabFromMetricInfo(tab.data));
                    const metricInfo = createDraftEditMetricInfo(metric, saveMode, formField, regenerateId);
                    if (openTab) {
                        openTab(metricInfo);
                    }
                } else {
                    if (onClose) {
                        onClose([tab.data]);
                    }
                }
            }
            if (onSave) {
                onSave(metric, info, err);
            }
        },
        [onSave, onClose, openTab, updateTab],
    );

    const onDeleteCallback = useCallback(
        (metric: IMeasureMetadataObject, info: IDeleteMetricInfo, err: Error | null) => {
            if (!err) {
                const metricInfo = metrics.find((item) => item.initial.id === metric.id);
                if (onClose && metricInfo) {
                    onClose([metricInfo]);
                }
            }
            if (onDelete) {
                onDelete(metric, info, err);
            }
        },
        [onDelete, onClose, metrics],
    );

    useDirtyChanged(tabsProps.tabs, onDirtyChanged);

    return {
        tabsProps,
        updateTab,
        updateData,
        createTab: createHandler,
        closeTab: closeTabHandler,
        activateTab: activateTabHandler,
        onMetricsChange,
        metricOpenType,
        onMetricClick,
        activeInsight,
        insightOpenType,
        onInsightClick,
        onSave: onSaveCallback,
        onDelete: onDeleteCallback,
        onCancel: onCancelCallback,
        unsavedChangesDialog,
        closeUnsavedChangesDialog,
        cancelUnsavedChangesDialog,
        saveUnsavedChangesDialog,
        closeAllTabs,
        changeIdDialog,
        cancelChangeId,
        saveChangeId,
        closeChangeId,
    };
};
