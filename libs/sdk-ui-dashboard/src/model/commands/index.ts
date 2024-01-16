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
import { CreateAlert, RemoveAlerts, UpdateAlert } from "./alerts.js";
import { CreateScheduledEmail, SaveScheduledEmail } from "./scheduledEmail.js";
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

export { DashboardCommandType, IDashboardCommand, CommandProcessingMeta } from "./base.js";
export {
    InitialLoadCorrelationId,
    InitializeDashboard,
    InitializeDashboardPayload,
    initializeDashboard,
    initializeDashboardWithPersistedDashboard,
    SaveDashboardAs,
    SaveDashboardAsPayload,
    saveDashboardAs,
    SaveDashboard,
    SaveDashboardPayload,
    saveDashboard,
    RenameDashboard,
    RenameDashboardPayload,
    renameDashboard,
    ResetDashboard,
    resetDashboard,
    ExportDashboardToPdf,
    exportDashboardToPdf,
    DeleteDashboard,
    deleteDashboard,
    ChangeSharing,
    ChangeSharingPayload,
    changeSharing,
    SetDashboardDateFilterConfigMode,
    SetDashboardDateFilterConfigModePayload,
    setDashboardDateFilterConfigMode,
    SetDashboardDateFilterWithDimensionConfigMode,
    SetDashboardDateFilterWithDimensionConfigModePayload,
    setDashboardDateFilterWithDimensionConfigMode,
    SetDashboardAttributeFilterConfigMode,
    setDashboardAttributeFilterConfigMode,
    SetDashboardAttributeFilterConfigModePayload,
    SetDateFilterConfigTitle,
    SetDateFilterConfigTitlePayload,
    setDateFilterConfigTitle,
} from "./dashboard.js";

export { TriggerEvent, TriggerEventPayload, triggerEvent } from "./events.js";

export {
    ChangeDateFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    AddAttributeFilter,
    AddAttributeFilterPayload,
    addAttributeFilter,
    MoveAttributeFilter,
    MoveAttributeFilterPayload,
    moveAttributeFilter,
    RemoveAttributeFilters,
    RemoveAttributeFiltersPayload,
    removeAttributeFilter,
    removeAttributeFilters,
    AddDateFilter,
    AddDateFilterPayload,
    addDateFilter,
    RemoveDateFilters,
    RemoveDateFiltersPayload,
    removeDateFilter,
    MoveDateFilter,
    MoveDateFilterPayload,
    moveDateFilter,
    ChangeAttributeFilterSelection,
    AttributeFilterSelectionType,
    resetAttributeFilterSelection,
    changeAttributeFilterSelection,
    SetAttributeFilterParents,
    SetAttributeFilterParentsPayload,
    setAttributeFilterParents,
    ChangeAttributeFilterSelectionPayload,
    ChangeFilterContextSelection,
    ChangeFilterContextSelectionPayload,
    DateFilterSelection,
    changeFilterContextSelection,
    applyAttributeFilter,
    applyDateFilter,
    SetAttributeFilterDisplayForm,
    SetAttributeFilterDisplayFormPayload,
    setAttributeFilterDisplayForm,
    SetAttributeFilterTitle,
    SetAttributeFilterTitlePayload,
    setAttributeFilterTitle,
    SetAttributeFilterSelectionMode,
    SetAttributeFilterSelectionModePayload,
    setAttributeFilterSelectionMode,
} from "./filters.js";

export {
    AddLayoutSection,
    AddLayoutSectionPayload,
    addLayoutSection,
    MoveLayoutSection,
    MoveLayoutSectionPayload,
    moveLayoutSection,
    RemoveLayoutSection,
    RemoveLayoutSectionPayload,
    removeLayoutSection,
    ChangeLayoutSectionHeader,
    ChangeLayoutSectionHeaderPayload,
    changeLayoutSectionHeader,
    AddSectionItems,
    AddSectionItemsPayload,
    addSectionItem,
    ReplaceSectionItem,
    ReplaceSectionItemPayload,
    replaceSectionItem,
    MoveSectionItem,
    MoveSectionItemPayload,
    moveSectionItem,
    moveSectionItemAndRemoveOriginalSectionIfEmpty,
    MoveSectionItemToNewSection,
    MoveSectionItemToNewSectionPayload,
    moveSectionItemToNewSection,
    moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
    RemoveSectionItem,
    RemoveSectionItemPayload,
    removeSectionItem,
    eagerRemoveSectionItem,
    RemoveSectionItemByWidgetRef,
    RemoveSectionItemByWidgetRefPayload,
    removeSectionItemByWidgetRef,
    eagerRemoveSectionItemByWidgetRef,
    UndoLayoutChanges,
    UndoLayoutChangesPayload,
    undoLayoutChanges,
    revertLastLayoutChange,
    DashboardLayoutCommands,
    UndoPointSelector,
    ResizeHeight,
    ResizeHeightPayload,
    resizeHeight,
    ResizeWidth,
    ResizeWidthPayload,
    resizeWidth,
} from "./layout.js";

export {
    CreateAlert,
    CreateAlertPayload,
    createAlert,
    RemoveAlerts,
    RemoveAlertsPayload,
    removeAlerts,
    UpdateAlert,
    UpdateAlertPayload,
    updateAlert,
} from "./alerts.js";

export {
    CreateScheduledEmail,
    CreateScheduledEmailPayload,
    createScheduledEmail,
    SaveScheduledEmail,
    SaveScheduledEmailPayload,
    saveScheduledEmail,
} from "./scheduledEmail.js";

export {
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

export {
    UpsertExecutionResult,
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultLoading,
} from "./executionResults.js";

export {
    ChangeKpiWidgetHeader,
    ChangeKpiWidgetHeaderPayload,
    changeKpiWidgetHeader,
    ChangeKpiWidgetDescription,
    ChangeKpiWidgetDescriptionPayload,
    changeKpiWidgetDescription,
    ChangeKpiWidgetConfiguration,
    ChangeKpiWidgetConfigurationPayload,
    changeKpiWidgetConfiguration,
    ChangeKpiWidgetMeasure,
    ChangeKpiWidgetMeasurePayload,
    changeKpiWidgetMeasure,
    ChangeKpiWidgetFilterSettings,
    ChangeKpiWidgetFilterSettingsPayload,
    replaceKpiWidgetFilterSettings,
    enableKpiWidgetDateFilter,
    disableKpiWidgetDateFilter,
    replaceKpiWidgetIgnoredFilters,
    ignoreFilterOnKpiWidget,
    unignoreFilterOnKpiWidget,
    ChangeKpiWidgetComparison,
    ChangeKpiWidgetComparisonPayload,
    changeKpiWidgetComparison,
    RefreshKpiWidget,
    RefreshKpiWidgetPayload,
    refreshKpiWidget,
    KpiWidgetComparison,
    RemoveDrillForKpiWidget,
    RemoveDrillForKpiWidgetPayload,
    removeDrillForKpiWidget,
    SetDrillForKpiWidget,
    SetDrillForKpiWidgetPayload,
    setDrillForKpiWidget,
} from "./kpi.js";

export {
    ChangeInsightWidgetHeader,
    ChangeInsightWidgetHeaderPayload,
    changeInsightWidgetHeader,
    ChangeInsightWidgetDescription,
    ChangeInsightWidgetDescriptionPayload,
    changeInsightWidgetDescription,
    ChangeInsightWidgetFilterSettings,
    ChangeInsightWidgetFilterSettingsPayload,
    replaceInsightWidgetFilterSettings,
    enableInsightWidgetDateFilter,
    disableInsightWidgetDateFilter,
    replaceInsightWidgetIgnoredFilters,
    ignoreFilterOnInsightWidget,
    unignoreFilterOnInsightWidget,
    ignoreDateFilterOnInsightWidget,
    unignoreDateFilterOnInsightWidget,
    ChangeInsightWidgetVisProperties,
    ChangeInsightWidgetVisPropertiesPayload,
    changeInsightWidgetVisProperties,
    ChangeInsightWidgetVisConfiguration,
    ChangeInsightWidgetVisConfigurationPayload,
    changeInsightWidgetVisConfiguration,
    ChangeInsightWidgetInsight,
    ChangeInsightWidgetInsightPayload,
    changeInsightWidgetInsight,
    ModifyDrillsForInsightWidget,
    ModifyDrillsForInsightWidgetPayload,
    modifyDrillsForInsightWidget,
    RemoveDrillsForInsightWidget,
    RemoveDrillsForInsightWidgetPayload,
    removeDrillsForInsightWidget,
    RemoveDrillDownForInsightWidget,
    RemoveDrillDownForInsightWidgetPayload,
    removeDrillDownForInsightWidget,
    AddDrillDownForInsightWidget,
    AddDrillDownForInsightWidgetPayload,
    addDrillDownForInsightWidget,
    ModifyDrillDownForInsightWidget,
    ModifyDrillDownForInsightWidgetPayload,
    modifyDrillDownForInsightWidget,
    RemoveDrillsSelector,
    RefreshInsightWidget,
    RefreshInsightWidgetPayload,
    refreshInsightWidget,
    ExportInsightWidget,
    ExportInsightWidgetPayload,
    exportInsightWidget,
    AttributeHierarchyModified,
    attributeHierarchyModified,
} from "./insight.js";

export {
    ChangeRichTextWidgetContent,
    ChangeRichTextWidgetContentPayload,
    changeRichTextWidgetContent,
} from "./richText.js";

export {
    RequestAsyncRender,
    RequestAsyncRenderPayload,
    ResolveAsyncRender,
    ResolveAsyncRenderPayload,
    requestAsyncRender,
    resolveAsyncRender,
} from "./render.js";

export {
    changeRenderMode,
    cancelEditRenderMode,
    switchToEditRenderMode,
    ChangeRenderMode,
    ChangeRenderModePayload,
    RenderModeChangeOptions,
} from "./renderMode.js";

export { AddDrillTargets, AddDrillTargetsPayload, addDrillTargets } from "./drillTargets.js";

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
    | ChangeInsightWidgetFilterSettings
    | ChangeInsightWidgetVisProperties
    | ChangeInsightWidgetVisConfiguration
    | ChangeInsightWidgetInsight
    | ModifyDrillsForInsightWidget
    | RemoveDrillsForInsightWidget
    | RefreshInsightWidget
    | ExportInsightWidget
    | CreateAlert
    | UpdateAlert
    | RemoveAlerts
    | CreateScheduledEmail
    | SaveScheduledEmail
    | ChangeSharing
    | SetAttributeFilterDisplayForm
    | SetAttributeFilterTitle
    | SetAttributeFilterSelectionMode
    | ChangeRichTextWidgetContent
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
    | RemoveDrillDownForInsightWidget
    | AddDrillDownForInsightWidget
    | ModifyDrillDownForInsightWidget
    | CrossFiltering
    | AttributeHierarchyModified
    | AddDateFilter
    | RemoveDateFilters
    | MoveDateFilter
    | SetDashboardDateFilterWithDimensionConfigMode
    | SetDateFilterConfigTitle;
