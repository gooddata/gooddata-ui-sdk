// (C) 2021-2022 GoodData Corporation

import {
    InitializeDashboard,
    RenameDashboard,
    ResetDashboard,
    SaveDashboard,
    SaveDashboardAs,
    ExportDashboardToPdf,
    DeleteDashboard,
    ChangeSharing,
} from "./dashboard";
import { TriggerEvent } from "./events";
import { UpsertExecutionResult } from "./executionResults";
import {
    AddAttributeFilter,
    ChangeAttributeFilterSelection,
    ChangeDateFilterSelection,
    MoveAttributeFilter,
    RemoveAttributeFilters,
    SetAttributeFilterParent,
    ChangeFilterContextSelection,
} from "./filters";
import {
    ChangeInsightWidgetFilterSettings,
    ChangeInsightWidgetHeader,
    ChangeInsightWidgetInsight,
    ChangeInsightWidgetVisProperties,
    ModifyDrillsForInsightWidget,
    RefreshInsightWidget,
    RemoveDrillsForInsightWidget,
    ExportInsightWidget,
} from "./insight";
import {
    ChangeKpiWidgetComparison,
    ChangeKpiWidgetFilterSettings,
    ChangeKpiWidgetHeader,
    ChangeKpiWidgetMeasure,
    RefreshKpiWidget,
} from "./kpi";
import {
    AddLayoutSection,
    AddSectionItems,
    ChangeLayoutSectionHeader,
    MoveLayoutSection,
    MoveSectionItem,
    RemoveLayoutSection,
    RemoveSectionItem,
    ReplaceSectionItem,
    UndoLayoutChanges,
} from "./layout";
import { CreateAlert, RemoveAlerts, UpdateAlert } from "./alerts";
import { CreateScheduledEmail } from "./scheduledEmail";
import {
    Drill,
    DrillDown,
    DrillToAttributeUrl,
    DrillToCustomUrl,
    DrillToDashboard,
    DrillToInsight,
    DrillToLegacyDashboard,
    ChangeDrillableItems,
} from "./drill";
import { AddDrillTargets } from "./drillTargets";
import { RequestAsyncRender, ResolveAsyncRender } from "./render";

export { DashboardCommandType, IDashboardCommand, CommandProcessingMeta } from "./base";
export {
    InitialLoadCorrelationId,
    InitializeDashboard,
    InitializeDashboardPayload,
    initializeDashboard,
    SaveDashboardAs,
    SaveDashboardAsPayload,
    saveDashboardAs,
    SaveDashboard,
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
} from "./dashboard";

export { TriggerEvent, TriggerEventPayload, triggerEvent } from "./events";

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
    ChangeAttributeFilterSelection,
    AttributeFilterSelectionType,
    resetAttributeFilterSelection,
    changeAttributeFilterSelection,
    SetAttributeFilterParent,
    SetAttributeFilterParentPayload,
    setAttributeFilterParent,
    ChangeAttributeFilterSelectionPayload,
    ChangeFilterContextSelection,
    ChangeFilterContextSelectionPayload,
    DateFilterSelection,
    changeFilterContextSelection,
} from "./filters";

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
    RemoveSectionItem,
    RemoveSectionItemPayload,
    eagerRemoveSectionItem,
    UndoLayoutChanges,
    UndoLayoutChangesPayload,
    undoLayoutChanges,
    revertLastLayoutChange,
    DashboardLayoutCommands,
    UndoPointSelector,
} from "./layout";

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
} from "./alerts";

export { CreateScheduledEmail, CreateScheduledEmailPayload, createScheduledEmail } from "./scheduledEmail";

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
    drill,
    drillDown,
    drillToAttributeUrl,
    drillToCustomUrl,
    drillToDashboard,
    drillToInsight,
    drillToLegacyDashboard,
    changeDrillableItems,
} from "./drill";

export {
    UpsertExecutionResult,
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultLoading,
} from "./executionResults";

export {
    ChangeKpiWidgetHeader,
    ChangeKpiWidgetHeaderPayload,
    changeKpiWidgetHeader,
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
} from "./kpi";

export {
    ChangeInsightWidgetHeader,
    ChangeInsightWidgetHeaderPayload,
    changeInsightWidgetHeader,
    ChangeInsightWidgetFilterSettings,
    ChangeInsightWidgetFilterSettingsPayload,
    replaceInsightWidgetFilterSettings,
    enableInsightWidgetDateFilter,
    disableInsightWidgetDateFilter,
    replaceInsightWidgetIgnoredFilters,
    ignoreFilterOnInsightWidget,
    unignoreFilterOnInsightWidget,
    ChangeInsightWidgetVisProperties,
    ChangeInsightWidgetVisPropertiesPayload,
    changeInsightWidgetVisProperties,
    ChangeInsightWidgetInsight,
    ChangeInsightWidgetInsightPayload,
    changeInsightWidgetInsight,
    ModifyDrillsForInsightWidget,
    ModifyDrillsForInsightWidgetPayload,
    modifyDrillsForInsightWidget,
    RemoveDrillsForInsightWidget,
    RemoveDrillsForInsightWidgetPayload,
    removeDrillsForInsightWidget,
    RemoveDrillsSelector,
    RefreshInsightWidget,
    RefreshInsightWidgetPayload,
    refreshInsightWidget,
    ExportInsightWidget,
    ExportInsightWidgetPayload,
    exportInsightWidget,
} from "./insight";

export {
    RequestAsyncRender,
    RequestAsyncRenderPayload,
    ResolveAsyncRender,
    ResolveAsyncRenderPayload,
    requestAsyncRender,
    resolveAsyncRender,
} from "./render";

export { AddDrillTargets, AddDrillTargetsPayload, addDrillTargets } from "./drillTargets";

/**
 * Union type that contains all available built-in dashboard commands.
 *
 * Note: while this type is marked as public most of the commands are currently an alpha-level API that
 * we reserve to change in the following releases. If you use those commands now, upgrading to the next
 * version of `@gooddata/sdk-ui-dashboard` will likely result in breakage.
 *
 * @public
 */
export type DashboardCommands =
    | InitializeDashboard
    | SaveDashboard
    | SaveDashboardAs
    | RenameDashboard
    | ResetDashboard
    | ExportDashboardToPdf
    | DeleteDashboard
    | TriggerEvent
    | UpsertExecutionResult
    | RequestAsyncRender
    | ResolveAsyncRender
    | ChangeFilterContextSelection
    | ChangeDateFilterSelection
    | AddAttributeFilter
    | RemoveAttributeFilters
    | MoveAttributeFilter
    | ChangeAttributeFilterSelection
    | SetAttributeFilterParent
    | AddLayoutSection
    | MoveLayoutSection
    | RemoveLayoutSection
    | ChangeLayoutSectionHeader
    | AddSectionItems
    | ReplaceSectionItem
    | MoveSectionItem
    | RemoveSectionItem
    | UndoLayoutChanges
    | ChangeKpiWidgetHeader
    | ChangeKpiWidgetMeasure
    | ChangeKpiWidgetFilterSettings
    | ChangeKpiWidgetComparison
    | RefreshKpiWidget
    | ChangeInsightWidgetHeader
    | ChangeInsightWidgetFilterSettings
    | ChangeInsightWidgetVisProperties
    | ChangeInsightWidgetInsight
    | ModifyDrillsForInsightWidget
    | RemoveDrillsForInsightWidget
    | RefreshInsightWidget
    | ExportInsightWidget
    | CreateAlert
    | UpdateAlert
    | RemoveAlerts
    | CreateScheduledEmail
    | Drill
    | DrillDown
    | DrillToAttributeUrl
    | DrillToCustomUrl
    | DrillToDashboard
    | DrillToInsight
    | DrillToLegacyDashboard
    | ChangeDrillableItems
    | AddDrillTargets
    | ChangeSharing;
