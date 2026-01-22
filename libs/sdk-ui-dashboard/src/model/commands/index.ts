// (C) 2021-2026 GoodData Corporation

import {
    type ICreateAlert,
    type ICreateAlertPayload,
    type ISaveAlert,
    type ISaveAlertPayload,
    createAlert,
    saveAlert,
} from "./alerts.js";
import {
    type IChangeIgnoreExecutionTimestamp,
    type IChangeIgnoreExecutionTimestampPayload,
    type IChangeSharing,
    type IChangeSharingPayload,
    type IDeleteDashboard,
    type IExportDashboardToExcel,
    type IExportDashboardToExcelPayload,
    type IExportDashboardToPdf,
    type IExportDashboardToPdfPresentation,
    type IExportDashboardToPptPresentation,
    type IExportDashboardToPresentationPayload,
    type IRenameDashboard,
    type IRenameDashboardPayload,
    type IResetDashboard,
    type ISaveDashboard,
    type ISaveDashboardPayload,
    type ISetAttributeFilterLimitingItems,
    type ISetAttributeFilterLimitingItemsPayload,
    type ISetDashboardAttributeFilterConfigDisplayAsLabel,
    type ISetDashboardAttributeFilterConfigDisplayAsLabelPayload,
    type ISetDashboardAttributeFilterConfigMode,
    type ISetDashboardAttributeFilterConfigModePayload,
    type ISetDashboardDateFilterConfigMode,
    type ISetDashboardDateFilterConfigModePayload,
    type ISetDashboardDateFilterWithDimensionConfigMode,
    type ISetDashboardDateFilterWithDimensionConfigModePayload,
    type ISetDateFilterConfigTitle,
    type ISetDateFilterConfigTitlePayload,
    InitialLoadCorrelationId,
    type InitializeDashboard,
    type InitializeDashboardPayload,
    type PdfConfiguration,
    type SaveDashboardAs,
    type SaveDashboardAsPayload,
    changeIgnoreExecutionTimestamp,
    changeSharing,
    deleteDashboard,
    exportDashboardToExcel,
    exportDashboardToPdf,
    exportDashboardToPdfPresentation,
    exportDashboardToPptPresentation,
    initializeDashboard,
    initializeDashboardWithPersistedDashboard,
    renameDashboard,
    resetDashboard,
    saveDashboard,
    saveDashboardAs,
    setAttributeFilterLimitingItems,
    setDashboardAttributeFilterConfigDisplayAsLabel,
    setDashboardAttributeFilterConfigMode,
    setDashboardDateFilterConfigMode,
    setDashboardDateFilterWithDimensionConfigMode,
    setDateFilterConfigTitle,
} from "./dashboard.js";
import {
    type DashboardDrillCommand,
    type IChangeDrillableItems,
    type IChangeDrillableItemsPayload,
    type ICrossFiltering,
    type ICrossFilteringPayload,
    type IDrill,
    type IDrillDown,
    type IDrillDownPayload,
    type IDrillPayload,
    type IDrillToAttributeUrl,
    type IDrillToAttributeUrlPayload,
    type IDrillToCustomUrl,
    type IDrillToCustomUrlPayload,
    type IDrillToDashboard,
    type IDrillToDashboardPayload,
    type IDrillToInsight,
    type IDrillToInsightPayload,
    type IDrillToLegacyDashboard,
    type IDrillToLegacyDashboardPayload,
    type IKeyDriverAnalysis,
    type IKeyDriverAnalysisPayload,
    changeDrillableItems,
    crossFiltering,
    drill,
    drillDown,
    drillToAttributeUrl,
    drillToCustomUrl,
    drillToDashboard,
    drillToInsight,
    drillToLegacyDashboard,
    keyDriverAnalysis,
} from "./drill.js";
import { type IAddDrillTargets, type IAddDrillTargetsPayload, addDrillTargets } from "./drillTargets.js";
import { type ITriggerEvent, type ITriggerEventPayload, triggerEvent } from "./events.js";
import {
    type IUpsertExecutionResult,
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultLoading,
} from "./executionResults.js";
import {
    type AddAttributeFilterPayload,
    type AttributeFilterSelectionType,
    type ChangeAttributeFilterSelection,
    type ChangeAttributeFilterSelectionPayload,
    type ChangeDateFilterSelection,
    type ChangeFilterContextSelection,
    type ChangeFilterContextSelectionParams,
    type ChangeFilterContextSelectionPayload,
    type DateFilterSelection,
    type IAddAttributeFilter,
    type IAddDateFilter,
    type IAddDateFilterPayload,
    type IApplyFilterContextWorkingSelection,
    type IApplyFilterView,
    type IApplyFilterViewPayload,
    type IDeleteFilterView,
    type IDeleteFilterViewPayload,
    type IMoveAttributeFilter,
    type IMoveDateFilter,
    type IReloadFilterViews,
    type IRemoveAttributeFilters,
    type IRemoveAttributeFiltersPayload,
    type IRemoveDateFilters,
    type IRemoveDateFiltersPayload,
    type IResetFilterContextWorkingSelection,
    type ISaveFilterView,
    type ISaveFilterViewPayload,
    type ISetAttributeFilterDependentDateFilters,
    type ISetAttributeFilterDisplayForm,
    type ISetAttributeFilterDisplayFormPayload,
    type ISetAttributeFilterParents,
    type ISetAttributeFilterSelectionMode,
    type ISetAttributeFilterSelectionModePayload,
    type ISetAttributeFilterTitle,
    type ISetAttributeFilterTitlePayload,
    type ISetFilterViewAsDefault,
    type ISetFilterViewAsDefaultPayload,
    type MoveAttributeFilterPayload,
    type MoveDateFilterPayload,
    type SetAttributeFilterDependentDateFiltersPayload,
    type SetAttributeFilterParentsPayload,
    addAttributeFilter,
    addDateFilter,
    applyAttributeFilter,
    applyDateFilter,
    applyFilterContextWorkingSelection,
    applyFilterView,
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    changeFilterContextSelection,
    changeFilterContextSelectionByParams,
    changeMigratedAttributeFilterSelection,
    changeWorkingAttributeFilterSelection,
    clearDateFilterSelection,
    deleteFilterView,
    moveAttributeFilter,
    moveDateFilter,
    reloadFilterViews,
    removeAttributeFilter,
    removeAttributeFilters,
    removeDateFilter,
    resetAttributeFilterSelection,
    resetFilterContextWorkingSelection,
    saveFilterView,
    setAttributeFilterDependentDateFilters,
    setAttributeFilterDisplayForm,
    setAttributeFilterParents,
    setAttributeFilterSelectionMode,
    setAttributeFilterTitle,
    setFilterViewAsDefault,
} from "./filters.js";
import {
    type ChangeInsightWidgetVisConfiguration,
    type ChangeInsightWidgetVisConfigurationPayload,
    type IAddDrillDownForInsightWidget,
    type IAddDrillDownForInsightWidgetPayload,
    type IAttributeHierarchyModified,
    type IChangeInsightWidgetDescription,
    type IChangeInsightWidgetDescriptionPayload,
    type IChangeInsightWidgetFilterSettings,
    type IChangeInsightWidgetFilterSettingsPayload,
    type IChangeInsightWidgetHeader,
    type IChangeInsightWidgetHeaderPayload,
    type IChangeInsightWidgetIgnoreCrossFiltering,
    type IChangeInsightWidgetIgnoreCrossFilteringPayload,
    type IChangeInsightWidgetInsight,
    type IChangeInsightWidgetInsightPayload,
    type IChangeInsightWidgetVisProperties,
    type IChangeInsightWidgetVisPropertiesPayload,
    type IExportImageInsightWidget,
    type IExportImageInsightWidgetPayload,
    type IExportInsightWidget,
    type IExportInsightWidgetPayload,
    type IExportRawInsightWidget,
    type IExportRawInsightWidgetPayload,
    type IExportSlidesInsightWidget,
    type IExportSlidesInsightWidgetPayload,
    type IModifyDrillDownForInsightWidget,
    type IModifyDrillDownForInsightWidgetPayload,
    type IModifyDrillsForInsightWidget,
    type IModifyDrillsForInsightWidgetPayload,
    type IRefreshInsightWidget,
    type IRefreshInsightWidgetPayload,
    type IRemoveDrillDownForInsightWidget,
    type IRemoveDrillDownForInsightWidgetPayload,
    type IRemoveDrillToUrlForInsightWidget,
    type IRemoveDrillToUrlForInsightWidgetPayload,
    type IRemoveDrillsForInsightWidget,
    type IRemoveDrillsForInsightWidgetPayload,
    type RemoveDrillsSelector,
    addDrillDownForInsightWidget,
    attributeHierarchyModified,
    changeInsightWidgetDescription,
    changeInsightWidgetHeader,
    changeInsightWidgetIgnoreCrossFiltering,
    changeInsightWidgetInsight,
    changeInsightWidgetVisConfiguration,
    changeInsightWidgetVisProperties,
    disableInsightWidgetDateFilter,
    enableInsightWidgetDateFilter,
    exportImageInsightWidget,
    exportInsightWidget,
    exportRawInsightWidget,
    exportSlidesInsightWidget,
    ignoreDateFilterOnInsightWidget,
    ignoreFilterOnInsightWidget,
    modifyDrillDownForInsightWidget,
    modifyDrillsForInsightWidget,
    refreshInsightWidget,
    removeDrillDownForInsightWidget,
    removeDrillToUrlForInsightWidget,
    removeDrillsForInsightWidget,
    replaceInsightWidgetFilterSettings,
    replaceInsightWidgetIgnoredFilters,
    unignoreDateFilterOnInsightWidget,
    unignoreFilterOnInsightWidget,
} from "./insight.js";
import {
    type IChangeKpiWidgetComparison,
    type IChangeKpiWidgetComparisonPayload,
    type IChangeKpiWidgetConfiguration,
    type IChangeKpiWidgetConfigurationPayload,
    type IChangeKpiWidgetDescription,
    type IChangeKpiWidgetDescriptionPayload,
    type IChangeKpiWidgetFilterSettings,
    type IChangeKpiWidgetFilterSettingsPayload,
    type IChangeKpiWidgetHeader,
    type IChangeKpiWidgetHeaderPayload,
    type IChangeKpiWidgetMeasure,
    type IChangeKpiWidgetMeasurePayload,
    type IKpiWidgetComparison,
    type IRefreshKpiWidget,
    type IRefreshKpiWidgetPayload,
    type IRemoveDrillForKpiWidget,
    type IRemoveDrillForKpiWidgetPayload,
    type ISetDrillForKpiWidget,
    type ISetDrillForKpiWidgetPayload,
    changeKpiWidgetComparison,
    changeKpiWidgetConfiguration,
    changeKpiWidgetDescription,
    changeKpiWidgetHeader,
    changeKpiWidgetMeasure,
    disableKpiWidgetDateFilter,
    enableKpiWidgetDateFilter,
    ignoreFilterOnKpiWidget,
    refreshKpiWidget,
    removeDrillForKpiWidget,
    replaceKpiWidgetFilterSettings,
    replaceKpiWidgetIgnoredFilters,
    setDrillForKpiWidget,
    unignoreFilterOnKpiWidget,
} from "./kpi.js";
import {
    type ChangeLayoutSectionHeader,
    type ChangeLayoutSectionHeaderPayload,
    type DashboardLayoutCommands,
    type IAddLayoutSection,
    type IAddLayoutSectionPayload,
    type IAddSectionItems,
    type IAddSectionItemsPayload,
    type IMoveLayoutSection,
    type IMoveLayoutSectionPayload,
    type IMoveSectionItem,
    type IMoveSectionItemPayload,
    type IMoveSectionItemToNewSection,
    type IMoveSectionItemToNewSectionPayload,
    type IRemoveLayoutSection,
    type IRemoveLayoutSectionPayload,
    type IRemoveSectionItem,
    type IRemoveSectionItemByWidgetRef,
    type IRemoveSectionItemByWidgetRefPayload,
    type IRemoveSectionItemPayload,
    type IReplaceSectionItem,
    type IReplaceSectionItemPayload,
    type IResizeHeight,
    type IResizeHeightPayload,
    type IResizeWidth,
    type IResizeWidthPayload,
    type ISetScreenSize,
    type ISetScreenSizePayload,
    type IToggleLayoutDirection,
    type IToggleLayoutDirectionPayload,
    type IToggleLayoutSectionHeaders,
    type IToggleLayoutSectionHeadersPayload,
    type IUndoLayoutChanges,
    type IUndoLayoutChangesPayload,
    type UndoPointSelector,
    addLayoutSection,
    addNestedLayoutSection,
    addNestedLayoutSectionItem,
    addSectionItem,
    changeLayoutSectionHeader,
    changeNestedLayoutSectionHeader,
    eagerRemoveNestedLayoutSectionItem,
    eagerRemoveSectionItem,
    eagerRemoveSectionItemByWidgetRef,
    moveLayoutSection,
    moveNestedLayoutSection,
    moveNestedLayoutSectionItem,
    moveNestedLayoutSectionItemAndRemoveOriginalSectionIfEmpty,
    moveNestedLayoutSectionItemToNewSection,
    moveNestedLayoutSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
    moveSectionItem,
    moveSectionItemAndRemoveOriginalSectionIfEmpty,
    moveSectionItemToNewSection,
    moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
    removeLayoutSection,
    removeNestedLayoutSection,
    removeNestedLayoutSectionItem,
    removeSectionItem,
    removeSectionItemByWidgetRef,
    replaceNestedLayoutSectionItem,
    replaceSectionItem,
    resizeHeight,
    resizeNestedLayoutItemWidth,
    resizeNestedLayoutItemsHeight,
    resizeWidth,
    revertLastLayoutChange,
    setScreenSize,
    toggleLayoutDirection,
    toggleLayoutSectionHeaders,
    undoLayoutChanges,
} from "./layout.js";
import {
    type RequestAsyncRender,
    type RequestAsyncRenderPayload,
    type ResolveAsyncRender,
    type ResolveAsyncRenderPayload,
    requestAsyncRender,
    resolveAsyncRender,
} from "./render.js";
import {
    type IChangeRenderMode,
    type IChangeRenderModePayload,
    type IRenderModeChangeOptions,
    cancelEditRenderMode,
    changeRenderMode,
    switchToEditRenderMode,
} from "./renderMode.js";
import {
    type IChangeRichTextWidgetContent,
    type IChangeRichTextWidgetContentPayload,
    type IChangeRichTextWidgetFilterSettings,
    type IChangeRichTextWidgetFilterSettingsPayload,
    changeRichTextWidgetContent,
    disableRichTextWidgetDateFilter,
    enableRichTextWidgetDateFilter,
    ignoreDateFilterOnRichTextWidget,
    ignoreFilterOnRichTextWidget,
    unignoreDateFilterOnRichTextWidget,
    unignoreFilterOnRichTextWidget,
} from "./richText.js";
import {
    type ICreateScheduledEmail,
    type ICreateScheduledEmailPayload,
    type IInitializeAutomations,
    type IRefreshAutomations,
    type ISaveScheduledEmail,
    type ISaveScheduledEmailPayload,
    createScheduledEmail,
    initializeAutomations,
    refreshAutomations,
    saveScheduledEmail,
} from "./scheduledEmail.js";
import {
    type ISetShowWidgetAsTable,
    type ISetShowWidgetAsTablePayload,
    setShowWidgetAsTable,
} from "./showWidgetAsTable.js";
import {
    type ICancelRenamingDashboardTab,
    type ICancelRenamingDashboardTabPayload,
    type IConvertDashboardTabFromDefault,
    type IConvertDashboardTabFromDefaultPayload,
    type ICreateDashboardTab,
    type ICreateDashboardTabPayload,
    type IDeleteDashboardTab,
    type IDeleteDashboardTabPayload,
    type IRenameDashboardTab,
    type IRenameDashboardTabPayload,
    type IRepositionDashboardTab,
    type IRepositionDashboardTabPayload,
    type IStartRenamingDashboardTab,
    type IStartRenamingDashboardTabPayload,
    type ISwitchDashboardTab,
    type ISwitchDashboardTabPayload,
    cancelRenamingDashboardTab,
    convertDashboardTabFromDefault,
    createDashboardTab,
    deleteDashboardTab,
    renameDashboardTab,
    repositionDashboardTab,
    startRenamingDashboardTab,
    switchDashboardTab,
} from "./tabs.js";
import { type ILoadAllWorkspaceUsers, loadAllWorkspaceUsers } from "./users.js";
import {
    type IAddVisualizationToVisualizationSwitcherWidgetContent,
    type IAddVisualizationToVisualizationSwitcherWidgetContentPayload,
    type IUpdateVisualizationsFromVisualizationSwitcherWidgetContent,
    type IUpdateVisualizationsFromVisualizationSwitcherWidgetContentPayload,
    addVisualizationToSwitcherWidgetContent,
    updateVisualizationsFromSwitcherWidgetContent,
} from "./visualizationSwitcher.js";

export type { DashboardCommandType, IDashboardCommand, CommandProcessingMeta } from "./base.js";
export {
    type InitializeDashboard,
    type InitializeDashboardPayload,
    type SaveDashboardAs,
    type SaveDashboardAsPayload,
    type ISaveDashboard,
    type ISaveDashboardPayload,
    type IRenameDashboard,
    type IRenameDashboardPayload,
    type IResetDashboard,
    type IExportDashboardToPdf,
    type IExportDashboardToPptPresentation,
    type IExportDashboardToPdfPresentation,
    type IExportDashboardToExcel,
    type IExportDashboardToExcelPayload,
    type IDeleteDashboard,
    type IChangeSharing,
    type IChangeSharingPayload,
    type ISetDashboardDateFilterConfigMode,
    type ISetDashboardDateFilterConfigModePayload,
    type ISetDashboardDateFilterWithDimensionConfigMode,
    type ISetDashboardDateFilterWithDimensionConfigModePayload,
    type ISetDashboardAttributeFilterConfigMode,
    type ISetDashboardAttributeFilterConfigModePayload,
    type ISetDateFilterConfigTitle,
    type ISetDateFilterConfigTitlePayload,
    type ISetAttributeFilterLimitingItems,
    type ISetAttributeFilterLimitingItemsPayload,
    type ISetDashboardAttributeFilterConfigDisplayAsLabel,
    type ISetDashboardAttributeFilterConfigDisplayAsLabelPayload,
    type IChangeIgnoreExecutionTimestamp,
    type IChangeIgnoreExecutionTimestampPayload,
    type IExportDashboardToPresentationPayload,
    type PdfConfiguration,
    InitialLoadCorrelationId,
    initializeDashboard,
    initializeDashboardWithPersistedDashboard,
    saveDashboardAs,
    saveDashboard,
    renameDashboard,
    resetDashboard,
    exportDashboardToPdf,
    exportDashboardToExcel,
    exportDashboardToPdfPresentation,
    exportDashboardToPptPresentation,
    deleteDashboard,
    changeSharing,
    setDashboardDateFilterConfigMode,
    setDashboardDateFilterWithDimensionConfigMode,
    setDashboardAttributeFilterConfigMode,
    setDateFilterConfigTitle,
    setAttributeFilterLimitingItems,
    setDashboardAttributeFilterConfigDisplayAsLabel,
    changeIgnoreExecutionTimestamp,
};

export { type ITriggerEvent, type ITriggerEventPayload, triggerEvent };

export {
    type ChangeDateFilterSelection,
    type IAddAttributeFilter,
    type AddAttributeFilterPayload,
    type IMoveAttributeFilter,
    type MoveAttributeFilterPayload,
    type IRemoveAttributeFilters,
    type IRemoveAttributeFiltersPayload,
    type IAddDateFilter,
    type IAddDateFilterPayload,
    type IRemoveDateFilters,
    type IRemoveDateFiltersPayload,
    type IMoveDateFilter,
    type MoveDateFilterPayload,
    type ChangeAttributeFilterSelection,
    type AttributeFilterSelectionType,
    type ISetAttributeFilterParents,
    type SetAttributeFilterParentsPayload,
    type ChangeAttributeFilterSelectionPayload,
    type ChangeFilterContextSelection,
    type ChangeFilterContextSelectionPayload,
    type DateFilterSelection,
    type ChangeFilterContextSelectionParams,
    type ISetAttributeFilterDisplayForm,
    type ISetAttributeFilterDisplayFormPayload,
    type ISetAttributeFilterTitle,
    type ISetAttributeFilterTitlePayload,
    type ISetAttributeFilterSelectionMode,
    type ISetAttributeFilterSelectionModePayload,
    type ISetAttributeFilterDependentDateFilters,
    type SetAttributeFilterDependentDateFiltersPayload,
    type ISaveFilterView,
    type ISaveFilterViewPayload,
    type IDeleteFilterView,
    type IDeleteFilterViewPayload,
    type IApplyFilterView,
    type IApplyFilterViewPayload,
    type ISetFilterViewAsDefault,
    type ISetFilterViewAsDefaultPayload,
    type IReloadFilterViews,
    type IApplyFilterContextWorkingSelection,
    type IResetFilterContextWorkingSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    addAttributeFilter,
    moveAttributeFilter,
    removeAttributeFilter,
    removeAttributeFilters,
    addDateFilter,
    removeDateFilter,
    moveDateFilter,
    resetAttributeFilterSelection,
    changeAttributeFilterSelection,
    changeMigratedAttributeFilterSelection,
    changeWorkingAttributeFilterSelection,
    setAttributeFilterParents,
    changeFilterContextSelection,
    changeFilterContextSelectionByParams,
    applyAttributeFilter,
    applyDateFilter,
    setAttributeFilterDisplayForm,
    setAttributeFilterTitle,
    setAttributeFilterSelectionMode,
    setAttributeFilterDependentDateFilters,
    saveFilterView,
    deleteFilterView,
    applyFilterView,
    setFilterViewAsDefault,
    reloadFilterViews,
    applyFilterContextWorkingSelection,
    resetFilterContextWorkingSelection,
};

export {
    type IAddLayoutSection,
    type IAddLayoutSectionPayload,
    type IMoveLayoutSection,
    type IMoveLayoutSectionPayload,
    type IRemoveLayoutSection,
    type IRemoveLayoutSectionPayload,
    type ChangeLayoutSectionHeader,
    type ChangeLayoutSectionHeaderPayload,
    type IAddSectionItems,
    type IAddSectionItemsPayload,
    type IReplaceSectionItem,
    type IReplaceSectionItemPayload,
    type IMoveSectionItem,
    type IMoveSectionItemPayload,
    type IMoveSectionItemToNewSection,
    type IMoveSectionItemToNewSectionPayload,
    type IRemoveSectionItem,
    type IRemoveSectionItemPayload,
    type IRemoveSectionItemByWidgetRef,
    type IRemoveSectionItemByWidgetRefPayload,
    type IUndoLayoutChanges,
    type IUndoLayoutChangesPayload,
    type DashboardLayoutCommands,
    type UndoPointSelector,
    type IResizeHeight,
    type IResizeHeightPayload,
    type IResizeWidth,
    type IResizeWidthPayload,
    type ISetScreenSize,
    type ISetScreenSizePayload,
    type IToggleLayoutSectionHeaders,
    type IToggleLayoutSectionHeadersPayload,
    type IToggleLayoutDirection,
    type IToggleLayoutDirectionPayload,
    addLayoutSection,
    addNestedLayoutSection,
    moveLayoutSection,
    moveNestedLayoutSection,
    removeLayoutSection,
    removeNestedLayoutSection,
    changeLayoutSectionHeader,
    changeNestedLayoutSectionHeader,
    addSectionItem,
    addNestedLayoutSectionItem,
    replaceSectionItem,
    replaceNestedLayoutSectionItem,
    moveSectionItem,
    moveNestedLayoutSectionItem,
    moveSectionItemAndRemoveOriginalSectionIfEmpty,
    moveNestedLayoutSectionItemAndRemoveOriginalSectionIfEmpty,
    moveSectionItemToNewSection,
    moveNestedLayoutSectionItemToNewSection,
    moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
    moveNestedLayoutSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
    removeSectionItem,
    removeNestedLayoutSectionItem,
    eagerRemoveSectionItem,
    eagerRemoveNestedLayoutSectionItem,
    removeSectionItemByWidgetRef,
    eagerRemoveSectionItemByWidgetRef,
    undoLayoutChanges,
    revertLastLayoutChange,
    resizeHeight,
    resizeNestedLayoutItemsHeight,
    resizeWidth,
    resizeNestedLayoutItemWidth,
    setScreenSize,
    toggleLayoutSectionHeaders,
    toggleLayoutDirection,
};

export {
    type ICreateAlert,
    type ICreateAlertPayload,
    type ISaveAlert,
    type ISaveAlertPayload,
    createAlert,
    saveAlert,
};

export {
    type ICreateScheduledEmail,
    type ICreateScheduledEmailPayload,
    type ISaveScheduledEmail,
    type ISaveScheduledEmailPayload,
    type IRefreshAutomations,
    type IInitializeAutomations,
    createScheduledEmail,
    saveScheduledEmail,
    refreshAutomations,
    initializeAutomations,
};

export {
    type IDrill,
    type IDrillPayload,
    type IDrillDown,
    type IDrillDownPayload,
    type IDrillToAttributeUrl,
    type IDrillToAttributeUrlPayload,
    type IDrillToCustomUrl,
    type IDrillToCustomUrlPayload,
    type IDrillToDashboard,
    type IDrillToDashboardPayload,
    type IDrillToInsight,
    type IDrillToInsightPayload,
    type IDrillToLegacyDashboard,
    type IDrillToLegacyDashboardPayload,
    type IChangeDrillableItems,
    type IChangeDrillableItemsPayload,
    type DashboardDrillCommand,
    type ICrossFiltering,
    type ICrossFilteringPayload,
    type IKeyDriverAnalysis,
    type IKeyDriverAnalysisPayload,
    drill,
    drillDown,
    drillToAttributeUrl,
    drillToCustomUrl,
    drillToDashboard,
    drillToInsight,
    drillToLegacyDashboard,
    changeDrillableItems,
    crossFiltering,
    keyDriverAnalysis,
};

export {
    type IUpsertExecutionResult,
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultLoading,
};

export {
    type IChangeKpiWidgetHeader,
    type IChangeKpiWidgetHeaderPayload,
    type IChangeKpiWidgetDescription,
    type IChangeKpiWidgetDescriptionPayload,
    type IChangeKpiWidgetConfiguration,
    type IChangeKpiWidgetConfigurationPayload,
    type IChangeKpiWidgetMeasure,
    type IChangeKpiWidgetMeasurePayload,
    type IChangeKpiWidgetFilterSettings,
    type IChangeKpiWidgetFilterSettingsPayload,
    type IChangeKpiWidgetComparison,
    type IChangeKpiWidgetComparisonPayload,
    type IRefreshKpiWidget,
    type IRefreshKpiWidgetPayload,
    type IKpiWidgetComparison,
    type IRemoveDrillForKpiWidget,
    type IRemoveDrillForKpiWidgetPayload,
    type ISetDrillForKpiWidget,
    type ISetDrillForKpiWidgetPayload,
    changeKpiWidgetHeader,
    changeKpiWidgetDescription,
    changeKpiWidgetConfiguration,
    changeKpiWidgetMeasure,
    replaceKpiWidgetFilterSettings,
    enableKpiWidgetDateFilter,
    disableKpiWidgetDateFilter,
    replaceKpiWidgetIgnoredFilters,
    ignoreFilterOnKpiWidget,
    unignoreFilterOnKpiWidget,
    changeKpiWidgetComparison,
    refreshKpiWidget,
    removeDrillForKpiWidget,
    setDrillForKpiWidget,
};

export {
    type IChangeInsightWidgetHeader,
    type IChangeInsightWidgetHeaderPayload,
    type IChangeInsightWidgetDescription,
    type IChangeInsightWidgetDescriptionPayload,
    type IChangeInsightWidgetIgnoreCrossFiltering,
    type IChangeInsightWidgetIgnoreCrossFilteringPayload,
    type IChangeInsightWidgetFilterSettings,
    type IChangeInsightWidgetFilterSettingsPayload,
    type IChangeInsightWidgetVisProperties,
    type IChangeInsightWidgetVisPropertiesPayload,
    type ChangeInsightWidgetVisConfiguration,
    type ChangeInsightWidgetVisConfigurationPayload,
    type IChangeInsightWidgetInsight,
    type IChangeInsightWidgetInsightPayload,
    type IModifyDrillsForInsightWidget,
    type IModifyDrillsForInsightWidgetPayload,
    type IRemoveDrillsForInsightWidget,
    type IRemoveDrillsForInsightWidgetPayload,
    type IRemoveDrillDownForInsightWidget,
    type IRemoveDrillDownForInsightWidgetPayload,
    type IRemoveDrillToUrlForInsightWidget,
    type IRemoveDrillToUrlForInsightWidgetPayload,
    type IAddDrillDownForInsightWidget,
    type IAddDrillDownForInsightWidgetPayload,
    type IModifyDrillDownForInsightWidget,
    type IModifyDrillDownForInsightWidgetPayload,
    type RemoveDrillsSelector,
    type IRefreshInsightWidget,
    type IRefreshInsightWidgetPayload,
    type IExportInsightWidget,
    type IExportInsightWidgetPayload,
    type IAttributeHierarchyModified,
    type IExportRawInsightWidget,
    type IExportRawInsightWidgetPayload,
    type IExportSlidesInsightWidget,
    type IExportSlidesInsightWidgetPayload,
    type IExportImageInsightWidget,
    type IExportImageInsightWidgetPayload,
    changeInsightWidgetHeader,
    changeInsightWidgetDescription,
    changeInsightWidgetIgnoreCrossFiltering,
    replaceInsightWidgetFilterSettings,
    enableInsightWidgetDateFilter,
    disableInsightWidgetDateFilter,
    replaceInsightWidgetIgnoredFilters,
    ignoreFilterOnInsightWidget,
    unignoreFilterOnInsightWidget,
    ignoreDateFilterOnInsightWidget,
    unignoreDateFilterOnInsightWidget,
    changeInsightWidgetVisProperties,
    changeInsightWidgetVisConfiguration,
    changeInsightWidgetInsight,
    modifyDrillsForInsightWidget,
    removeDrillsForInsightWidget,
    removeDrillDownForInsightWidget,
    removeDrillToUrlForInsightWidget,
    addDrillDownForInsightWidget,
    modifyDrillDownForInsightWidget,
    refreshInsightWidget,
    exportInsightWidget,
    exportRawInsightWidget,
    exportSlidesInsightWidget,
    attributeHierarchyModified,
    exportImageInsightWidget,
};

export { type ILoadAllWorkspaceUsers, loadAllWorkspaceUsers };

export {
    type IChangeRichTextWidgetContent,
    type IChangeRichTextWidgetContentPayload,
    type IChangeRichTextWidgetFilterSettings,
    type IChangeRichTextWidgetFilterSettingsPayload,
    changeRichTextWidgetContent,
    enableRichTextWidgetDateFilter,
    disableRichTextWidgetDateFilter,
    ignoreDateFilterOnRichTextWidget,
    unignoreDateFilterOnRichTextWidget,
    ignoreFilterOnRichTextWidget,
    unignoreFilterOnRichTextWidget,
};

export {
    type IAddVisualizationToVisualizationSwitcherWidgetContent,
    type IAddVisualizationToVisualizationSwitcherWidgetContentPayload,
    type IUpdateVisualizationsFromVisualizationSwitcherWidgetContent,
    type IUpdateVisualizationsFromVisualizationSwitcherWidgetContentPayload,
    addVisualizationToSwitcherWidgetContent,
    updateVisualizationsFromSwitcherWidgetContent,
};

export {
    type RequestAsyncRender,
    type RequestAsyncRenderPayload,
    type ResolveAsyncRender,
    type ResolveAsyncRenderPayload,
    requestAsyncRender,
    resolveAsyncRender,
};

export {
    type IChangeRenderMode,
    type IChangeRenderModePayload,
    type IRenderModeChangeOptions,
    changeRenderMode,
    cancelEditRenderMode,
    switchToEditRenderMode,
};

export { type IAddDrillTargets, type IAddDrillTargetsPayload, addDrillTargets };

export { type ISetShowWidgetAsTable, type ISetShowWidgetAsTablePayload, setShowWidgetAsTable };

export {
    type ISwitchDashboardTab,
    type ISwitchDashboardTabPayload,
    type IConvertDashboardTabFromDefault,
    type IConvertDashboardTabFromDefaultPayload,
    type ICreateDashboardTab,
    type ICreateDashboardTabPayload,
    type IRepositionDashboardTab,
    type IRepositionDashboardTabPayload,
    type IDeleteDashboardTab,
    type IDeleteDashboardTabPayload,
    type IStartRenamingDashboardTab,
    type IStartRenamingDashboardTabPayload,
    type ICancelRenamingDashboardTab,
    type ICancelRenamingDashboardTabPayload,
    type IRenameDashboardTab,
    type IRenameDashboardTabPayload,
    switchDashboardTab,
    repositionDashboardTab,
    convertDashboardTabFromDefault,
    createDashboardTab,
    deleteDashboardTab,
    startRenamingDashboardTab,
    cancelRenamingDashboardTab,
    renameDashboardTab,
};

/**
 * Union type that contains all available built-in dashboard commands.
 *
 * @remarks
 * Note: while this type is marked as public most of the commands are currently an alpha-level API that
 * we reserve to change in the following releases. If you use those commands now, upgrading to the next
 * version of `@gooddata/sdk-ui-dashboard` will likely result in breakage.
 *
 * @public
 */
export type DashboardCommands =
    //public
    | InitializeDashboard
    | SaveDashboardAs
    | RequestAsyncRender
    | ResolveAsyncRender
    | ChangeFilterContextSelection
    | ChangeDateFilterSelection
    | ChangeAttributeFilterSelection
    //beta
    | IChangeRenderMode
    | ISaveDashboard
    | IRenameDashboard
    | IResetDashboard
    | IExportDashboardToPdf
    | IExportDashboardToExcel
    | IExportDashboardToPdfPresentation
    | IExportDashboardToPptPresentation
    | IDeleteDashboard
    | ITriggerEvent
    | IUpsertExecutionResult
    | IAddAttributeFilter
    | IRemoveAttributeFilters
    | IMoveAttributeFilter
    | ISetAttributeFilterParents
    | ISetAttributeFilterDependentDateFilters
    | IAddLayoutSection
    | IMoveLayoutSection
    | IRemoveLayoutSection
    | ChangeLayoutSectionHeader
    | IResizeHeight
    | IResizeWidth
    | IAddSectionItems
    | IReplaceSectionItem
    | IMoveSectionItem
    | IMoveSectionItemToNewSection
    | IRemoveSectionItem
    | IRemoveSectionItemByWidgetRef
    | IUndoLayoutChanges
    | IChangeKpiWidgetHeader
    | IChangeKpiWidgetDescription
    | IChangeKpiWidgetConfiguration
    | IChangeKpiWidgetMeasure
    | IChangeKpiWidgetFilterSettings
    | IChangeKpiWidgetComparison
    | IRefreshKpiWidget
    | ISetDrillForKpiWidget
    | IRemoveDrillForKpiWidget
    | IChangeInsightWidgetHeader
    | IChangeInsightWidgetDescription
    | IChangeInsightWidgetIgnoreCrossFiltering
    | IChangeInsightWidgetFilterSettings
    | IChangeInsightWidgetVisProperties
    | ChangeInsightWidgetVisConfiguration
    | IChangeInsightWidgetInsight
    | IModifyDrillsForInsightWidget
    | IRemoveDrillsForInsightWidget
    | IRefreshInsightWidget
    | IExportInsightWidget
    | ICreateAlert
    | ISaveAlert
    | ICreateScheduledEmail
    | ISaveScheduledEmail
    | IChangeSharing
    | ISetAttributeFilterDisplayForm
    | ISetAttributeFilterTitle
    | ISetAttributeFilterSelectionMode
    | IChangeRichTextWidgetContent
    | IChangeRichTextWidgetFilterSettings
    | IAddVisualizationToVisualizationSwitcherWidgetContent
    | IUpdateVisualizationsFromVisualizationSwitcherWidgetContent
    //alpha
    | IDrill
    | IDrillDown
    | IDrillToAttributeUrl
    | IDrillToCustomUrl
    | IDrillToDashboard
    | IDrillToInsight
    | IDrillToLegacyDashboard
    | IChangeDrillableItems
    | IAddDrillTargets
    | ISetDashboardDateFilterConfigMode
    | ISetDashboardAttributeFilterConfigMode
    | ISetDashboardAttributeFilterConfigDisplayAsLabel
    | IRemoveDrillDownForInsightWidget
    | IRemoveDrillToUrlForInsightWidget
    | IAddDrillDownForInsightWidget
    | IModifyDrillDownForInsightWidget
    | ICrossFiltering
    | IKeyDriverAnalysis
    | IAttributeHierarchyModified
    | IAddDateFilter
    | IRemoveDateFilters
    | IMoveDateFilter
    | ISetDashboardDateFilterWithDimensionConfigMode
    | ISetDateFilterConfigTitle
    | IInitializeAutomations
    | IRefreshAutomations
    | ISetAttributeFilterLimitingItems
    | ISaveFilterView
    | IDeleteFilterView
    | IApplyFilterView
    | ISetFilterViewAsDefault
    | IReloadFilterViews
    | IToggleLayoutSectionHeaders
    | IToggleLayoutDirection
    | IApplyFilterContextWorkingSelection
    | IResetFilterContextWorkingSelection
    | IChangeIgnoreExecutionTimestamp
    | ISwitchDashboardTab
    | IConvertDashboardTabFromDefault
    | ICreateDashboardTab
    | IRepositionDashboardTab
    | IDeleteDashboardTab
    | IStartRenamingDashboardTab
    | ICancelRenamingDashboardTab
    | IRenameDashboardTab
    //internal
    | ISetScreenSize
    | ILoadAllWorkspaceUsers
    | IExportRawInsightWidget
    | IExportSlidesInsightWidget
    | IExportImageInsightWidget
    | ISetShowWidgetAsTable;
