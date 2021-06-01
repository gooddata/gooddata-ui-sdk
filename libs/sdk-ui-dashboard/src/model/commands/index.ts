// (C) 2021 GoodData Corporation

import { LoadDashboard, RenameDashboard, ResetDashboard, SaveDashboard, SaveDashboardAs } from "./dashboard";
import {
    AddAttributeFilter,
    ChangeAttributeFilterSelection,
    ChangeDateFilterSelection,
    MoveAttributeFilter,
    RemoveAttributeFilters,
    SetAttributeFilterParent,
} from "./filters";
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

export { DashboardCommandType, IDashboardCommand } from "./base";
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

/**
 * @internal
 */
export type DashboardCommands =
    | LoadDashboard
    | SaveDashboard
    | SaveDashboardAs
    | RenameDashboard
    | ResetDashboard
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
    | RefreshKpiWidget;
