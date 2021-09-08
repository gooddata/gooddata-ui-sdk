// (C) 2021 GoodData Corporation

import {
    InitializeDashboard,
    RenameDashboard,
    ResetDashboard,
    SaveDashboard,
    SaveDashboardAs,
    ExportDashboardToPdf,
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
    initializeDashboard,
    SaveDashboardAs,
    saveDashboardAs,
    SaveDashboard,
    saveDashboard,
    RenameDashboard,
    renameDashboard,
    ResetDashboard,
    resetDashboard,
    ExportDashboardToPdf,
    exportDashboardToPdf,
} from "./dashboard";
export { TriggerEvent, triggerEvent } from "./events";
export {
    ChangeDateFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    AddAttributeFilter,
    addAttributeFilter,
    MoveAttributeFilter,
    moveAttributeFilter,
    RemoveAttributeFilters,
    removeAttributeFilter,
    ChangeAttributeFilterSelection,
    AttributeFilterSelectionType,
    resetAttributeFilterSelection,
    changeAttributeFilterSelection,
    SetAttributeFilterParent,
    setAttributeFilterParent,
    AttributeFilterSelection,
    ChangeFilterContextSelection,
    DateFilterSelection,
    changeFilterContextSelection,
    FilterContextSelection,
} from "./filters";
export {
    AddLayoutSection,
    addLayoutSection,
    MoveLayoutSection,
    moveLayoutSection,
    RemoveLayoutSection,
    removeLayoutSection,
    ChangeLayoutSectionHeader,
    changeLayoutSectionHeader,
    AddSectionItems,
    addSectionItem,
    ReplaceSectionItem,
    replaceSectionItem,
    MoveSectionItem,
    moveSectionItem,
    RemoveSectionItem,
    eagerRemoveSectionItem,
    UndoLayoutChanges,
    undoLayoutChanges,
    revertLastLayoutChange,
    DashboardLayoutCommands,
    UndoPointSelector,
} from "./layout";
export { CreateAlert, createAlert, RemoveAlerts, removeAlerts, UpdateAlert, updateAlert } from "./alerts";
export { CreateScheduledEmail, createScheduledEmail } from "./scheduledEmail";
export {
    Drill,
    DrillDown,
    DrillToAttributeUrl,
    DrillToCustomUrl,
    DrillToDashboard,
    DrillToInsight,
    DrillToLegacyDashboard,
    ChangeDrillableItems,
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
    changeKpiWidgetHeader,
    ChangeKpiWidgetMeasure,
    changeKpiWidgetMeasure,
    ChangeKpiWidgetFilterSettings,
    replaceKpiWidgetFilterSettings,
    enableKpiWidgetDateFilter,
    disableKpiWidgetDateFilter,
    replaceKpiWidgetIgnoredFilters,
    ignoreFilterOnKpiWidget,
    unignoreFilterOnKpiWidget,
    ChangeKpiWidgetComparison,
    changeKpiWidgetComparison,
    RefreshKpiWidget,
    refreshKpiWidget,
    KpiWidgetComparison,
} from "./kpi";

export {
    ChangeInsightWidgetHeader,
    changeInsightWidgetHeader,
    ChangeInsightWidgetFilterSettings,
    replaceInsightWidgetFilterSettings,
    enableInsightWidgetDateFilter,
    disableInsightWidgetDateFilter,
    replaceInsightWidgetIgnoredFilters,
    ignoreFilterOnInsightWidget,
    unignoreFilterOnInsightWidget,
    ChangeInsightWidgetVisProperties,
    changeInsightWidgetVisProperties,
    ChangeInsightWidgetInsight,
    changeInsightWidgetInsight,
    ModifyDrillsForInsightWidget,
    modifyDrillsForInsightWidget,
    RemoveDrillsForInsightWidget,
    removeDrillsForInsightWidget,
    RemoveDrillsSelector,
    RefreshInsightWidget,
    refreshInsightWidget,
    ExportInsightWidget,
    exportInsightWidget,
} from "./insight";

export { RequestAsyncRender, ResolveAsyncRender } from "./render";

export { AddDrillTargets, addDrillTargets } from "./drillTargets";

/**
 * @alpha
 */
export type DashboardCommands =
    | InitializeDashboard
    | SaveDashboard
    | SaveDashboardAs
    | RenameDashboard
    | ResetDashboard
    | ExportDashboardToPdf
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
    | AddDrillTargets;
