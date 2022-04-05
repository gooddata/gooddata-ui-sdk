// (C) 2021 GoodData Corporation
import { DashboardCommands, IDashboardCommand } from "../commands";
import { SagaIterator } from "redux-saga";
import { initializeDashboardHandler } from "./dashboard/initializeDashboardHandler";
import { saveDashboardHandler } from "./dashboard/saveDashboardHandler";
import { saveAsDashboardHandler } from "./dashboard/saveAsDashboardHandler";
import { resetDashboardHandler } from "./dashboard/resetDashboardHandler";
import { renameDashboardHandler } from "./dashboard/renameDashboardHandler";
import { deleteDashboardHandler } from "./dashboard/deleteDashboardHandler";
import { exportDashboardToPdfHandler } from "./dashboard/exportDashboardToPdfHandler";
import { changeSharingHandler } from "./dashboard/changeSharingHandler";
import { triggerEventHandler } from "./events/triggerEventHandler";
import { upsertExecutionResultHandler } from "./executionResults/upsertExecutionResultHandler";
import { changeFilterContextSelectionHandler } from "./filterContext/changeFilterContextSelectionHandler";
import { changeDateFilterSelectionHandler } from "./filterContext/dateFilter/changeDateFilterSelectionHandler";
import { addAttributeFilterHandler } from "./filterContext/attributeFilter/addAttributeFilterHandler";
import { removeAttributeFiltersHandler } from "./filterContext/attributeFilter/removeAttributeFiltersHandler";
import { moveAttributeFilterHandler } from "./filterContext/attributeFilter/moveAttributeFilterHandler";
import { changeAttributeFilterSelectionHandler } from "./filterContext/attributeFilter/changeAttributeFilterSelectionHandler";
import { setAttributeFilterParentHandler } from "./filterContext/attributeFilter/setAttributeFilterParentHandler";
import { addLayoutSectionHandler } from "./layout/addLayoutSectionHandler";
import { moveLayoutSectionHandler } from "./layout/moveLayoutSectionHandler";
import { removeLayoutSectionHandler } from "./layout/removeLayoutSectionHandler";
import { changeLayoutSectionHeaderHandler } from "./layout/changeLayoutSectionHeaderHandler";
import { addSectionItemsHandler } from "./layout/addSectionItemsHandler";
import { moveSectionItemHandler } from "./layout/moveSectionItemHandler";
import { removeSectionItemHandler } from "./layout/removeSectionItemHandler";
import { replaceSectionItemHandler } from "./layout/replaceSectionItemHandler";
import { undoLayoutChangesHandler } from "./layout/undoLayoutChangesHandler";
import { changeKpiWidgetHeaderHandler } from "./widgets/changeKpiWidgetHeaderHandler";
import { changeKpiWidgetMeasureHandler } from "./widgets/changeKpiWidgetMeasureHandler";
import { changeKpiWidgetFilterSettingsHandler } from "./widgets/changeKpiWidgetFilterSettingsHandler";
import { changeKpiWidgetComparisonHandler } from "./widgets/changeKpiWidgetComparisonHandler";
import { changeInsightWidgetHeaderHandler } from "./widgets/changeInsightWidgetHeaderHandler";
import { changeInsightWidgetFilterSettingsHandler } from "./widgets/changeInsightWidgetFilterSettingsHandler";
import { changeInsightWidgetVisPropertiesHandler } from "./widgets/changeInsightWidgetVisPropertiesHandler";
import { modifyDrillsForInsightWidgetHandler } from "./widgets/modifyDrillsForInsightWidgetHandler";
import { removeDrillsForInsightWidgetHandler } from "./widgets/removeDrillsForInsightWidgetHandler";
import { exportInsightWidgetHandler } from "./widgets/exportInsightWidgetHandler";
import { createAlertHandler } from "./alerts/createAlertHandler";
import { updateAlertHandler } from "./alerts/updateAlertHandler";
import { removeAlertsHandler } from "./alerts/removeAlertsHandler";
import { createScheduledEmailHandler } from "./scheduledEmail/createScheduledEmailHandler";
import { saveScheduledEmailHandler } from "./scheduledEmail/saveScheduledEmailHandler";
import { drillHandler } from "./drill/drillHandler";
import { drillDownHandler } from "./drill/drillDownHandler";
import { drillToInsightHandler } from "./drill/drillToInsightHandler";
import { drillToDashboardHandler } from "./drill/drillToDashboardHandler";
import { drillToAttributeUrlHandler } from "./drill/drillToAttributeUrlHandler";
import { drillToCustomUrlHandler } from "./drill/drillToCustomUrlHandler";
import { drillToLegacyDashboardHandler } from "./drill/drillToLegacyDashboardHandler";
import { changeDrillableItemsHandler } from "./drill/changeDrillableItemsHandler";
import { addDrillTargetsHandler } from "./drillTargets/addDrillTargetsHandler";
import { requestAsyncRenderHandler } from "./render/requestAsyncRenderHandler";
import { resolveAsyncRenderHandler } from "./render/resolveAsyncRenderHandler";
import { DashboardContext } from "../types/commonTypes";
import { dispatchDashboardEvent } from "../store/_infra/eventDispatcher";
import { commandRejected } from "../events/general";

function* notImplementedCommand(ctx: DashboardContext, cmd: IDashboardCommand): SagaIterator<void> {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}

export const DefaultCommandHandlers: {
    [cmd in DashboardCommands["type"]]?: (...args: any[]) => SagaIterator<any> | any;
} = {
    "GDC.DASH/CMD.INITIALIZE": initializeDashboardHandler,
    "GDC.DASH/CMD.SAVE": saveDashboardHandler,
    "GDC.DASH/CMD.SAVEAS": saveAsDashboardHandler,
    "GDC.DASH/CMD.RESET": resetDashboardHandler,
    "GDC.DASH/CMD.RENAME": renameDashboardHandler,
    "GDC.DASH/CMD.DELETE": deleteDashboardHandler,
    "GDC.DASH/CMD.SHARING.CHANGE": changeSharingHandler,
    "GDC.DASH/CMD.EXPORT.PDF": exportDashboardToPdfHandler,
    "GDC.DASH/CMD.EVENT.TRIGGER": triggerEventHandler,
    "GDC.DASH/CMD.EXECUTION_RESULT.UPSERT": upsertExecutionResultHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION": changeFilterContextSelectionHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION": changeDateFilterSelectionHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD": addAttributeFilterHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVE": removeAttributeFiltersHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVE": moveAttributeFilterHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.CHANGE_SELECTION": changeAttributeFilterSelectionHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_PARENT": setAttributeFilterParentHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.ADD_SECTION": addLayoutSectionHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_SECTION": moveLayoutSectionHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_SECTION": removeLayoutSectionHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.CHANGE_SECTION_HEADER": changeLayoutSectionHeaderHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.ADD_ITEMS": addSectionItemsHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM": moveSectionItemHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM": removeSectionItemHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.REPLACE_ITEM": replaceSectionItemHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.UNDO": undoLayoutChangesHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_HEADER": changeKpiWidgetHeaderHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE": changeKpiWidgetMeasureHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS": changeKpiWidgetFilterSettingsHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_COMPARISON": changeKpiWidgetComparisonHandler,
    "GDC.DASH/CMD.KPI_WIDGET.REFRESH": notImplementedCommand,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_HEADER": changeInsightWidgetHeaderHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS": changeInsightWidgetFilterSettingsHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_PROPERTIES": changeInsightWidgetVisPropertiesHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_INSIGHT": notImplementedCommand,
    "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS": modifyDrillsForInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS": removeDrillsForInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.REFRESH": notImplementedCommand,
    "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT": exportInsightWidgetHandler,
    "GDC.DASH/CMD.ALERT.CREATE": createAlertHandler,
    "GDC.DASH/CMD.ALERT.UPDATE": updateAlertHandler,
    "GDC.DASH/CMD.ALERTS.REMOVE": removeAlertsHandler,
    "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE": createScheduledEmailHandler,
    "GDC.DASH/CMD.SCHEDULED_EMAIL.SAVE": saveScheduledEmailHandler,
    "GDC.DASH/CMD.DRILL": drillHandler,
    "GDC.DASH/CMD.DRILL.DRILL_DOWN": drillDownHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_INSIGHT": drillToInsightHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_DASHBOARD": drillToDashboardHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_ATTRIBUTE_URL": drillToAttributeUrlHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_CUSTOM_URL": drillToCustomUrlHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_LEGACY_DASHBOARD": drillToLegacyDashboardHandler,
    "GDC.DASH/CMD.DRILL.DRILLABLE_ITEMS.CHANGE": changeDrillableItemsHandler,
    "GDC.DASH/CMD.DRILL_TARGETS.ADD": addDrillTargetsHandler,
    "GDC.DASH/CMD.RENDER.ASYNC.REQUEST": requestAsyncRenderHandler,
    "GDC.DASH/CMD.RENDER.ASYNC.RESOLVE": resolveAsyncRenderHandler,
};
