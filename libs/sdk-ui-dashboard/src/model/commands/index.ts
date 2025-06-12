// (C) 2021-2025 GoodData Corporation

import {
    InitializeDashboard,
    RenameDashboard,
    ResetDashboard,
    SaveDashboard,
    SaveDashboardAs,
    ExportDashboardToPdf,
    ExportDashboardToExcel,
    DeleteDashboard,
    ChangeSharing,
    SetDashboardDateFilterConfigMode,
    SetDashboardAttributeFilterConfigMode,
    SetDashboardDateFilterWithDimensionConfigMode,
    SetDateFilterConfigTitle,
    SetAttributeFilterLimitingItems,
    SetDashboardAttributeFilterConfigDisplayAsLabel,
    ExportDashboardToPdfPresentation,
    ExportDashboardToPptPresentation,
    ChangeIgnoreExecutionTimestamp,
} from "./dashboard.js";
import { TriggerEvent } from "./events.js";
import { UpsertExecutionResult } from "./executionResults.js";
import {
    AddAttributeFilter,
    ChangeAttributeFilterSelection,
    ChangeDateFilterSelection,
    MoveAttributeFilter,
    RemoveAttributeFilters,
    SetAttributeFilterParents,
    ChangeFilterContextSelection,
    SetAttributeFilterDisplayForm,
    SetAttributeFilterTitle,
    SetAttributeFilterSelectionMode,
    AddDateFilter,
    RemoveDateFilters,
    MoveDateFilter,
    SetAttributeFilterDependentDateFilters,
    SaveFilterView,
    ApplyFilterView,
    DeleteFilterView,
    SetFilterViewAsDefault,
    ReloadFilterViews,
    ApplyFilterContextWorkingSelection,
    ResetFilterContextWorkingSelection,
} from "./filters.js";
import {
    ChangeInsightWidgetFilterSettings,
    ChangeInsightWidgetHeader,
    ChangeInsightWidgetDescription,
    ChangeInsightWidgetInsight,
    ChangeInsightWidgetVisProperties,
    ChangeInsightWidgetVisConfiguration,
    ModifyDrillsForInsightWidget,
    RefreshInsightWidget,
    RemoveDrillsForInsightWidget,
    ExportInsightWidget,
    ExportRawInsightWidget,
    RemoveDrillDownForInsightWidget,
    AddDrillDownForInsightWidget,
    ModifyDrillDownForInsightWidget,
    AttributeHierarchyModified,
    ChangeInsightWidgetIgnoreCrossFiltering,
    ExportSlidesInsightWidget,
    ExportImageInsightWidget,
} from "./insight.js";
import {
    ChangeKpiWidgetComparison,
    ChangeKpiWidgetFilterSettings,
    ChangeKpiWidgetHeader,
    ChangeKpiWidgetDescription,
    ChangeKpiWidgetConfiguration,
    ChangeKpiWidgetMeasure,
    RefreshKpiWidget,
    SetDrillForKpiWidget,
    RemoveDrillForKpiWidget,
} from "./kpi.js";
import { ChangeRichTextWidgetContent, ChangeRichTextWidgetFilterSettings } from "./richText.js";
import {
    AddVisualizationToVisualizationSwitcherWidgetContent,
    UpdateVisualizationsFromVisualizationSwitcherWidgetContent,
} from "./visualizationSwitcher.js";
import {
    AddLayoutSection,
    AddSectionItems,
    ChangeLayoutSectionHeader,
    MoveLayoutSection,
    MoveSectionItem,
    MoveSectionItemToNewSection,
    RemoveLayoutSection,
    RemoveSectionItem,
    ReplaceSectionItem,
    UndoLayoutChanges,
    ResizeHeight,
    ResizeWidth,
    RemoveSectionItemByWidgetRef,
    SetScreenSize,
    ToggleLayoutSectionHeaders,
} from "./layout.js";
import { CreateAlert, SaveAlert } from "./alerts.js";
import {
    CreateScheduledEmail,
    SaveScheduledEmail,
    RefreshAutomations,
    InitializeAutomations,
} from "./scheduledEmail.js";
import {
    Drill,
    DrillDown,
    DrillToAttributeUrl,
    DrillToCustomUrl,
    DrillToDashboard,
    DrillToInsight,
    DrillToLegacyDashboard,
    ChangeDrillableItems,
    CrossFiltering,
} from "./drill.js";
import { AddDrillTargets } from "./drillTargets.js";
import { RequestAsyncRender, ResolveAsyncRender } from "./render.js";
import { ChangeRenderMode } from "./renderMode.js";
import { LoadAllWorkspaceUsers } from "./users.js";
import { SetShowWidgetAsTable } from "./showWidgetAsTable.js";

export type { DashboardCommandType, IDashboardCommand, CommandProcessingMeta } from "./base.js";
export type {
    InitializeDashboard,
    InitializeDashboardPayload,
    SaveDashboardAs,
    SaveDashboardAsPayload,
    SaveDashboard,
    SaveDashboardPayload,
    RenameDashboard,
    RenameDashboardPayload,
    ResetDashboard,
    ExportDashboardToPdf,
    ExportDashboardToPptPresentation,
    ExportDashboardToPdfPresentation,
    ExportDashboardToExcel,
    ExportDashboardToExcelPayload,
    DeleteDashboard,
    ChangeSharing,
    ChangeSharingPayload,
    SetDashboardDateFilterConfigMode,
    SetDashboardDateFilterConfigModePayload,
    SetDashboardDateFilterWithDimensionConfigMode,
    SetDashboardDateFilterWithDimensionConfigModePayload,
    SetDashboardAttributeFilterConfigMode,
    SetDashboardAttributeFilterConfigModePayload,
    SetDateFilterConfigTitle,
    SetDateFilterConfigTitlePayload,
    SetAttributeFilterLimitingItems,
    SetAttributeFilterLimitingItemsPayload,
    SetDashboardAttributeFilterConfigDisplayAsLabel,
    SetDashboardAttributeFilterConfigDisplayAsLabelPayload,
    ChangeIgnoreExecutionTimestamp,
    ChangeIgnoreExecutionTimestampPayload,
    ExportDashboardToPresentationPayload,
} from "./dashboard.js";
export {
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
} from "./dashboard.js";

export type { TriggerEvent, TriggerEventPayload } from "./events.js";
export { triggerEvent } from "./events.js";

export type {
    ChangeDateFilterSelection,
    AddAttributeFilter,
    AddAttributeFilterPayload,
    MoveAttributeFilter,
    MoveAttributeFilterPayload,
    RemoveAttributeFilters,
    RemoveAttributeFiltersPayload,
    AddDateFilter,
    AddDateFilterPayload,
    RemoveDateFilters,
    RemoveDateFiltersPayload,
    MoveDateFilter,
    MoveDateFilterPayload,
    ChangeAttributeFilterSelection,
    AttributeFilterSelectionType,
    SetAttributeFilterParents,
    SetAttributeFilterParentsPayload,
    ChangeAttributeFilterSelectionPayload,
    ChangeFilterContextSelection,
    ChangeFilterContextSelectionPayload,
    DateFilterSelection,
    ChangeFilterContextSelectionParams,
    SetAttributeFilterDisplayForm,
    SetAttributeFilterDisplayFormPayload,
    SetAttributeFilterTitle,
    SetAttributeFilterTitlePayload,
    SetAttributeFilterSelectionMode,
    SetAttributeFilterSelectionModePayload,
    SetAttributeFilterDependentDateFilters,
    SetAttributeFilterDependentDateFiltersPayload,
    SaveFilterView,
    SaveFilterViewPayload,
    DeleteFilterView,
    DeleteFilterViewPayload,
    ApplyFilterView,
    ApplyFilterViewPayload,
    SetFilterViewAsDefault,
    SetFilterViewAsDefaultPayload,
    ReloadFilterViews,
    ApplyFilterContextWorkingSelection,
    ResetFilterContextWorkingSelection,
} from "./filters.js";
export {
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
} from "./filters.js";

export type {
    AddLayoutSection,
    AddLayoutSectionPayload,
    MoveLayoutSection,
    MoveLayoutSectionPayload,
    RemoveLayoutSection,
    RemoveLayoutSectionPayload,
    ChangeLayoutSectionHeader,
    ChangeLayoutSectionHeaderPayload,
    AddSectionItems,
    AddSectionItemsPayload,
    ReplaceSectionItem,
    ReplaceSectionItemPayload,
    MoveSectionItem,
    MoveSectionItemPayload,
    MoveSectionItemToNewSection,
    MoveSectionItemToNewSectionPayload,
    RemoveSectionItem,
    RemoveSectionItemPayload,
    RemoveSectionItemByWidgetRef,
    RemoveSectionItemByWidgetRefPayload,
    UndoLayoutChanges,
    UndoLayoutChangesPayload,
    DashboardLayoutCommands,
    UndoPointSelector,
    ResizeHeight,
    ResizeHeightPayload,
    ResizeWidth,
    ResizeWidthPayload,
    SetScreenSize,
    SetScreenSizePayload,
    ToggleLayoutSectionHeaders,
    ToggleLayoutSectionHeadersPayload,
} from "./layout.js";
export {
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
} from "./layout.js";

export type { CreateAlert, CreateAlertPayload, SaveAlert, SaveAlertPayload } from "./alerts.js";
export { createAlert, saveAlert } from "./alerts.js";

export type {
    CreateScheduledEmail,
    CreateScheduledEmailPayload,
    SaveScheduledEmail,
    SaveScheduledEmailPayload,
    RefreshAutomations,
    InitializeAutomations,
} from "./scheduledEmail.js";
export {
    createScheduledEmail,
    saveScheduledEmail,
    refreshAutomations,
    initializeAutomations,
} from "./scheduledEmail.js";

export type {
    Drill,
    DrillPayload,
    DrillDown,
    DrillDownPayload,
    DrillToAttributeUrl,
    DrillToAttributeUrlPayload,
    DrillToCustomUrl,
    DrillToCustomUrlPayload,
    DrillToDashboard,
    DrillToDashboardPayload,
    DrillToInsight,
    DrillToInsightPayload,
    DrillToLegacyDashboard,
    DrillToLegacyDashboardPayload,
    ChangeDrillableItems,
    ChangeDrillableItemsPayload,
    DashboardDrillCommand,
    CrossFiltering,
    CrossFilteringPayload,
} from "./drill.js";
export {
    drill,
    drillDown,
    drillToAttributeUrl,
    drillToCustomUrl,
    drillToDashboard,
    drillToInsight,
    drillToLegacyDashboard,
    changeDrillableItems,
    crossFiltering,
} from "./drill.js";

export type { UpsertExecutionResult } from "./executionResults.js";
export {
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultLoading,
} from "./executionResults.js";

export type {
    ChangeKpiWidgetHeader,
    ChangeKpiWidgetHeaderPayload,
    ChangeKpiWidgetDescription,
    ChangeKpiWidgetDescriptionPayload,
    ChangeKpiWidgetConfiguration,
    ChangeKpiWidgetConfigurationPayload,
    ChangeKpiWidgetMeasure,
    ChangeKpiWidgetMeasurePayload,
    ChangeKpiWidgetFilterSettings,
    ChangeKpiWidgetFilterSettingsPayload,
    ChangeKpiWidgetComparison,
    ChangeKpiWidgetComparisonPayload,
    RefreshKpiWidget,
    RefreshKpiWidgetPayload,
    KpiWidgetComparison,
    RemoveDrillForKpiWidget,
    RemoveDrillForKpiWidgetPayload,
    SetDrillForKpiWidget,
    SetDrillForKpiWidgetPayload,
} from "./kpi.js";
export {
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
} from "./kpi.js";

export type {
    ChangeInsightWidgetHeader,
    ChangeInsightWidgetHeaderPayload,
    ChangeInsightWidgetDescription,
    ChangeInsightWidgetDescriptionPayload,
    ChangeInsightWidgetIgnoreCrossFiltering,
    ChangeInsightWidgetIgnoreCrossFilteringPayload,
    ChangeInsightWidgetFilterSettings,
    ChangeInsightWidgetFilterSettingsPayload,
    ChangeInsightWidgetVisProperties,
    ChangeInsightWidgetVisPropertiesPayload,
    ChangeInsightWidgetVisConfiguration,
    ChangeInsightWidgetVisConfigurationPayload,
    ChangeInsightWidgetInsight,
    ChangeInsightWidgetInsightPayload,
    ModifyDrillsForInsightWidget,
    ModifyDrillsForInsightWidgetPayload,
    RemoveDrillsForInsightWidget,
    RemoveDrillsForInsightWidgetPayload,
    RemoveDrillDownForInsightWidget,
    RemoveDrillDownForInsightWidgetPayload,
    AddDrillDownForInsightWidget,
    AddDrillDownForInsightWidgetPayload,
    ModifyDrillDownForInsightWidget,
    ModifyDrillDownForInsightWidgetPayload,
    RemoveDrillsSelector,
    RefreshInsightWidget,
    RefreshInsightWidgetPayload,
    ExportInsightWidget,
    ExportInsightWidgetPayload,
    AttributeHierarchyModified,
    ExportRawInsightWidget,
    ExportRawInsightWidgetPayload,
    ExportSlidesInsightWidget,
    ExportSlidesInsightWidgetPayload,
    ExportImageInsightWidget,
    ExportImageInsightWidgetPayload,
} from "./insight.js";
export type { SetShowWidgetAsTable } from "./showWidgetAsTable.js";

export {
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
    addDrillDownForInsightWidget,
    modifyDrillDownForInsightWidget,
    refreshInsightWidget,
    exportInsightWidget,
    exportRawInsightWidget,
    exportSlidesInsightWidget,
    attributeHierarchyModified,
    exportImageInsightWidget,
} from "./insight.js";
export { loadAllWorkspaceUsers } from "./users.js";
export type { LoadAllWorkspaceUsers } from "./users.js";

export type {
    ChangeRichTextWidgetContent,
    ChangeRichTextWidgetContentPayload,
    ChangeRichTextWidgetFilterSettings,
    ChangeRichTextWidgetFilterSettingsPayload,
} from "./richText.js";
export { changeRichTextWidgetContent, enableRichTextWidgetDateFilter } from "./richText.js";

export type {
    AddVisualizationToVisualizationSwitcherWidgetContent,
    AddVisualizationToVisualizationSwitcherWidgetContentPayload,
    UpdateVisualizationsFromVisualizationSwitcherWidgetContent,
    UpdateVisualizationsFromVisualizationSwitcherWidgetontentPayload,
} from "./visualizationSwitcher.js";
export {
    addVisualizationToSwitcherWidgetContent,
    updateVisualizationsFromSwitcherWidgetContent,
} from "./visualizationSwitcher.js";

export type {
    RequestAsyncRender,
    RequestAsyncRenderPayload,
    ResolveAsyncRender,
    ResolveAsyncRenderPayload,
} from "./render.js";
export { requestAsyncRender, resolveAsyncRender } from "./render.js";

export type { ChangeRenderMode, ChangeRenderModePayload, RenderModeChangeOptions } from "./renderMode.js";
export { changeRenderMode, cancelEditRenderMode, switchToEditRenderMode } from "./renderMode.js";

export type { AddDrillTargets, AddDrillTargetsPayload } from "./drillTargets.js";
export { addDrillTargets } from "./drillTargets.js";

export type { SetShowWidgetAsTablePayload } from "./showWidgetAsTable.js";
export { setShowWidgetAsTable } from "./showWidgetAsTable.js";

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
    | ChangeRenderMode
    | SaveDashboard
    | RenameDashboard
    | ResetDashboard
    | ExportDashboardToPdf
    | ExportDashboardToExcel
    | ExportDashboardToPdfPresentation
    | ExportDashboardToPptPresentation
    | DeleteDashboard
    | TriggerEvent
    | UpsertExecutionResult
    | AddAttributeFilter
    | RemoveAttributeFilters
    | MoveAttributeFilter
    | SetAttributeFilterParents
    | SetAttributeFilterDependentDateFilters
    | AddLayoutSection
    | MoveLayoutSection
    | RemoveLayoutSection
    | ChangeLayoutSectionHeader
    | ResizeHeight
    | ResizeWidth
    | AddSectionItems
    | ReplaceSectionItem
    | MoveSectionItem
    | MoveSectionItemToNewSection
    | RemoveSectionItem
    | RemoveSectionItemByWidgetRef
    | UndoLayoutChanges
    | ChangeKpiWidgetHeader
    | ChangeKpiWidgetDescription
    | ChangeKpiWidgetConfiguration
    | ChangeKpiWidgetMeasure
    | ChangeKpiWidgetFilterSettings
    | ChangeKpiWidgetComparison
    | RefreshKpiWidget
    | SetDrillForKpiWidget
    | RemoveDrillForKpiWidget
    | ChangeInsightWidgetHeader
    | ChangeInsightWidgetDescription
    | ChangeInsightWidgetIgnoreCrossFiltering
    | ChangeInsightWidgetFilterSettings
    | ChangeInsightWidgetVisProperties
    | ChangeInsightWidgetVisConfiguration
    | ChangeInsightWidgetInsight
    | ModifyDrillsForInsightWidget
    | RemoveDrillsForInsightWidget
    | RefreshInsightWidget
    | ExportInsightWidget
    | CreateAlert
    | SaveAlert
    | CreateScheduledEmail
    | SaveScheduledEmail
    | ChangeSharing
    | SetAttributeFilterDisplayForm
    | SetAttributeFilterTitle
    | SetAttributeFilterSelectionMode
    | ChangeRichTextWidgetContent
    | ChangeRichTextWidgetFilterSettings
    | AddVisualizationToVisualizationSwitcherWidgetContent
    | UpdateVisualizationsFromVisualizationSwitcherWidgetContent
    //alpha
    | Drill
    | DrillDown
    | DrillToAttributeUrl
    | DrillToCustomUrl
    | DrillToDashboard
    | DrillToInsight
    | DrillToLegacyDashboard
    | ChangeDrillableItems
    | AddDrillTargets
    | SetDashboardDateFilterConfigMode
    | SetDashboardAttributeFilterConfigMode
    | SetDashboardAttributeFilterConfigDisplayAsLabel
    | RemoveDrillDownForInsightWidget
    | AddDrillDownForInsightWidget
    | ModifyDrillDownForInsightWidget
    | CrossFiltering
    | AttributeHierarchyModified
    | AddDateFilter
    | RemoveDateFilters
    | MoveDateFilter
    | SetDashboardDateFilterWithDimensionConfigMode
    | SetDateFilterConfigTitle
    | InitializeAutomations
    | RefreshAutomations
    | SetAttributeFilterLimitingItems
    | SaveFilterView
    | DeleteFilterView
    | ApplyFilterView
    | SetFilterViewAsDefault
    | ReloadFilterViews
    | ToggleLayoutSectionHeaders
    | ApplyFilterContextWorkingSelection
    | ResetFilterContextWorkingSelection
    | ChangeIgnoreExecutionTimestamp
    //internal
    | SetScreenSize
    | LoadAllWorkspaceUsers
    | ExportRawInsightWidget
    | ExportSlidesInsightWidget
    | ExportImageInsightWidget
    | SetShowWidgetAsTable;
