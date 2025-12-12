// (C) 2021-2025 GoodData Corporation

import { type CreateAlert, type SaveAlert } from "./alerts.js";
import {
    type ChangeIgnoreExecutionTimestamp,
    type ChangeSharing,
    type DeleteDashboard,
    type ExportDashboardToExcel,
    type ExportDashboardToPdf,
    type ExportDashboardToPdfPresentation,
    type ExportDashboardToPptPresentation,
    type InitializeDashboard,
    type RenameDashboard,
    type ResetDashboard,
    type SaveDashboard,
    type SaveDashboardAs,
    type SetAttributeFilterLimitingItems,
    type SetDashboardAttributeFilterConfigDisplayAsLabel,
    type SetDashboardAttributeFilterConfigMode,
    type SetDashboardDateFilterConfigMode,
    type SetDashboardDateFilterWithDimensionConfigMode,
    type SetDateFilterConfigTitle,
} from "./dashboard.js";
import {
    type ChangeDrillableItems,
    type CrossFiltering,
    type Drill,
    type DrillDown,
    type DrillToAttributeUrl,
    type DrillToCustomUrl,
    type DrillToDashboard,
    type DrillToInsight,
    type DrillToLegacyDashboard,
    type KeyDriverAnalysis,
} from "./drill.js";
import { type AddDrillTargets } from "./drillTargets.js";
import { type TriggerEvent } from "./events.js";
import { type UpsertExecutionResult } from "./executionResults.js";
import {
    type AddAttributeFilter,
    type AddDateFilter,
    type ApplyFilterContextWorkingSelection,
    type ApplyFilterView,
    type ChangeAttributeFilterSelection,
    type ChangeDateFilterSelection,
    type ChangeFilterContextSelection,
    type DeleteFilterView,
    type MoveAttributeFilter,
    type MoveDateFilter,
    type ReloadFilterViews,
    type RemoveAttributeFilters,
    type RemoveDateFilters,
    type ResetFilterContextWorkingSelection,
    type SaveFilterView,
    type SetAttributeFilterDependentDateFilters,
    type SetAttributeFilterDisplayForm,
    type SetAttributeFilterParents,
    type SetAttributeFilterSelectionMode,
    type SetAttributeFilterTitle,
    type SetFilterViewAsDefault,
} from "./filters.js";
import {
    type AddDrillDownForInsightWidget,
    type AttributeHierarchyModified,
    type ChangeInsightWidgetDescription,
    type ChangeInsightWidgetFilterSettings,
    type ChangeInsightWidgetHeader,
    type ChangeInsightWidgetIgnoreCrossFiltering,
    type ChangeInsightWidgetInsight,
    type ChangeInsightWidgetVisConfiguration,
    type ChangeInsightWidgetVisProperties,
    type ExportImageInsightWidget,
    type ExportInsightWidget,
    type ExportRawInsightWidget,
    type ExportSlidesInsightWidget,
    type ModifyDrillDownForInsightWidget,
    type ModifyDrillsForInsightWidget,
    type RefreshInsightWidget,
    type RemoveDrillDownForInsightWidget,
    type RemoveDrillToUrlForInsightWidget,
    type RemoveDrillsForInsightWidget,
} from "./insight.js";
import {
    type ChangeKpiWidgetComparison,
    type ChangeKpiWidgetConfiguration,
    type ChangeKpiWidgetDescription,
    type ChangeKpiWidgetFilterSettings,
    type ChangeKpiWidgetHeader,
    type ChangeKpiWidgetMeasure,
    type RefreshKpiWidget,
    type RemoveDrillForKpiWidget,
    type SetDrillForKpiWidget,
} from "./kpi.js";
import {
    type AddLayoutSection,
    type AddSectionItems,
    type ChangeLayoutSectionHeader,
    type MoveLayoutSection,
    type MoveSectionItem,
    type MoveSectionItemToNewSection,
    type RemoveLayoutSection,
    type RemoveSectionItem,
    type RemoveSectionItemByWidgetRef,
    type ReplaceSectionItem,
    type ResizeHeight,
    type ResizeWidth,
    type SetScreenSize,
    type ToggleLayoutDirection,
    type ToggleLayoutSectionHeaders,
    type UndoLayoutChanges,
} from "./layout.js";
import { type RequestAsyncRender, type ResolveAsyncRender } from "./render.js";
import { type ChangeRenderMode } from "./renderMode.js";
import { type ChangeRichTextWidgetContent, type ChangeRichTextWidgetFilterSettings } from "./richText.js";
import {
    type CreateScheduledEmail,
    type InitializeAutomations,
    type RefreshAutomations,
    type SaveScheduledEmail,
} from "./scheduledEmail.js";
import { type SetShowWidgetAsTable } from "./showWidgetAsTable.js";
import {
    type CancelRenamingDashboardTab,
    type ConvertDashboardTabFromDefault,
    type CreateDashboardTab,
    type DeleteDashboardTab,
    type RenameDashboardTab,
    type RepositionDashboardTab,
    type StartRenamingDashboardTab,
    type SwitchDashboardTab,
} from "./tabs.js";
import { type LoadAllWorkspaceUsers } from "./users.js";
import {
    type AddVisualizationToVisualizationSwitcherWidgetContent,
    type UpdateVisualizationsFromVisualizationSwitcherWidgetContent,
} from "./visualizationSwitcher.js";

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
    PdfConfiguration,
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
    ToggleLayoutDirection,
    ToggleLayoutDirectionPayload,
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
    toggleLayoutDirection,
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
    KeyDriverAnalysis,
    KeyDriverAnalysisPayload,
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
    keyDriverAnalysis,
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
    RemoveDrillToUrlForInsightWidget,
    RemoveDrillToUrlForInsightWidgetPayload,
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
    removeDrillToUrlForInsightWidget,
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
export {
    changeRichTextWidgetContent,
    enableRichTextWidgetDateFilter,
    disableRichTextWidgetDateFilter,
    ignoreDateFilterOnRichTextWidget,
    unignoreDateFilterOnRichTextWidget,
    ignoreFilterOnRichTextWidget,
    unignoreFilterOnRichTextWidget,
} from "./richText.js";

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
export type {
    SwitchDashboardTab,
    SwitchDashboardTabPayload,
    ConvertDashboardTabFromDefault,
    ConvertDashboardTabFromDefaultPayload,
    CreateDashboardTab,
    CreateDashboardTabPayload,
    RepositionDashboardTab,
    RepositionDashboardTabPayload,
    DeleteDashboardTab,
    DeleteDashboardTabPayload,
    StartRenamingDashboardTab,
    StartRenamingDashboardTabPayload,
    CancelRenamingDashboardTab,
    CancelRenamingDashboardTabPayload,
    RenameDashboardTab,
    RenameDashboardTabPayload,
} from "./tabs.js";
export {
    switchDashboardTab,
    repositionDashboardTab,
    convertDashboardTabFromDefault,
    createDashboardTab,
    deleteDashboardTab,
    startRenamingDashboardTab,
    cancelRenamingDashboardTab,
    renameDashboardTab,
} from "./tabs.js";

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
    | RemoveDrillToUrlForInsightWidget
    | AddDrillDownForInsightWidget
    | ModifyDrillDownForInsightWidget
    | CrossFiltering
    | KeyDriverAnalysis
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
    | ToggleLayoutDirection
    | ApplyFilterContextWorkingSelection
    | ResetFilterContextWorkingSelection
    | ChangeIgnoreExecutionTimestamp
    | SwitchDashboardTab
    | ConvertDashboardTabFromDefault
    | CreateDashboardTab
    | RepositionDashboardTab
    | DeleteDashboardTab
    | StartRenamingDashboardTab
    | CancelRenamingDashboardTab
    | RenameDashboardTab
    //internal
    | SetScreenSize
    | LoadAllWorkspaceUsers
    | ExportRawInsightWidget
    | ExportSlidesInsightWidget
    | ExportImageInsightWidget
    | SetShowWidgetAsTable;
