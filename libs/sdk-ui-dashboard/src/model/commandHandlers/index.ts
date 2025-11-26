// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";

import { createAlertHandler } from "./alerts/createAlertHandler.js";
import { saveAlertHandler } from "./alerts/saveAlertHandler.js";
import { changeAttributeFilterDisplayAsLabelHandler } from "./dashboard/changeAttributeFilterDisplayAsLabelHandler.js";
import { changeAttributeFilterLimitingItemsHandler } from "./dashboard/changeAttributeFilterLimitingItemsHandler.js";
import { changeAttributeFilterModeHandler } from "./dashboard/changeAttributeFilterModeHandler.js";
import { changeDateFilterTitleHandler } from "./dashboard/changeDateFilterTitleHandler.js";
import { changeDateFilterWithDimensionModeHandler } from "./dashboard/changeDateFilterWithDimensionModeHandler.js";
import { changeIgnoreExecutionTimestampHandler } from "./dashboard/changeIgnoreExecutionTimestampHandler.js";
import { changeSharingHandler } from "./dashboard/changeSharingHandler.js";
import { setDashboardDateFilterConfigModeHandler } from "./dashboard/dateFilterConfigHandler.js";
import { deleteDashboardHandler } from "./dashboard/deleteDashboardHandler.js";
import { exportDashboardToPdfHandler } from "./dashboard/exportDashboardToPdfHandler.js";
import { exportDashboardToPdfPresentationHandler } from "./dashboard/exportDashboardToPdfPresentationHandler.js";
import { exportDashboardToPptPresentationHandler } from "./dashboard/exportDashboardToPptPresentationHandler.js";
import { exportToTabularHandler } from "./dashboard/exportToTabularHandler.js";
import { initializeDashboardHandler } from "./dashboard/initializeDashboardHandler/index.js";
import { renameDashboardHandler } from "./dashboard/renameDashboardHandler.js";
import { resetDashboardHandler } from "./dashboard/resetDashboardHandler.js";
import { saveAsDashboardHandler } from "./dashboard/saveAsDashboardHandler.js";
import { saveDashboardHandler } from "./dashboard/saveDashboardHandler.js";
import { changeDrillableItemsHandler } from "./drill/changeDrillableItemsHandler.js";
import { crossFilteringHandler } from "./drill/crossFilteringHandler.js";
import { drillDownHandler } from "./drill/drillDownHandler.js";
import { drillHandler } from "./drill/drillHandler.js";
import { drillToAttributeUrlHandler } from "./drill/drillToAttributeUrlHandler.js";
import { drillToCustomUrlHandler } from "./drill/drillToCustomUrlHandler.js";
import { drillToDashboardHandler } from "./drill/drillToDashboardHandler.js";
import { drillToInsightHandler } from "./drill/drillToInsightHandler.js";
import { drillToLegacyDashboardHandler } from "./drill/drillToLegacyDashboardHandler.js";
import { addDrillTargetsHandler } from "./drillTargets/addDrillTargetsHandler.js";
import { triggerEventHandler } from "./events/triggerEventHandler.js";
import { upsertExecutionResultHandler } from "./executionResults/upsertExecutionResultHandler.js";
import { addAttributeFilterHandler } from "./filterContext/attributeFilter/addAttributeFilterHandler.js";
import { changeAttributeDisplayFormHandler } from "./filterContext/attributeFilter/changeAttributeDisplayFormHandler.js";
import { changeAttributeFilterSelectionHandler } from "./filterContext/attributeFilter/changeAttributeFilterSelectionHandler.js";
import { changeAttributeSelectionModeHandler } from "./filterContext/attributeFilter/changeAttributeSelectionModeHandler.js";
import { changeAttributeTitleHandler } from "./filterContext/attributeFilter/changeAttributeTitleHandler.js";
import { moveAttributeFilterHandler } from "./filterContext/attributeFilter/moveAttributeFilterHandler.js";
import { removeAttributeFiltersHandler } from "./filterContext/attributeFilter/removeAttributeFiltersHandler.js";
import { setAttributeFilterDependentDateFiltersHandler } from "./filterContext/attributeFilter/setAttributeFilterDependentDateFilterHandler.js";
import { setAttributeFilterParentsHandler } from "./filterContext/attributeFilter/setAttributeFilterParentHandler.js";
import { changeFilterContextSelectionHandler } from "./filterContext/changeFilterContextSelectionHandler.js";
import { applyWorkingSelectionHandler, resetWorkingSelectionHandler } from "./filterContext/common.js";
import { addDateFilterHandler } from "./filterContext/dateFilter/addDateFilterHandler.js";
import { changeDateFilterSelectionHandler } from "./filterContext/dateFilter/changeDateFilterSelectionHandler.js";
import { moveDateFilterHandler } from "./filterContext/dateFilter/moveDateFilterHandler.js";
import { removeDateFiltersHandler } from "./filterContext/dateFilter/removeDateFiltersHandler.js";
import {
    applyFilterViewHandler,
    deleteFilterViewHandler,
    reloadFilterViewsHandler,
    saveFilterViewHandler,
    setFilterViewAsDefaultHandler,
} from "./filterContext/filterViewHandler.js";
import { addLayoutSectionHandler } from "./layout/addLayoutSectionHandler.js";
import { addSectionItemsHandler } from "./layout/addSectionItemsHandler.js";
import { changeLayoutSectionHeaderHandler } from "./layout/changeLayoutSectionHeaderHandler.js";
import { moveLayoutSectionHandler } from "./layout/moveLayoutSectionHandler.js";
import { moveSectionItemHandler } from "./layout/moveSectionItemHandler.js";
import { moveSectionItemToNewSectionHandler } from "./layout/moveSectionItemToNewSectionHandler.js";
import { removeLayoutSectionHandler } from "./layout/removeLayoutSectionHandler.js";
import { removeSectionItemByWidgetRefHandler } from "./layout/removeSectionItemByWidgetRefHandler.js";
import { removeSectionItemHandler } from "./layout/removeSectionItemHandler.js";
import { replaceSectionItemHandler } from "./layout/replaceSectionItemHandler.js";
import { resizeHeightHandler } from "./layout/resizeHeightHandler.js";
import { resizeWidthHandler } from "./layout/resizeWidthHandler.js";
import { setScreenSizeHandler } from "./layout/setScreenSizeHandler.js";
import { toggleLayoutDirectionHandler } from "./layout/toggleLayoutDirectionHandler.js";
import { toggleLayoutSectionHeadersHandler } from "./layout/toggleLayoutSectionHeadersHandler.js";
import { undoLayoutChangesHandler } from "./layout/undoLayoutChangesHandler.js";
import { requestAsyncRenderHandler } from "./render/requestAsyncRenderHandler.js";
import { resolveAsyncRenderHandler } from "./render/resolveAsyncRenderHandler.js";
import { changeRenderModeHandler } from "./renderMode/changeRenderModeHandler.js";
import { createScheduledEmailHandler } from "./scheduledEmail/createScheduledEmailHandler.js";
import { initializeAutomationsHandler } from "./scheduledEmail/initializeAutomationsHandler.js";
import { refreshAutomationsHandlers } from "./scheduledEmail/refreshAutomationsHandlers.js";
import { saveScheduledEmailHandler } from "./scheduledEmail/saveScheduledEmailHandler.js";
import { handleSetWidgetToShowAsTable } from "./showWidgetAsTable/showWidgetAsTableHandler.js";
import { cancelRenamingDashboardTabHandler } from "./tabs/cancelRenamingDashboardTabHandler.js";
import { convertDashboardTabFromDefaultHandler } from "./tabs/convertDashboardTabFromDefaultHandler.js";
import { createDashboardTabHandler } from "./tabs/createDashboardTabHandler.js";
import { renameDashboardTabHandler } from "./tabs/renameDashboardTabHandler.js";
import { loadAllWorkspaceUsersHandler } from "./users/loadAllUsersHandler.js";
import { addDrillDownForInsightWidgetHandler } from "./widgets/addDrillDownForInsightWidgetHandler.js";
import { addVisualizationToSwticherWidgetContentHandler } from "./widgets/addVisualizationToSwitcherWidgetHandler.js";
import { attributeHierarchyModifiedHandler } from "./widgets/attributeHierarchyModifiedHandler.js";
import { changeInsightWidgetDescriptionHandler } from "./widgets/changeInsightWidgetDescriptionHandler.js";
import { changeInsightWidgetFilterSettingsHandler } from "./widgets/changeInsightWidgetFilterSettingsHandler.js";
import { changeInsightWidgetHeaderHandler } from "./widgets/changeInsightWidgetHeaderHandler.js";
import { changeInsightWidgetIgnoreCrossFilteringHandler } from "./widgets/changeInsightWidgetIgnoreCrossFilteringHandler.js";
import { changeInsightWidgetInsightHandler } from "./widgets/changeInsightWidgetInsightHandler.js";
import { changeInsightWidgetVisConfigurationHandler } from "./widgets/changeInsightWidgetVisConfigurationHandler.js";
import { changeInsightWidgetVisPropertiesHandler } from "./widgets/changeInsightWidgetVisPropertiesHandler.js";
import { changeKpiWidgetComparisonHandler } from "./widgets/changeKpiWidgetComparisonHandler.js";
import { changeKpiWidgetConfigurationHandler } from "./widgets/changeKpiWidgetConfigurationHandler.js";
import { changeKpiWidgetDescriptionHandler } from "./widgets/changeKpiWidgetDescriptionHandler.js";
import { changeKpiWidgetFilterSettingsHandler } from "./widgets/changeKpiWidgetFilterSettingsHandler.js";
import { changeKpiWidgetHeaderHandler } from "./widgets/changeKpiWidgetHeaderHandler.js";
import { changeKpiWidgetMeasureHandler } from "./widgets/changeKpiWidgetMeasureHandler.js";
import { changeRichTextWidgetContentHandler } from "./widgets/changeRichTextWidgetContentHandler.js";
import { changeRichTextWidgetFilterSettingsHandler } from "./widgets/changeRichTextWidgetFilterSettingsHandler.js";
import { exportImageInsightWidgetHandler } from "./widgets/exportImageInsightWidgetHandler.js";
import { exportInsightWidgetHandler } from "./widgets/exportInsightWidgetHandler.js";
import { exportRawInsightWidgetHandler } from "./widgets/exportRawInsightWidgetHandler.js";
import { exportSlidesInsightWidgetHandler } from "./widgets/exportSlidesInsightWidgetHandler.js";
import { modifyDrillDownForInsightWidgetHandler } from "./widgets/modifyDrillDownForInsightWidgetHandler.js";
import { modifyDrillsForInsightWidgetHandler } from "./widgets/modifyDrillsForInsightWidgetHandler.js";
import { refreshInsightWidgetHandler } from "./widgets/refreshInsightWidgetHandler.js";
import { removeDrillDownForInsightWidgetHandler } from "./widgets/removeDrillDownForInsightWidgetHandler.js";
import { removeDrillForKpiWidgetHandler } from "./widgets/removeDrillForKpiWidgetHandler.js";
import { removeDrillsForInsightWidgetHandler } from "./widgets/removeDrillsForInsightWidgetHandler.js";
import { setDrillForKpiWidgetHandler } from "./widgets/setDrillForKpiWidgetHandler.js";
import { updateVisualizationsFromSwticherWidgetContentHandler } from "./widgets/updateVisualizationsFromSwitcherWidgetHandler.js";
import { DashboardCommands, IDashboardCommand } from "../commands/index.js";
import { commandRejected } from "../events/general.js";
import { dispatchDashboardEvent } from "../store/_infra/eventDispatcher.js";
import { DashboardContext } from "../types/commonTypes.js";
import { keyDriverAnalysisHandler } from "./drill/keyDriverAnalysisHandler.js";
import { deleteDashboardTabHandler } from "./tabs/deleteDashboardTabHandler.js";
import { repositionDashboardTabHandler } from "./tabs/repositionDashboardTabHandler.js";
import { startRenamingDashboardTabHandler } from "./tabs/startRenamingDashboardTabHandler.js";
import { switchDashboardTabHandler } from "./tabs/switchDashboardTabHandler.js";

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
    "GDC.DASH/CMD.EXPORT.EXCEL": exportToTabularHandler,
    "GDC.DASH/CMD.EXPORT.PDF_PRESENTATION": exportDashboardToPdfPresentationHandler,
    "GDC.DASH/CMD.EXPORT.PPT_PRESENTATION": exportDashboardToPptPresentationHandler,
    "GDC.DASH/CMD.EVENT.TRIGGER": triggerEventHandler,
    "GDC.DASH/CMD.EXECUTION_RESULT.UPSERT": upsertExecutionResultHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION": changeFilterContextSelectionHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION": changeDateFilterSelectionHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD": addAttributeFilterHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVE": removeAttributeFiltersHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVE": moveAttributeFilterHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.CHANGE_SELECTION": changeAttributeFilterSelectionHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_PARENTS": setAttributeFilterParentsHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_DEPENDENT_DATE_FILTERS":
        setAttributeFilterDependentDateFiltersHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_DISPLAY_FORM": changeAttributeDisplayFormHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_TITLE": changeAttributeTitleHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_SELECTION_MODE": changeAttributeSelectionModeHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.ADD": addDateFilterHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.REMOVE": removeDateFiltersHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.MOVE": moveDateFilterHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.APPLY_WORKING_SELECTION": applyWorkingSelectionHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.RESET_WORKING_SELECTION": resetWorkingSelectionHandler,
    "GDC.DASH/CMD.ATTRIBUTE_FILTER_CONFIG.SET_MODE": changeAttributeFilterModeHandler,
    "GDC.DASH/CMD.ATTRIBUTE_FILTER_CONFIG.SET_DISPLAY_AS_LABEL": changeAttributeFilterDisplayAsLabelHandler,
    "GDC.DASH/CMD.ATTRIBUTE_FILTER_CONFIG.SET_LIMITING_ITEMS": changeAttributeFilterLimitingItemsHandler,
    "GDC.DASH/CMD.DATE_FILTER_CONFIG.SET_MODE": setDashboardDateFilterConfigModeHandler,
    "GDC.DASH/CMD.DATE_FILTER_WITH_DIMENSION_CONFIG.SET_MODE": changeDateFilterWithDimensionModeHandler,
    "GDC.DASH/CMD.DATE_FILTER_CONFIG.SET_TITLE": changeDateFilterTitleHandler,
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
    "GDC.DASH/CMD.FLUID_LAYOUT.SET_SCREEN_SIZE": setScreenSizeHandler,
    "GDC.DASH/CMD.FLEXIBLE_LAYOUT.TOGGLE_LAYOUT_SECTION_HEADERS": toggleLayoutSectionHeadersHandler,
    "GDC.DASH/CMD.FLEXIBLE_LAYOUT.TOGGLE_LAYOUT_DIRECTION": toggleLayoutDirectionHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_HEADER": changeKpiWidgetHeaderHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE": changeKpiWidgetMeasureHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS": changeKpiWidgetFilterSettingsHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_COMPARISON": changeKpiWidgetComparisonHandler,
    "GDC.DASH/CMD.KPI_WIDGET.REMOVE_DRILL": removeDrillForKpiWidgetHandler,
    "GDC.DASH/CMD.KPI_WIDGET.SET_DRILL": setDrillForKpiWidgetHandler,
    "GDC.DASH/CMD.KPI_WIDGET.REFRESH": notImplementedCommand,
    "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_RAW": exportRawInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_SLIDES": exportSlidesInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT_IMAGE": exportImageInsightWidgetHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_DESCRIPTION": changeKpiWidgetDescriptionHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_CONFIGURATION": changeKpiWidgetConfigurationHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_HEADER": changeInsightWidgetHeaderHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_DESCRIPTION": changeInsightWidgetDescriptionHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS": changeInsightWidgetFilterSettingsHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_PROPERTIES": changeInsightWidgetVisPropertiesHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_CONFIGURATION": changeInsightWidgetVisConfigurationHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_IGNORE_CROSS_FILTERING":
        changeInsightWidgetIgnoreCrossFilteringHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_INSIGHT": changeInsightWidgetInsightHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS": modifyDrillsForInsightWidgetHandler,
    "GDC.DASH/CMD.ATTRIBUTE_HIERARCHY_MODIFIED": attributeHierarchyModifiedHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS": removeDrillsForInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILL_DOWN": removeDrillDownForInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.ADD_DRILL_DOWN": addDrillDownForInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILL_DOWN": modifyDrillDownForInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.REFRESH": refreshInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT": exportInsightWidgetHandler,
    "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_CONTENT": changeRichTextWidgetContentHandler,
    "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_FILTER_SETTINGS": changeRichTextWidgetFilterSettingsHandler,
    "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.ADD_VISUALIZATION":
        addVisualizationToSwticherWidgetContentHandler,
    "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.UPDATE_VISUALIZATIONS":
        updateVisualizationsFromSwticherWidgetContentHandler,
    "GDC.DASH/CMD.ALERT.CREATE": createAlertHandler,
    "GDC.DASH/CMD.ALERT.SAVE": saveAlertHandler,
    "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE": createScheduledEmailHandler,
    "GDC.DASH/CMD.SCHEDULED_EMAIL.SAVE": saveScheduledEmailHandler,
    "GDC.DASH/CMD.DRILL": drillHandler,
    "GDC.DASH/CMD.DRILL.DRILL_DOWN": drillDownHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_INSIGHT": drillToInsightHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_DASHBOARD": drillToDashboardHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_ATTRIBUTE_URL": drillToAttributeUrlHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_CUSTOM_URL": drillToCustomUrlHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_LEGACY_DASHBOARD": drillToLegacyDashboardHandler,
    "GDC.DASH/CMD.DRILL.CROSS_FILTERING": crossFilteringHandler,
    "GDC.DASH/CMD.DRILL.KEY_DRIVER_ANALYSIS": keyDriverAnalysisHandler,
    "GDC.DASH/CMD.DRILL.DRILLABLE_ITEMS.CHANGE": changeDrillableItemsHandler,
    "GDC.DASH/CMD.DRILL_TARGETS.ADD": addDrillTargetsHandler,
    "GDC.DASH/CMD.RENDER.ASYNC.REQUEST": requestAsyncRenderHandler,
    "GDC.DASH/CMD.RENDER.ASYNC.RESOLVE": resolveAsyncRenderHandler,
    "GDC.DASH/CMD.AUTOMATIONS.REFRESH": refreshAutomationsHandlers,
    "GDC.DASH/CMD.AUTOMATIONS.INITIALIZE": initializeAutomationsHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.SAVE": saveFilterViewHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.DELETE": deleteFilterViewHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.APPLY": applyFilterViewHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS": setFilterViewAsDefaultHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.RELOAD": reloadFilterViewsHandler,
    "GDC.DASH/CMD.USERS.LOAD_ALL": loadAllWorkspaceUsersHandler,
    "GDC.DASH/CMD.CHANGE_IGNORE_EXECUTION_TIMESTAMP": changeIgnoreExecutionTimestampHandler,
    "GDC.DASH/CMD.SHOW_WIDGET_AS_TABLE.SET": handleSetWidgetToShowAsTable,
    "GDC.DASH/CMD.TAB.CREATE": createDashboardTabHandler,
    "GDC.DASH/CMD.TAB.CONVERT_FROM_DEFAULT": convertDashboardTabFromDefaultHandler,
    "GDC.DASH/CMD.TAB.SWITCH": switchDashboardTabHandler,
    "GDC.DASH/CMD.TAB.REPOSITION": repositionDashboardTabHandler,
    "GDC.DASH/CMD.TAB.DELETE": deleteDashboardTabHandler,
    "GDC.DASH/CMD.TAB.RENAME_MODE.START": startRenamingDashboardTabHandler,
    "GDC.DASH/CMD.TAB.RENAME_MODE.CANCEL": cancelRenamingDashboardTabHandler,
    "GDC.DASH/CMD.TAB.RENAME": renameDashboardTabHandler,
};
