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

export type { DashboardCommandType, IDashboardCommand, CommandProcessingMeta } from "./base.js";
export type {
    InitializeDashboard,
    InitializeDashboardPayload,
    SaveDashboardAs,
    SaveDashboardAsPayload,
    ISaveDashboard,
    ISaveDashboardPayload,
    IRenameDashboard,
    IRenameDashboardPayload,
    IResetDashboard,
    IExportDashboardToPdf,
    IExportDashboardToPptPresentation,
    IExportDashboardToPdfPresentation,
    IExportDashboardToExcel,
    IExportDashboardToExcelPayload,
    IDeleteDashboard,
    IChangeSharing,
    IChangeSharingPayload,
    ISetDashboardDateFilterConfigMode,
    ISetDashboardDateFilterConfigModePayload,
    ISetDashboardDateFilterWithDimensionConfigMode,
    ISetDashboardDateFilterWithDimensionConfigModePayload,
    ISetDashboardAttributeFilterConfigMode,
    ISetDashboardAttributeFilterConfigModePayload,
    ISetDateFilterConfigTitle,
    ISetDateFilterConfigTitlePayload,
    ISetAttributeFilterLimitingItems,
    ISetAttributeFilterLimitingItemsPayload,
    ISetDashboardAttributeFilterConfigDisplayAsLabel,
    ISetDashboardAttributeFilterConfigDisplayAsLabelPayload,
    IChangeIgnoreExecutionTimestamp,
    IChangeIgnoreExecutionTimestampPayload,
    IExportDashboardToPresentationPayload,
    PdfConfiguration,
} from "./dashboard.js";
export {
    InitialLoadCorrelationId,
    initializeDashboard,
    initializeDashboardWithPersistedDashboard,
    saveDashboardAs,
    saveDashboard,
    renameDashboard,
    resetDashboard,
    exportDashboardToPdf,
    exportDashboardToExcel,
    exportDashboardToPdfPresentation,
    exportDashboardToPptPresentation,
    deleteDashboard,
    changeSharing,
    setDashboardDateFilterConfigMode,
    setDashboardDateFilterWithDimensionConfigMode,
    setDashboardAttributeFilterConfigMode,
    setDateFilterConfigTitle,
    setAttributeFilterLimitingItems,
    setDashboardAttributeFilterConfigDisplayAsLabel,
    changeIgnoreExecutionTimestamp,
} from "./dashboard.js";

export type { ITriggerEvent, ITriggerEventPayload } from "./events.js";
export { triggerEvent } from "./events.js";

export type {
    ChangeDateFilterSelection,
    IAddAttributeFilter,
    AddAttributeFilterPayload,
    IMoveAttributeFilter,
    MoveAttributeFilterPayload,
    IRemoveAttributeFilters,
    IRemoveAttributeFiltersPayload,
    IAddDateFilter,
    IAddDateFilterPayload,
    IRemoveDateFilters,
    IRemoveDateFiltersPayload,
    IMoveDateFilter,
    MoveDateFilterPayload,
    ChangeAttributeFilterSelection,
    AttributeFilterSelectionType,
    ISetAttributeFilterParents,
    SetAttributeFilterParentsPayload,
    ChangeAttributeFilterSelectionPayload,
    ChangeFilterContextSelection,
    ChangeFilterContextSelectionPayload,
    DateFilterSelection,
    ChangeFilterContextSelectionParams,
    ISetAttributeFilterDisplayForm,
    ISetAttributeFilterDisplayFormPayload,
    ISetAttributeFilterTitle,
    ISetAttributeFilterTitlePayload,
    ISetAttributeFilterSelectionMode,
    ISetAttributeFilterSelectionModePayload,
    ISetAttributeFilterDependentDateFilters,
    SetAttributeFilterDependentDateFiltersPayload,
    ISaveFilterView,
    ISaveFilterViewPayload,
    IDeleteFilterView,
    IDeleteFilterViewPayload,
    IApplyFilterView,
    IApplyFilterViewPayload,
    ISetFilterViewAsDefault,
    ISetFilterViewAsDefaultPayload,
    IReloadFilterViews,
    IApplyFilterContextWorkingSelection,
    IResetFilterContextWorkingSelection,
} from "./filters.js";
export {
    changeDateFilterSelection,
    clearDateFilterSelection,
    addAttributeFilter,
    moveAttributeFilter,
    removeAttributeFilter,
    removeAttributeFilters,
    addDateFilter,
    removeDateFilter,
    moveDateFilter,
    resetAttributeFilterSelection,
    changeAttributeFilterSelection,
    changeMigratedAttributeFilterSelection,
    changeWorkingAttributeFilterSelection,
    setAttributeFilterParents,
    changeFilterContextSelection,
    changeFilterContextSelectionByParams,
    applyAttributeFilter,
    applyDateFilter,
    setAttributeFilterDisplayForm,
    setAttributeFilterTitle,
    setAttributeFilterSelectionMode,
    setAttributeFilterDependentDateFilters,
    saveFilterView,
    deleteFilterView,
    applyFilterView,
    setFilterViewAsDefault,
    reloadFilterViews,
    applyFilterContextWorkingSelection,
    resetFilterContextWorkingSelection,
} from "./filters.js";

export type {
    IAddLayoutSection,
    IAddLayoutSectionPayload,
    IMoveLayoutSection,
    IMoveLayoutSectionPayload,
    IRemoveLayoutSection,
    IRemoveLayoutSectionPayload,
    ChangeLayoutSectionHeader,
    ChangeLayoutSectionHeaderPayload,
    IAddSectionItems,
    IAddSectionItemsPayload,
    IReplaceSectionItem,
    IReplaceSectionItemPayload,
    IMoveSectionItem,
    IMoveSectionItemPayload,
    IMoveSectionItemToNewSection,
    IMoveSectionItemToNewSectionPayload,
    IRemoveSectionItem,
    IRemoveSectionItemPayload,
    IRemoveSectionItemByWidgetRef,
    IRemoveSectionItemByWidgetRefPayload,
    IUndoLayoutChanges,
    IUndoLayoutChangesPayload,
    DashboardLayoutCommands,
    UndoPointSelector,
    IResizeHeight,
    IResizeHeightPayload,
    IResizeWidth,
    IResizeWidthPayload,
    ISetScreenSize,
    ISetScreenSizePayload,
    IToggleLayoutSectionHeaders,
    IToggleLayoutSectionHeadersPayload,
    IToggleLayoutDirection,
    IToggleLayoutDirectionPayload,
} from "./layout.js";
export {
    addLayoutSection,
    addNestedLayoutSection,
    moveLayoutSection,
    moveNestedLayoutSection,
    removeLayoutSection,
    removeNestedLayoutSection,
    changeLayoutSectionHeader,
    changeNestedLayoutSectionHeader,
    addSectionItem,
    addNestedLayoutSectionItem,
    replaceSectionItem,
    replaceNestedLayoutSectionItem,
    moveSectionItem,
    moveNestedLayoutSectionItem,
    moveSectionItemAndRemoveOriginalSectionIfEmpty,
    moveNestedLayoutSectionItemAndRemoveOriginalSectionIfEmpty,
    moveSectionItemToNewSection,
    moveNestedLayoutSectionItemToNewSection,
    moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
    moveNestedLayoutSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
    removeSectionItem,
    removeNestedLayoutSectionItem,
    eagerRemoveSectionItem,
    eagerRemoveNestedLayoutSectionItem,
    removeSectionItemByWidgetRef,
    eagerRemoveSectionItemByWidgetRef,
    undoLayoutChanges,
    revertLastLayoutChange,
    resizeHeight,
    resizeNestedLayoutItemsHeight,
    resizeWidth,
    resizeNestedLayoutItemWidth,
    setScreenSize,
    toggleLayoutSectionHeaders,
    toggleLayoutDirection,
} from "./layout.js";

export type { ICreateAlert, ICreateAlertPayload, ISaveAlert, ISaveAlertPayload } from "./alerts.js";
export { createAlert, saveAlert } from "./alerts.js";

export type {
    ICreateScheduledEmail,
    ICreateScheduledEmailPayload,
    ISaveScheduledEmail,
    ISaveScheduledEmailPayload,
    IRefreshAutomations,
    IInitializeAutomations,
} from "./scheduledEmail.js";
export {
    createScheduledEmail,
    saveScheduledEmail,
    refreshAutomations,
    initializeAutomations,
} from "./scheduledEmail.js";

export type {
    IDrill,
    IDrillPayload,
    IDrillDown,
    IDrillDownPayload,
    IDrillToAttributeUrl,
    IDrillToAttributeUrlPayload,
    IDrillToCustomUrl,
    IDrillToCustomUrlPayload,
    IDrillToDashboard,
    IDrillToDashboardPayload,
    IDrillToInsight,
    IDrillToInsightPayload,
    IDrillToLegacyDashboard,
    IDrillToLegacyDashboardPayload,
    IChangeDrillableItems,
    IChangeDrillableItemsPayload,
    DashboardDrillCommand,
    ICrossFiltering,
    ICrossFilteringPayload,
    IKeyDriverAnalysis,
    IKeyDriverAnalysisPayload,
} from "./drill.js";
export {
    drill,
    drillDown,
    drillToAttributeUrl,
    drillToCustomUrl,
    drillToDashboard,
    drillToInsight,
    drillToLegacyDashboard,
    changeDrillableItems,
    crossFiltering,
    keyDriverAnalysis,
} from "./drill.js";

export type { IUpsertExecutionResult } from "./executionResults.js";
export {
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultLoading,
} from "./executionResults.js";

export type {
    IChangeKpiWidgetHeader,
    IChangeKpiWidgetHeaderPayload,
    IChangeKpiWidgetDescription,
    IChangeKpiWidgetDescriptionPayload,
    IChangeKpiWidgetConfiguration,
    IChangeKpiWidgetConfigurationPayload,
    IChangeKpiWidgetMeasure,
    IChangeKpiWidgetMeasurePayload,
    IChangeKpiWidgetFilterSettings,
    IChangeKpiWidgetFilterSettingsPayload,
    IChangeKpiWidgetComparison,
    IChangeKpiWidgetComparisonPayload,
    IRefreshKpiWidget,
    IRefreshKpiWidgetPayload,
    IKpiWidgetComparison,
    IRemoveDrillForKpiWidget,
    IRemoveDrillForKpiWidgetPayload,
    ISetDrillForKpiWidget,
    ISetDrillForKpiWidgetPayload,
} from "./kpi.js";
export {
    changeKpiWidgetHeader,
    changeKpiWidgetDescription,
    changeKpiWidgetConfiguration,
    changeKpiWidgetMeasure,
    replaceKpiWidgetFilterSettings,
    enableKpiWidgetDateFilter,
    disableKpiWidgetDateFilter,
    replaceKpiWidgetIgnoredFilters,
    ignoreFilterOnKpiWidget,
    unignoreFilterOnKpiWidget,
    changeKpiWidgetComparison,
    refreshKpiWidget,
    removeDrillForKpiWidget,
    setDrillForKpiWidget,
} from "./kpi.js";

export type {
    IChangeInsightWidgetHeader,
    IChangeInsightWidgetHeaderPayload,
    IChangeInsightWidgetDescription,
    IChangeInsightWidgetDescriptionPayload,
    IChangeInsightWidgetIgnoreCrossFiltering,
    IChangeInsightWidgetIgnoreCrossFilteringPayload,
    IChangeInsightWidgetFilterSettings,
    IChangeInsightWidgetFilterSettingsPayload,
    IChangeInsightWidgetVisProperties,
    IChangeInsightWidgetVisPropertiesPayload,
    ChangeInsightWidgetVisConfiguration,
    ChangeInsightWidgetVisConfigurationPayload,
    IChangeInsightWidgetInsight,
    IChangeInsightWidgetInsightPayload,
    IModifyDrillsForInsightWidget,
    IModifyDrillsForInsightWidgetPayload,
    IRemoveDrillsForInsightWidget,
    IRemoveDrillsForInsightWidgetPayload,
    IRemoveDrillDownForInsightWidget,
    IRemoveDrillDownForInsightWidgetPayload,
    IRemoveDrillToUrlForInsightWidget,
    IRemoveDrillToUrlForInsightWidgetPayload,
    IAddDrillDownForInsightWidget,
    IAddDrillDownForInsightWidgetPayload,
    IModifyDrillDownForInsightWidget,
    IModifyDrillDownForInsightWidgetPayload,
    RemoveDrillsSelector,
    IRefreshInsightWidget,
    IRefreshInsightWidgetPayload,
    IExportInsightWidget,
    IExportInsightWidgetPayload,
    IAttributeHierarchyModified,
    IExportRawInsightWidget,
    IExportRawInsightWidgetPayload,
    IExportSlidesInsightWidget,
    IExportSlidesInsightWidgetPayload,
    IExportImageInsightWidget,
    IExportImageInsightWidgetPayload,
} from "./insight.js";
export type { ISetShowWidgetAsTable } from "./showWidgetAsTable.js";

export {
    changeInsightWidgetHeader,
    changeInsightWidgetDescription,
    changeInsightWidgetIgnoreCrossFiltering,
    replaceInsightWidgetFilterSettings,
    enableInsightWidgetDateFilter,
    disableInsightWidgetDateFilter,
    replaceInsightWidgetIgnoredFilters,
    ignoreFilterOnInsightWidget,
    unignoreFilterOnInsightWidget,
    ignoreDateFilterOnInsightWidget,
    unignoreDateFilterOnInsightWidget,
    changeInsightWidgetVisProperties,
    changeInsightWidgetVisConfiguration,
    changeInsightWidgetInsight,
    modifyDrillsForInsightWidget,
    removeDrillsForInsightWidget,
    removeDrillDownForInsightWidget,
    removeDrillToUrlForInsightWidget,
    addDrillDownForInsightWidget,
    modifyDrillDownForInsightWidget,
    refreshInsightWidget,
    exportInsightWidget,
    exportRawInsightWidget,
    exportSlidesInsightWidget,
    attributeHierarchyModified,
    exportImageInsightWidget,
} from "./insight.js";
export { loadAllWorkspaceUsers } from "./users.js";
export type { ILoadAllWorkspaceUsers } from "./users.js";

export type {
    IChangeRichTextWidgetContent,
    IChangeRichTextWidgetContentPayload,
    IChangeRichTextWidgetFilterSettings,
    IChangeRichTextWidgetFilterSettingsPayload,
} from "./richText.js";
export {
    changeRichTextWidgetContent,
    enableRichTextWidgetDateFilter,
    disableRichTextWidgetDateFilter,
    ignoreDateFilterOnRichTextWidget,
    unignoreDateFilterOnRichTextWidget,
    ignoreFilterOnRichTextWidget,
    unignoreFilterOnRichTextWidget,
} from "./richText.js";

export type {
    IAddVisualizationToVisualizationSwitcherWidgetContent,
    IAddVisualizationToVisualizationSwitcherWidgetContentPayload,
    IUpdateVisualizationsFromVisualizationSwitcherWidgetContent,
    IUpdateVisualizationsFromVisualizationSwitcherWidgetContentPayload,
} from "./visualizationSwitcher.js";
export {
    addVisualizationToSwitcherWidgetContent,
    updateVisualizationsFromSwitcherWidgetContent,
} from "./visualizationSwitcher.js";

export type {
    RequestAsyncRender,
    RequestAsyncRenderPayload,
    ResolveAsyncRender,
    ResolveAsyncRenderPayload,
} from "./render.js";
export { requestAsyncRender, resolveAsyncRender } from "./render.js";

export type { IChangeRenderMode, IChangeRenderModePayload, IRenderModeChangeOptions } from "./renderMode.js";
export { changeRenderMode, cancelEditRenderMode, switchToEditRenderMode } from "./renderMode.js";

export type { IAddDrillTargets, IAddDrillTargetsPayload } from "./drillTargets.js";
export { addDrillTargets } from "./drillTargets.js";

export type { ISetShowWidgetAsTablePayload } from "./showWidgetAsTable.js";
export { setShowWidgetAsTable } from "./showWidgetAsTable.js";
export type {
    ISwitchDashboardTab,
    ISwitchDashboardTabPayload,
    IConvertDashboardTabFromDefault,
    IConvertDashboardTabFromDefaultPayload,
    ICreateDashboardTab,
    ICreateDashboardTabPayload,
    IRepositionDashboardTab,
    IRepositionDashboardTabPayload,
    IDeleteDashboardTab,
    IDeleteDashboardTabPayload,
    IStartRenamingDashboardTab,
    IStartRenamingDashboardTabPayload,
    ICancelRenamingDashboardTab,
    ICancelRenamingDashboardTabPayload,
    IRenameDashboardTab,
    IRenameDashboardTabPayload,
} from "./tabs.js";
export {
    switchDashboardTab,
    repositionDashboardTab,
    convertDashboardTabFromDefault,
    createDashboardTab,
    deleteDashboardTab,
    startRenamingDashboardTab,
    cancelRenamingDashboardTab,
    renameDashboardTab,
} from "./tabs.js";

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
