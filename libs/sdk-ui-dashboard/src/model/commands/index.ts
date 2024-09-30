// (C) 2021-2024 GoodData Corporation

import {
    InitializeDashboard,
    RenameDashboard,
    ResetDashboard,
    SaveDashboard,
    SaveDashboardAs,
    ExportDashboardToPdf,
    DeleteDashboard,
    ChangeSharing,
    SetDashboardDateFilterConfigMode,
    SetDashboardAttributeFilterConfigMode,
    SetDashboardDateFilterWithDimensionConfigMode,
    SetDateFilterConfigTitle,
    SetAttributeFilterLimitingItems,
    SetDashboardAttributeFilterConfigDisplayAsLabel,
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
    RemoveDrillDownForInsightWidget,
    AddDrillDownForInsightWidget,
    ModifyDrillDownForInsightWidget,
    AttributeHierarchyModified,
    ChangeInsightWidgetIgnoreCrossFiltering,
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
import { ChangeRichTextWidgetContent } from "./richText.js";
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
    deleteDashboard,
    changeSharing,
    setDashboardDateFilterConfigMode,
    setDashboardDateFilterWithDimensionConfigMode,
    setDashboardAttributeFilterConfigMode,
    setDateFilterConfigTitle,
    setAttributeFilterLimitingItems,
    setDashboardAttributeFilterConfigDisplayAsLabel,
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
} from "./layout.js";
export {
    addLayoutSection,
    moveLayoutSection,
    removeLayoutSection,
    changeLayoutSectionHeader,
    addSectionItem,
    replaceSectionItem,
    moveSectionItem,
    moveSectionItemAndRemoveOriginalSectionIfEmpty,
    moveSectionItemToNewSection,
    moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
    removeSectionItem,
    eagerRemoveSectionItem,
    removeSectionItemByWidgetRef,
    eagerRemoveSectionItemByWidgetRef,
    undoLayoutChanges,
    revertLastLayoutChange,
    resizeHeight,
    resizeWidth,
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
} from "./insight.js";
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
    attributeHierarchyModified,
} from "./insight.js";

export type { ChangeRichTextWidgetContent, ChangeRichTextWidgetContentPayload } from "./richText.js";
export { changeRichTextWidgetContent } from "./richText.js";

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
    | ReloadFilterViews;
