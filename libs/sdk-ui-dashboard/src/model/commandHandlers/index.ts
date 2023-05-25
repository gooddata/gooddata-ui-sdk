// (C) 2021-2023 GoodData Corporation
import { DashboardCommands, IDashboardCommand } from "../commands/index.js";
import { SagaIterator } from "redux-saga";
import { initializeDashboardHandler } from "./dashboard/initializeDashboardHandler/index.js";
import { saveDashboardHandler } from "./dashboard/saveDashboardHandler.js";
import { saveAsDashboardHandler } from "./dashboard/saveAsDashboardHandler.js";
import { resetDashboardHandler } from "./dashboard/resetDashboardHandler.js";
import { renameDashboardHandler } from "./dashboard/renameDashboardHandler.js";
import { deleteDashboardHandler } from "./dashboard/deleteDashboardHandler.js";
import { exportDashboardToPdfHandler } from "./dashboard/exportDashboardToPdfHandler.js";
import { changeSharingHandler } from "./dashboard/changeSharingHandler.js";
import { triggerEventHandler } from "./events/triggerEventHandler.js";
import { upsertExecutionResultHandler } from "./executionResults/upsertExecutionResultHandler.js";
import { changeFilterContextSelectionHandler } from "./filterContext/changeFilterContextSelectionHandler.js";
import { changeDateFilterSelectionHandler } from "./filterContext/dateFilter/changeDateFilterSelectionHandler.js";
import { addAttributeFilterHandler } from "./filterContext/attributeFilter/addAttributeFilterHandler.js";
import { removeAttributeFiltersHandler } from "./filterContext/attributeFilter/removeAttributeFiltersHandler.js";
import { moveAttributeFilterHandler } from "./filterContext/attributeFilter/moveAttributeFilterHandler.js";
import { changeAttributeFilterSelectionHandler } from "./filterContext/attributeFilter/changeAttributeFilterSelectionHandler.js";
import { setAttributeFilterParentsHandler } from "./filterContext/attributeFilter/setAttributeFilterParentHandler.js";
import { changeAttributeTitleHandler } from "./filterContext/attributeFilter/changeAttributeTitleHandler.js";
import { changeAttributeSelectionModeHandler } from "./filterContext/attributeFilter/changeAttributeSelectionModeHandler.js";
import { addLayoutSectionHandler } from "./layout/addLayoutSectionHandler.js";
import { moveLayoutSectionHandler } from "./layout/moveLayoutSectionHandler.js";
import { removeLayoutSectionHandler } from "./layout/removeLayoutSectionHandler.js";
import { changeLayoutSectionHeaderHandler } from "./layout/changeLayoutSectionHeaderHandler.js";
import { addSectionItemsHandler } from "./layout/addSectionItemsHandler.js";
import { moveSectionItemHandler } from "./layout/moveSectionItemHandler.js";
import { removeSectionItemHandler } from "./layout/removeSectionItemHandler.js";
import { replaceSectionItemHandler } from "./layout/replaceSectionItemHandler.js";
import { undoLayoutChangesHandler } from "./layout/undoLayoutChangesHandler.js";
import { changeKpiWidgetHeaderHandler } from "./widgets/changeKpiWidgetHeaderHandler.js";
import { changeKpiWidgetMeasureHandler } from "./widgets/changeKpiWidgetMeasureHandler.js";
import { changeKpiWidgetFilterSettingsHandler } from "./widgets/changeKpiWidgetFilterSettingsHandler.js";
import { changeKpiWidgetComparisonHandler } from "./widgets/changeKpiWidgetComparisonHandler.js";
import { changeInsightWidgetHeaderHandler } from "./widgets/changeInsightWidgetHeaderHandler.js";
import { changeInsightWidgetDescriptionHandler } from "./widgets/changeInsightWidgetDescriptionHandler.js";
import { changeInsightWidgetFilterSettingsHandler } from "./widgets/changeInsightWidgetFilterSettingsHandler.js";
import { changeInsightWidgetVisPropertiesHandler } from "./widgets/changeInsightWidgetVisPropertiesHandler.js";
import { modifyDrillsForInsightWidgetHandler } from "./widgets/modifyDrillsForInsightWidgetHandler.js";
import { removeDrillsForInsightWidgetHandler } from "./widgets/removeDrillsForInsightWidgetHandler.js";
import { exportInsightWidgetHandler } from "./widgets/exportInsightWidgetHandler.js";
import { createAlertHandler } from "./alerts/createAlertHandler.js";
import { updateAlertHandler } from "./alerts/updateAlertHandler.js";
import { removeAlertsHandler } from "./alerts/removeAlertsHandler.js";
import { createScheduledEmailHandler } from "./scheduledEmail/createScheduledEmailHandler.js";
import { saveScheduledEmailHandler } from "./scheduledEmail/saveScheduledEmailHandler.js";
import { drillHandler } from "./drill/drillHandler.js";
import { drillDownHandler } from "./drill/drillDownHandler.js";
import { drillToInsightHandler } from "./drill/drillToInsightHandler.js";
import { drillToDashboardHandler } from "./drill/drillToDashboardHandler.js";
import { drillToAttributeUrlHandler } from "./drill/drillToAttributeUrlHandler.js";
import { drillToCustomUrlHandler } from "./drill/drillToCustomUrlHandler.js";
import { drillToLegacyDashboardHandler } from "./drill/drillToLegacyDashboardHandler.js";
import { changeDrillableItemsHandler } from "./drill/changeDrillableItemsHandler.js";
import { addDrillTargetsHandler } from "./drillTargets/addDrillTargetsHandler.js";
import { requestAsyncRenderHandler } from "./render/requestAsyncRenderHandler.js";
import { resolveAsyncRenderHandler } from "./render/resolveAsyncRenderHandler.js";
import { DashboardContext } from "../types/commonTypes.js";
import { dispatchDashboardEvent } from "../store/_infra/eventDispatcher.js";
import { commandRejected } from "../events/general.js";
import { changeRenderModeHandler } from "./renderMode/changeRenderModeHandler.js";
import { changeAttributeDisplayFormHandler } from "./filterContext/attributeFilter/changeAttributeDisplayFormHandler.js";
import { removeDrillForKpiWidgetHandler } from "./widgets/removeDrillForKpiWidgetHandler.js";
import { setDrillForKpiWidgetHandler } from "./widgets/setDrillForKpiWidgetHandler.js";
import { resizeHeightHandler } from "./layout/resizeHeightHandler.js";
import { resizeWidthHandler } from "./layout/resizeWidthHandler.js";
import { refreshInsightWidgetHandler } from "./widgets/refreshInsightWidgetHandler.js";
import { removeSectionItemByWidgetRefHandler } from "./layout/removeSectionItemByWidgetRefHandler.js";
import { changeInsightWidgetVisConfigurationHandler } from "./widgets/changeInsightWidgetVisConfigurationHandler.js";
import { moveSectionItemToNewSectionHandler } from "./layout/moveSectionItemToNewSectionHandler.js";
import { changeKpiWidgetDescriptionHandler } from "./widgets/changeKpiWidgetDescriptionHandler.js";
import { changeKpiWidgetConfigurationHandler } from "./widgets/changeKpiWidgetConfigurationHandler.js";
import { changeInsightWidgetInsightHandler } from "./widgets/changeInsightWidgetInsightHandler.js";

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
    "GDC.DASH/CMD.CHANGE_RENDER_MODE": changeRenderModeHandler,
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
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_PARENTS": setAttributeFilterParentsHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_DISPLAY_FORM": changeAttributeDisplayFormHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_TITLE": changeAttributeTitleHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_SELECTION_MODE": changeAttributeSelectionModeHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.ADD_SECTION": addLayoutSectionHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_SECTION": moveLayoutSectionHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_SECTION": removeLayoutSectionHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.CHANGE_SECTION_HEADER": changeLayoutSectionHeaderHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.RESIZE_HEIGHT": resizeHeightHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.RESIZE_WIDTH": resizeWidthHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.ADD_ITEMS": addSectionItemsHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM": moveSectionItemHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM_TO_NEW_SECTION": moveSectionItemToNewSectionHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM": removeSectionItemHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM_BY_WIDGET_REF": removeSectionItemByWidgetRefHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.REPLACE_ITEM": replaceSectionItemHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.UNDO": undoLayoutChangesHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_HEADER": changeKpiWidgetHeaderHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE": changeKpiWidgetMeasureHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS": changeKpiWidgetFilterSettingsHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_COMPARISON": changeKpiWidgetComparisonHandler,
    "GDC.DASH/CMD.KPI_WIDGET.REMOVE_DRILL": removeDrillForKpiWidgetHandler,
    "GDC.DASH/CMD.KPI_WIDGET.SET_DRILL": setDrillForKpiWidgetHandler,
    "GDC.DASH/CMD.KPI_WIDGET.REFRESH": notImplementedCommand,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_DESCRIPTION": changeKpiWidgetDescriptionHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_CONFIGURATION": changeKpiWidgetConfigurationHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_HEADER": changeInsightWidgetHeaderHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_DESCRIPTION": changeInsightWidgetDescriptionHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS": changeInsightWidgetFilterSettingsHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_PROPERTIES": changeInsightWidgetVisPropertiesHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_CONFIGURATION": changeInsightWidgetVisConfigurationHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_INSIGHT": changeInsightWidgetInsightHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS": modifyDrillsForInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS": removeDrillsForInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.REFRESH": refreshInsightWidgetHandler,
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
