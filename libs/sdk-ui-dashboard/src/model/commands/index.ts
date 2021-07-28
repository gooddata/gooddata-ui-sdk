// (C) 2021 GoodData Corporation

import { LoadDashboard, RenameDashboard, ResetDashboard, SaveDashboard, SaveDashboardAs } from "./dashboard";
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
import { CreateAlert, RemoveAlert, UpdateAlert } from "./alerts";
import { CreateScheduledEmail } from "./scheduledEmail";
import {
    Drill,
    DrillDown,
    DrillToAttributeUrl,
    DrillToCustomUrl,
    DrillToDashboard,
    DrillToInsight,
    DrillToLegacyDashboard,
} from "./drill";
import { AddDrillTargets } from "./drillTargets";
import { UserInteraction } from "./userInteraction";
import { RequestAsyncRender, ResolveAsyncRender } from "./render";

export { DashboardCommandType, IDashboardCommand, CommandProcessingMeta } from "./base";
export {
    InitialLoadCorrelationId,
    LoadDashboard,
    loadDashboard,
    SaveDashboardAs,
    saveDashboardAs,
    SaveDashboard,
    saveDashboard,
    RenameDashboard,
    renameDashboard,
    ResetDashboard,
    resetDashboard,
} from "./dashboard";
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
export { CreateAlert, createAlert, RemoveAlert, removeAlert, UpdateAlert, updateAlert } from "./alerts";
export { CreateScheduledEmail, createScheduledEmail } from "./scheduledEmail";
export {
    Drill,
    DrillDown,
    DrillToAttributeUrl,
    DrillToCustomUrl,
    DrillToDashboard,
    DrillToInsight,
    DrillToLegacyDashboard,
    drill,
    drillDown,
    drillToAttributeUrl,
    drillToCustomUrl,
    drillToDashboard,
    drillToInsight,
    drillToLegacyDashboard,
} from "./drill";
export {
    ChangeKpiWidgetHeader,
    changeKpiWidgetHeader,
    ChangeKpiWidgetMeasure,
    changeKpiWidgetMeasure,
    ChangeKpiWidgetFilterSettings,
    changeKpiWidgetFilterSettings,
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
    changeInsightWidgetFilterSettings,
    ChangeInsightWidgetVisProperties,
    changeInsightWidgetVisProperties,
    ChangeInsightWidgetInsight,
    changeInsightWidgetInsight,
    ModifyDrillsForInsightWidget,
    modifyDrillsForInsightWidget,
    RemoveDrillsForInsightWidget,
    removeDrillForInsightWidget,
    RemoveDrillsSelector,
    RefreshInsightWidget,
    refreshInsightWidget,
} from "./insight";

export { UserInteraction, UserInteractionType, userInteraction } from "./userInteraction";

export { RequestAsyncRender, ResolveAsyncRender } from "./render";

export { AddDrillTargets, addDrillTargets } from "./drillTargets";

/**
 * @alpha
 */
export type DashboardCommands =
    | LoadDashboard
    | SaveDashboard
    | SaveDashboardAs
    | RenameDashboard
    | ResetDashboard
    | UserInteraction
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
    | CreateAlert
    | UpdateAlert
    | RemoveAlert
    | CreateScheduledEmail
    | Drill
    | DrillDown
    | DrillToAttributeUrl
    | DrillToCustomUrl
    | DrillToDashboard
    | DrillToInsight
    | DrillToLegacyDashboard
    | AddDrillTargets;
