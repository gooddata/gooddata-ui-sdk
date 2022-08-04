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
    SetAttributeFilterParents,
    ChangeFilterContextSelection,
    SetAttributeFilterDisplayForm,
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
    SetDrillForKpiWidget,
    RemoveDrillForKpiWidget,
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
    ResizeHeight,
    ResizeWidth,
} from "./layout";
import { CreateAlert, RemoveAlerts, UpdateAlert } from "./alerts";
import { CreateScheduledEmail, SaveScheduledEmail } from "./scheduledEmail";
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
import { ChangeRenderMode } from "./ui";

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
    removeSectionItem,
    eagerRemoveSectionItem,
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

export {
    CreateScheduledEmail,
    CreateScheduledEmailPayload,
    createScheduledEmail,
    SaveScheduledEmail,
    SaveScheduledEmailPayload,
    saveScheduledEmail,
} from "./scheduledEmail";

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
    RemoveDrillForKpiWidget,
    RemoveDrillForKpiWidgetPayload,
    removeDrillForKpiWidget,
    SetDrillForKpiWidget,
    SetDrillForKpiWidgetPayload,
    setDrillForKpiWidget,
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

export { changeRenderMode, ChangeRenderMode, ChangeRenderModePayload, RenderModeChangeOptions } from "./ui";

export { AddDrillTargets, AddDrillTargetsPayload, addDrillTargets } from "./drillTargets";

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
    | RemoveSectionItem
    | UndoLayoutChanges
    | ChangeKpiWidgetHeader
    | ChangeKpiWidgetMeasure
    | ChangeKpiWidgetFilterSettings
    | ChangeKpiWidgetComparison
    | RefreshKpiWidget
    | SetDrillForKpiWidget
    | RemoveDrillForKpiWidget
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
    | SaveScheduledEmail
    | Drill
    | DrillDown
    | DrillToAttributeUrl
    | DrillToCustomUrl
    | DrillToDashboard
    | DrillToInsight
    | DrillToLegacyDashboard
    | ChangeDrillableItems
    | AddDrillTargets
    | ChangeSharing
    | ChangeRenderMode
    | SetAttributeFilterDisplayForm;
