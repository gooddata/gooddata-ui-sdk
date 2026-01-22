// (C) 2021-2026 GoodData Corporation

import { type ICreateAlert, type ISaveAlert } from "./alerts.js";
import {
    type IChangeIgnoreExecutionTimestamp,
    type IChangeSharing,
    type IDeleteDashboard,
    type IExportDashboardToExcel,
    type IExportDashboardToPdf,
    type IExportDashboardToPdfPresentation,
    type IExportDashboardToPptPresentation,
    type IRenameDashboard,
    type IResetDashboard,
    type ISaveDashboard,
    type ISetAttributeFilterLimitingItems,
    type ISetDashboardAttributeFilterConfigDisplayAsLabel,
    type ISetDashboardAttributeFilterConfigMode,
    type ISetDashboardDateFilterConfigMode,
    type ISetDashboardDateFilterWithDimensionConfigMode,
    type ISetDateFilterConfigTitle,
    type InitializeDashboard,
    type SaveDashboardAs,
} from "./dashboard.js";
import {
    type IChangeDrillableItems,
    type ICrossFiltering,
    type IDrill,
    type IDrillDown,
    type IDrillToAttributeUrl,
    type IDrillToCustomUrl,
    type IDrillToDashboard,
    type IDrillToInsight,
    type IDrillToLegacyDashboard,
    type IKeyDriverAnalysis,
} from "./drill.js";
import { type IAddDrillTargets } from "./drillTargets.js";
import { type ITriggerEvent } from "./events.js";
import { type IUpsertExecutionResult } from "./executionResults.js";
import {
    type ChangeAttributeFilterSelection,
    type ChangeDateFilterSelection,
    type ChangeFilterContextSelection,
    type IAddAttributeFilter,
    type IAddDateFilter,
    type IApplyFilterContextWorkingSelection,
    type IApplyFilterView,
    type IDeleteFilterView,
    type IMoveAttributeFilter,
    type IMoveDateFilter,
    type IReloadFilterViews,
    type IRemoveAttributeFilters,
    type IRemoveDateFilters,
    type IResetFilterContextWorkingSelection,
    type ISaveFilterView,
    type ISetAttributeFilterDependentDateFilters,
    type ISetAttributeFilterDisplayForm,
    type ISetAttributeFilterParents,
    type ISetAttributeFilterSelectionMode,
    type ISetAttributeFilterTitle,
    type ISetFilterViewAsDefault,
} from "./filters.js";
import {
    type ChangeInsightWidgetVisConfiguration,
    type IAddDrillDownForInsightWidget,
    type IAttributeHierarchyModified,
    type IChangeInsightWidgetDescription,
    type IChangeInsightWidgetFilterSettings,
    type IChangeInsightWidgetHeader,
    type IChangeInsightWidgetIgnoreCrossFiltering,
    type IChangeInsightWidgetInsight,
    type IChangeInsightWidgetVisProperties,
    type IExportImageInsightWidget,
    type IExportInsightWidget,
    type IExportRawInsightWidget,
    type IExportSlidesInsightWidget,
    type IModifyDrillDownForInsightWidget,
    type IModifyDrillsForInsightWidget,
    type IRefreshInsightWidget,
    type IRemoveDrillDownForInsightWidget,
    type IRemoveDrillToUrlForInsightWidget,
    type IRemoveDrillsForInsightWidget,
} from "./insight.js";
import {
    type IChangeKpiWidgetComparison,
    type IChangeKpiWidgetConfiguration,
    type IChangeKpiWidgetDescription,
    type IChangeKpiWidgetFilterSettings,
    type IChangeKpiWidgetHeader,
    type IChangeKpiWidgetMeasure,
    type IRefreshKpiWidget,
    type IRemoveDrillForKpiWidget,
    type ISetDrillForKpiWidget,
} from "./kpi.js";
import {
    type ChangeLayoutSectionHeader,
    type IAddLayoutSection,
    type IAddSectionItems,
    type IMoveLayoutSection,
    type IMoveSectionItem,
    type IMoveSectionItemToNewSection,
    type IRemoveLayoutSection,
    type IRemoveSectionItem,
    type IRemoveSectionItemByWidgetRef,
    type IReplaceSectionItem,
    type IResizeHeight,
    type IResizeWidth,
    type ISetScreenSize,
    type IToggleLayoutDirection,
    type IToggleLayoutSectionHeaders,
    type IUndoLayoutChanges,
} from "./layout.js";
import { type RequestAsyncRender, type ResolveAsyncRender } from "./render.js";
import { type IChangeRenderMode } from "./renderMode.js";
import { type IChangeRichTextWidgetContent, type IChangeRichTextWidgetFilterSettings } from "./richText.js";
import {
    type ICreateScheduledEmail,
    type IInitializeAutomations,
    type IRefreshAutomations,
    type ISaveScheduledEmail,
} from "./scheduledEmail.js";
import { type ISetShowWidgetAsTable } from "./showWidgetAsTable.js";
import {
    type ICancelRenamingDashboardTab,
    type IConvertDashboardTabFromDefault,
    type ICreateDashboardTab,
    type IDeleteDashboardTab,
    type IRenameDashboardTab,
    type IRepositionDashboardTab,
    type IStartRenamingDashboardTab,
    type ISwitchDashboardTab,
} from "./tabs.js";
import { type ILoadAllWorkspaceUsers } from "./users.js";
import {
    type IAddVisualizationToVisualizationSwitcherWidgetContent,
    type IUpdateVisualizationsFromVisualizationSwitcherWidgetContent,
} from "./visualizationSwitcher.js";

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
    | IChangeRenderMode
    | ISaveDashboard
    | IRenameDashboard
    | IResetDashboard
    | IExportDashboardToPdf
    | IExportDashboardToExcel
    | IExportDashboardToPdfPresentation
    | IExportDashboardToPptPresentation
    | IDeleteDashboard
    | ITriggerEvent
    | IUpsertExecutionResult
    | IAddAttributeFilter
    | IRemoveAttributeFilters
    | IMoveAttributeFilter
    | ISetAttributeFilterParents
    | ISetAttributeFilterDependentDateFilters
    | IAddLayoutSection
    | IMoveLayoutSection
    | IRemoveLayoutSection
    | ChangeLayoutSectionHeader
    | IResizeHeight
    | IResizeWidth
    | IAddSectionItems
    | IReplaceSectionItem
    | IMoveSectionItem
    | IMoveSectionItemToNewSection
    | IRemoveSectionItem
    | IRemoveSectionItemByWidgetRef
    | IUndoLayoutChanges
    | IChangeKpiWidgetHeader
    | IChangeKpiWidgetDescription
    | IChangeKpiWidgetConfiguration
    | IChangeKpiWidgetMeasure
    | IChangeKpiWidgetFilterSettings
    | IChangeKpiWidgetComparison
    | IRefreshKpiWidget
    | ISetDrillForKpiWidget
    | IRemoveDrillForKpiWidget
    | IChangeInsightWidgetHeader
    | IChangeInsightWidgetDescription
    | IChangeInsightWidgetIgnoreCrossFiltering
    | IChangeInsightWidgetFilterSettings
    | IChangeInsightWidgetVisProperties
    | ChangeInsightWidgetVisConfiguration
    | IChangeInsightWidgetInsight
    | IModifyDrillsForInsightWidget
    | IRemoveDrillsForInsightWidget
    | IRefreshInsightWidget
    | IExportInsightWidget
    | ICreateAlert
    | ISaveAlert
    | ICreateScheduledEmail
    | ISaveScheduledEmail
    | IChangeSharing
    | ISetAttributeFilterDisplayForm
    | ISetAttributeFilterTitle
    | ISetAttributeFilterSelectionMode
    | IChangeRichTextWidgetContent
    | IChangeRichTextWidgetFilterSettings
    | IAddVisualizationToVisualizationSwitcherWidgetContent
    | IUpdateVisualizationsFromVisualizationSwitcherWidgetContent
    //alpha
    | IDrill
    | IDrillDown
    | IDrillToAttributeUrl
    | IDrillToCustomUrl
    | IDrillToDashboard
    | IDrillToInsight
    | IDrillToLegacyDashboard
    | IChangeDrillableItems
    | IAddDrillTargets
    | ISetDashboardDateFilterConfigMode
    | ISetDashboardAttributeFilterConfigMode
    | ISetDashboardAttributeFilterConfigDisplayAsLabel
    | IRemoveDrillDownForInsightWidget
    | IRemoveDrillToUrlForInsightWidget
    | IAddDrillDownForInsightWidget
    | IModifyDrillDownForInsightWidget
    | ICrossFiltering
    | IKeyDriverAnalysis
    | IAttributeHierarchyModified
    | IAddDateFilter
    | IRemoveDateFilters
    | IMoveDateFilter
    | ISetDashboardDateFilterWithDimensionConfigMode
    | ISetDateFilterConfigTitle
    | IInitializeAutomations
    | IRefreshAutomations
    | ISetAttributeFilterLimitingItems
    | ISaveFilterView
    | IDeleteFilterView
    | IApplyFilterView
    | ISetFilterViewAsDefault
    | IReloadFilterViews
    | IToggleLayoutSectionHeaders
    | IToggleLayoutDirection
    | IApplyFilterContextWorkingSelection
    | IResetFilterContextWorkingSelection
    | IChangeIgnoreExecutionTimestamp
    | ISwitchDashboardTab
    | IConvertDashboardTabFromDefault
    | ICreateDashboardTab
    | IRepositionDashboardTab
    | IDeleteDashboardTab
    | IStartRenamingDashboardTab
    | ICancelRenamingDashboardTab
    | IRenameDashboardTab
    //internal
    | ISetScreenSize
    | ILoadAllWorkspaceUsers
    | IExportRawInsightWidget
    | IExportSlidesInsightWidget
    | IExportImageInsightWidget
    | ISetShowWidgetAsTable;
