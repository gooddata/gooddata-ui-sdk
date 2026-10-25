// (C) 2021-2026 GoodData Corporation

import { type ReactNode, type Ref, createContext } from "react";

import {
    type IInsight,
    type IMeasureMetadataObject,
    type IMetadataObject,
    type IWorkspacePermissions,
} from "@gooddata/sdk-model";

import { type IUseTabsProps } from "../shared/Tabs/hooks/useTabs.js";
import { type ITab } from "../shared/Tabs/Tab.js";

import { type IManageMetricsApi } from "./ManageMetrics.js";
import { type IDeleteMetricInfo } from "./metric/deleteInfo.js";
import { type IMeasureDef } from "./metric/metricHelpers.js";
import { type ISaveMetricInfo } from "./metric/saveInfo.js";
import { type IChangeIdDialogProps } from "./MetricState/hooks/useChangeIdDialog.js";
import { type IUnsavedChangesDialogProps } from "./MetricState/hooks/useUnsavedChanges.js";
import {
    CloseAllStatus,
    type CloseAllTabsResult,
    type IMetricInfo,
    type IMetricInfoDraft,
} from "./MetricState/metricState.data.js";
import { useMetricState } from "./MetricState/useMetricState.js";

export interface IMultipleMetricsContextType {
    tabsProps: IUseTabsProps<IMetricInfo>;
    updateTab: (tab: ITab<IMetricInfo>, props: Partial<ITab<IMetricInfo>>) => void;
    updateData: (tab: ITab<IMetricInfo>, data: IMetricInfo) => void;
    onSave?: (
        tab: ITab<IMetricInfo>,
        metric: IMeasureMetadataObject,
        info: ISaveMetricInfo,
        err: Error | null,
    ) => Promise<void> | void;
    activeInsight?: IInsight;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
    closeTab: (tab: ITab<IMetricInfo>) => void;
    createTab?: () => void;
    activateTab: (tab: ITab<IMetricInfo>) => void;
    onDelete?: (metric: IMeasureMetadataObject, info: IDeleteMetricInfo, err: Error | null) => void;
    onMetricsChange?: (metric: IMeasureDef) => void;
    onCancel?: (tab: ITab<IMetricInfo>) => void;
    unsavedChangesDialog: IUnsavedChangesDialogProps;
    closeUnsavedChangesDialog: () => void;
    cancelUnsavedChangesDialog: () => void;
    saveUnsavedChangesDialog: () => void;
    closeAllTabs: () => Promise<CloseAllTabsResult>;
    changeIdDialog: IChangeIdDialogProps;
    cancelChangeId: () => void;
    saveChangeId: () => void;
    closeChangeId: () => void;
}

export const MultipleMetricsContext = createContext<IMultipleMetricsContextType>({
    //tabs
    tabsProps: { tabs: [], active: -1 },
    updateData: () => {},
    updateTab: () => {},
    closeTab: () => {},
    activateTab: () => {},
    //unsaved changes dialog
    unsavedChangesDialog: { showDialog: false, tabs: [] },
    closeUnsavedChangesDialog: () => {},
    cancelUnsavedChangesDialog: () => {},
    closeAllTabs: () => Promise.resolve({ status: CloseAllStatus.Close }),
    //change id dialog
    changeIdDialog: {
        oldId: "",
        newId: "",
        conflicts: { conflictWith: [], usableIds: [] },
        saveMode: undefined,
        idChanged: false,
        visible: false,
    },
    saveUnsavedChangesDialog: () => {},
    cancelChangeId: () => {},
    saveChangeId: () => {},
    closeChangeId: () => {},
});

/**
 * @internal
 */
export interface IMultipleMetricsProps {
    active: number;
    metrics: IMetricInfo[];
    ref?: Ref<IManageMetricsApi | undefined>;
    permissions?: IWorkspacePermissions;
    activeInsight?: IInsight;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
    onDelete?: (metric: IMeasureMetadataObject, info: IDeleteMetricInfo, err: Error | null) => void;
    onSave?: (
        metric: IMeasureMetadataObject,
        info: ISaveMetricInfo,
        err: Error | null,
    ) => Promise<void> | void;
    onDirtyChanged?: (dirty: boolean) => void;
    onMetricsChange?: (metric: IMeasureDef) => void;
    onCancel: (metricInfo: IMetricInfo) => void;
    onClose: (metricInfos: IMetricInfo[]) => void;
    activateTab: (metricInfo: IMetricInfo) => void;
    openTab: (metricInfo: IMetricInfoDraft) => void;
    createTab: () => void;
    children?: ReactNode;
}

/**
 * @internal
 */
export function MultipleMetricsState({
    children,
    active,
    metrics = [],
    permissions,
    createTab,
    activateTab,
    openTab,
    onSave,
    onDelete,
    onMetricsChange,
    metricOpenType,
    onMetricClick,
    activeInsight,
    insightOpenType,
    onInsightClick,
    onDirtyChanged,
    onClose,
    onCancel,
}: IMultipleMetricsProps) {
    const metricStateProps = useMetricState({
        active,
        permissions,
        metrics,
        activateTab,
        createTab,
        openTab,
        onSave,
        onDelete,
        onMetricsChange,
        metricOpenType,
        onMetricClick,
        activeInsight,
        insightOpenType,
        onInsightClick,
        onDirtyChanged,
        onClose,
        onCancel,
    });

    return (
        <MultipleMetricsContext.Provider value={metricStateProps}>{children}</MultipleMetricsContext.Provider>
    );
}
