// (C) 2019-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

/**
 * This package provides a Dashboard component that enables you to embed dashboards into your application as React components.
 *
 * @remarks
 * The component also allows for customization of the embedded dashboard using plugins.
 * See also `@gooddata/sdk-ui-loaders`.
 *
 * @packageDocumentation
 */

// exported only for api-extractor's sake
export type { DateFilterConfigValidationResult } from "./_staging/dateFilterConfig/validation.js";

// ObjRefMap & factories will be part of the public API.. although in different package
export { type IObjRefMapConfig, ObjRefMap, newDisplayFormMap } from "./_staging/metadata/objRefMap.js";

// TODO remove export after values resolver call from KD is obsolete
export { resolveFilterValues } from "./model/commandHandlers/drill/common/filterValuesResolver.js";

/*
 * The public API of the Dashboard model is exported from here.
 *
 * What is exported:
 *
 * -  hooks do dispatch commands / call selectors
 * -  all selectors & the typing of state with which they work
 * -  all events & their types. Note: event factories are not exported on purpose. outside code should not be
 *    creating events
 * -  all commands, their types & command factories
 */
export type {
    DashboardContext,
    DashboardItem,
    DashboardItemVisualization,
    DashboardItemVisualizationContent,
    ObjectAvailabilityConfig,
    DashboardConfig,
    IDashboardExportSlideConfig,
    IDashboardFocusObject,
    DashboardModelCustomizationFns,
    DashboardTransformFn,
    FiltersInfo,
    ResolvedDashboardConfig,
    ResolvedEntitlements,
    ResolvableFilter,
    ResolvedDateFilterValues,
    IResolvedAttributeFilterValues,
    IResolvedDateFilterValue,
    IResolvedFilterValues,
    WidgetsOverlayFn,
    IDashboardWidgetOverlay,
    PrivateDashboardContext,
    DashboardLayoutExportTransformFn,
    isDashboardItemVisualization,
    isDashboardItemVisualizationContent,
} from "./model/types/commonTypes.js";
export {
    type ICustomWidget,
    type ICustomWidgetDefinition,
    type ICustomWidgetBase,
    type ExtendedDashboardItem,
    type ExtendedDashboardWidget,
    type DashboardItemDefinition,
    type StashedDashboardItemsId,
    type ExtendedDashboardLayoutSection,
    type RelativeIndex,
    type ExtendedDashboardItemType,
    type ExtendedDashboardItemTypes,
    type ExtendedDashboardLayoutWidget,
    type FilterableDashboardWidget,
    newCustomWidget,
    newDashboardItem,
    newDashboardSection,
    isCustomWidgetDefinition,
    isCustomWidgetBase,
    isCustomWidget,
    extendedWidgetDebugStr,
    isExtendedDashboardLayoutWidget,
    type IItemWithHeight,
    type IItemWithWidth,
} from "./model/types/layoutTypes.js";
export type {
    IFilterOp,
    IFilterOpReplaceAll,
    IFilterOpUnignoreAttributeFilter,
    IFilterOpIgnoreAttributeFilter,
    IFilterOpReplaceAttributeIgnores,
    IFilterOpDisableDateFilter,
    IFilterOpEnableDateFilter,
    IFilterOpUnignoreDateFilter,
    IFilterOpIgnoreDateFilter,
    FilterOperations,
    IWidgetFilterOperation,
    IWidgetHeader,
    IWidgetDescription,
} from "./model/types/widgetTypes.js";

export {
    type BrokenAlertType,
    type IBrokenAlertFilterBasicInfo,
    type BrokenAlertDateFilterInfo,
    type BrokenAlertAttributeFilterInfo,
    isBrokenAlertDateFilterInfo,
    isBrokenAlertAttributeFilterInfo,
} from "./model/types/alertTypes.js";

export type {
    ICsvExportConfig,
    IExportConfig,
    IXlsxExportConfig,
    IPdfExportConfig,
} from "./model/types/exportTypes.js";

export type {
    IConnectingAttribute,
    IDashboardAttributeFilterDisplayForms,
    IDashboardAttributeFilterParentItem,
    IParentWithConnectingAttributes,
    IUseAttributeElements,
} from "./model/types/attributeFilterTypes.js";

export {
    type IDashboardDependentDateFilter,
    isDashboardDependentDateFilter,
} from "./model/types/dateFilterTypes.js";

export { DRILL_TO_URL_PLACEHOLDER } from "./model/types/drillTypes.js";
export type {
    DashboardAccessibilityLimitation,
    IInaccessibleDashboard,
} from "./model/types/inaccessibleDashboardTypes.js";

export {
    DashboardStoreProvider,
    useDashboardDispatch,
    useDashboardSelector,
    ReactDashboardContext,
} from "./model/react/DashboardStoreProvider.js";
export {
    type IDashboardEventsContext,
    useDashboardEventsContext,
} from "./model/react/DashboardEventsContext.js";
export {
    type CommandProcessingStatus,
    useDashboardCommandProcessing,
} from "./model/react/useDashboardCommandProcessing.js";
export { useDashboardEventDispatch } from "./model/react/useDashboardEventDispatch.js";
export {
    type QueryProcessingStatus,
    type QueryProcessingErrorState,
    type QueryProcessingPendingState,
    type QueryProcessingRejectedState,
    type QueryProcessingRunningState,
    type QueryProcessingState,
    type QueryProcessingSuccessState,
    type UseDashboardQueryProcessingResult,
    useDashboardQueryProcessing,
} from "./model/react/useDashboardQueryProcessing.js";
export { useDashboardUserInteraction } from "./model/react/useDashboardUserInteraction.js";
export {
    type UseDashboardAsyncRender,
    useDashboardAsyncRender,
} from "./model/react/useDashboardAsyncRender.js";
export type { IDashboardStoreProviderProps } from "./model/react/types.js";
export { useDispatchDashboardCommand } from "./model/react/useDispatchDashboardCommand.js";
export { useWidgetExecutionsHandler } from "./model/react/useWidgetExecutionsHandler.js";
export { useDashboardScheduledEmails } from "./model/react/useDasboardScheduledEmails/useDashboardScheduledEmails.js";
export { useDashboardAlertsOld } from "./model/react/useDashboardAlertsOld.js";
export { useDashboardAlerts } from "./model/react/useDashboardAlerting/useDashboardAlerts.js";
export { type IUseWidgetSelectionResult, useWidgetSelection } from "./model/react/useWidgetSelection.js";
export { useWidgetFilters } from "./model/react/useWidgetFilters.js";
export { useDashboardAutomations } from "./model/react/useDashboardAutomations/useDashboardAutomations.js";
export { DEFAULT_MAX_AUTOMATIONS } from "./model/react/useDashboardAutomations/constants.js";
export { useWorkspaceUsers } from "./model/react/useWorkspaceUsers.js";
export {
    type IUseWidgetAlertFiltersProps,
    useWidgetAlertFilters,
} from "./model/react/filtering/useWidgetAlertFilters.js";
export { useEnableAlertingAutomationFilterContext } from "./model/react/useDashboardAlerting/useEnableAutomationFilterContext.js";
export {
    useScheduledExportFilters,
    type IUseScheduledExportFiltersProps,
} from "./model/react/filtering/useScheduledExportFilters.js";
export {
    useWidgetScheduledExportFilters,
    type IUseWidgetScheduledExportFiltersProps,
} from "./model/react/filtering/useWidgetScheduledExportFilters.js";
export { useAutomationAvailableDashboardFilters } from "./model/react/filtering/useAutomationAvailableDashboardFilters.js";
export {
    selectAutomationCommonDateFilterId,
    selectAutomationAvailableDashboardFilters,
    selectAutomationDefaultSelectedFilters,
    selectAutomationFiltersByTab,
    selectDashboardFiltersWithoutCrossFiltering,
    selectDashboardHiddenFilters,
    selectDashboardLockedFilters,
    type IAutomationFiltersTab,
} from "./model/store/filtering/dashboardFilterSelectors.js";

// Re-export from commands
export { type DashboardCommands } from "./model/commands/index.js";
export type {
    DashboardCommandType,
    IDashboardCommand,
    CommandProcessingMeta,
} from "./model/commands/base.js";
export {
    type InitializeDashboard,
    type InitializeDashboardPayload,
    type SaveDashboardAs,
    type SaveDashboardAsPayload,
    type ISaveDashboard,
    type ISaveDashboardPayload,
    type IRenameDashboard,
    type IRenameDashboardPayload,
    type IResetDashboard,
    type IExportDashboardToPdf,
    type IExportDashboardToPptPresentation,
    type IExportDashboardToPdfPresentation,
    type IExportDashboardToExcel,
    type IExportDashboardToExcelPayload,
    type IDeleteDashboard,
    type IChangeSharing,
    type IChangeSharingPayload,
    type ISetDashboardDateFilterConfigMode,
    type ISetDashboardDateFilterConfigModePayload,
    type ISetDashboardDateFilterWithDimensionConfigMode,
    type ISetDashboardDateFilterWithDimensionConfigModePayload,
    type ISetDashboardAttributeFilterConfigMode,
    type ISetDashboardAttributeFilterConfigModePayload,
    type ISetDateFilterConfigTitle,
    type ISetDateFilterConfigTitlePayload,
    type ISetAttributeFilterLimitingItems,
    type ISetAttributeFilterLimitingItemsPayload,
    type ISetDashboardAttributeFilterConfigDisplayAsLabel,
    type ISetDashboardAttributeFilterConfigDisplayAsLabelPayload,
    type IChangeIgnoreExecutionTimestamp,
    type IChangeIgnoreExecutionTimestampPayload,
    type IExportDashboardToPresentationPayload,
    type PdfConfiguration,
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
} from "./model/commands/dashboard.js";
export { type ITriggerEvent, type ITriggerEventPayload, triggerEvent } from "./model/commands/events.js";
export {
    type ChangeDateFilterSelection,
    type IAddAttributeFilter,
    type AddAttributeFilterPayload,
    type IMoveAttributeFilter,
    type MoveAttributeFilterPayload,
    type IRemoveAttributeFilters,
    type IRemoveAttributeFiltersPayload,
    type IAddDateFilter,
    type IAddDateFilterPayload,
    type IRemoveDateFilters,
    type IRemoveDateFiltersPayload,
    type IMoveDateFilter,
    type MoveDateFilterPayload,
    type ChangeAttributeFilterSelection,
    type AttributeFilterSelectionType,
    type ISetAttributeFilterParents,
    type SetAttributeFilterParentsPayload,
    type ChangeAttributeFilterSelectionPayload,
    type ChangeFilterContextSelection,
    type ChangeFilterContextSelectionPayload,
    type DateFilterSelection,
    type ChangeFilterContextSelectionParams,
    type ISetAttributeFilterDisplayForm,
    type ISetAttributeFilterDisplayFormPayload,
    type ISetAttributeFilterTitle,
    type ISetAttributeFilterTitlePayload,
    type ISetAttributeFilterSelectionMode,
    type ISetAttributeFilterSelectionModePayload,
    type ISetAttributeFilterDependentDateFilters,
    type SetAttributeFilterDependentDateFiltersPayload,
    type ISaveFilterView,
    type ISaveFilterViewPayload,
    type IDeleteFilterView,
    type IDeleteFilterViewPayload,
    type IApplyFilterView,
    type IApplyFilterViewPayload,
    type ISetFilterViewAsDefault,
    type ISetFilterViewAsDefaultPayload,
    type IReloadFilterViews,
    type IApplyFilterContextWorkingSelection,
    type IResetFilterContextWorkingSelection,
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
} from "./model/commands/filters.js";
export {
    type IAddLayoutSection,
    type IAddLayoutSectionPayload,
    type IMoveLayoutSection,
    type IMoveLayoutSectionPayload,
    type IRemoveLayoutSection,
    type IRemoveLayoutSectionPayload,
    type ChangeLayoutSectionHeader,
    type ChangeLayoutSectionHeaderPayload,
    type IAddSectionItems,
    type IAddSectionItemsPayload,
    type IReplaceSectionItem,
    type IReplaceSectionItemPayload,
    type IMoveSectionItem,
    type IMoveSectionItemPayload,
    type IMoveSectionItemToNewSection,
    type IMoveSectionItemToNewSectionPayload,
    type IRemoveSectionItem,
    type IRemoveSectionItemPayload,
    type IRemoveSectionItemByWidgetRef,
    type IRemoveSectionItemByWidgetRefPayload,
    type IUndoLayoutChanges,
    type IUndoLayoutChangesPayload,
    type DashboardLayoutCommands,
    type UndoPointSelector,
    type IResizeHeight,
    type IResizeHeightPayload,
    type IResizeWidth,
    type IResizeWidthPayload,
    type ISetScreenSize,
    type ISetScreenSizePayload,
    type IToggleLayoutSectionHeaders,
    type IToggleLayoutSectionHeadersPayload,
    type IToggleLayoutDirection,
    type IToggleLayoutDirectionPayload,
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
} from "./model/commands/layout.js";
export {
    type ICreateAlert,
    type ICreateAlertPayload,
    type ISaveAlert,
    type ISaveAlertPayload,
    createAlert,
    saveAlert,
} from "./model/commands/alerts.js";
export {
    type ICreateScheduledEmail,
    type ICreateScheduledEmailPayload,
    type ISaveScheduledEmail,
    type ISaveScheduledEmailPayload,
    type IRefreshAutomations,
    type IInitializeAutomations,
    createScheduledEmail,
    saveScheduledEmail,
    refreshAutomations,
    initializeAutomations,
} from "./model/commands/scheduledEmail.js";
export {
    type IDrill,
    type IDrillPayload,
    type IDrillDown,
    type IDrillDownPayload,
    type IDrillToAttributeUrl,
    type IDrillToAttributeUrlPayload,
    type IDrillToCustomUrl,
    type IDrillToCustomUrlPayload,
    type IDrillToDashboard,
    type IDrillToDashboardPayload,
    type IDrillToInsight,
    type IDrillToInsightPayload,
    type IDrillToLegacyDashboard,
    type IDrillToLegacyDashboardPayload,
    type IChangeDrillableItems,
    type IChangeDrillableItemsPayload,
    type DashboardDrillCommand,
    type ICrossFiltering,
    type ICrossFilteringPayload,
    type IKeyDriverAnalysis,
    type IKeyDriverAnalysisPayload,
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
} from "./model/commands/drill.js";
export {
    type IUpsertExecutionResult,
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultLoading,
} from "./model/commands/executionResults.js";
export {
    type IChangeKpiWidgetHeader,
    type IChangeKpiWidgetHeaderPayload,
    type IChangeKpiWidgetDescription,
    type IChangeKpiWidgetDescriptionPayload,
    type IChangeKpiWidgetConfiguration,
    type IChangeKpiWidgetConfigurationPayload,
    type IChangeKpiWidgetMeasure,
    type IChangeKpiWidgetMeasurePayload,
    type IChangeKpiWidgetFilterSettings,
    type IChangeKpiWidgetFilterSettingsPayload,
    type IChangeKpiWidgetComparison,
    type IChangeKpiWidgetComparisonPayload,
    type IRefreshKpiWidget,
    type IRefreshKpiWidgetPayload,
    type IKpiWidgetComparison,
    type IRemoveDrillForKpiWidget,
    type IRemoveDrillForKpiWidgetPayload,
    type ISetDrillForKpiWidget,
    type ISetDrillForKpiWidgetPayload,
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
} from "./model/commands/kpi.js";
export {
    type IChangeInsightWidgetHeader,
    type IChangeInsightWidgetHeaderPayload,
    type IChangeInsightWidgetDescription,
    type IChangeInsightWidgetDescriptionPayload,
    type IChangeInsightWidgetIgnoreCrossFiltering,
    type IChangeInsightWidgetIgnoreCrossFilteringPayload,
    type IChangeInsightWidgetFilterSettings,
    type IChangeInsightWidgetFilterSettingsPayload,
    type IChangeInsightWidgetVisProperties,
    type IChangeInsightWidgetVisPropertiesPayload,
    type ChangeInsightWidgetVisConfiguration,
    type ChangeInsightWidgetVisConfigurationPayload,
    type IChangeInsightWidgetInsight,
    type IChangeInsightWidgetInsightPayload,
    type IModifyDrillsForInsightWidget,
    type IModifyDrillsForInsightWidgetPayload,
    type IRemoveDrillsForInsightWidget,
    type IRemoveDrillsForInsightWidgetPayload,
    type IRemoveDrillDownForInsightWidget,
    type IRemoveDrillDownForInsightWidgetPayload,
    type IRemoveDrillToUrlForInsightWidget,
    type IRemoveDrillToUrlForInsightWidgetPayload,
    type IAddDrillDownForInsightWidget,
    type IAddDrillDownForInsightWidgetPayload,
    type IModifyDrillDownForInsightWidget,
    type IModifyDrillDownForInsightWidgetPayload,
    type RemoveDrillsSelector,
    type IRefreshInsightWidget,
    type IRefreshInsightWidgetPayload,
    type IExportInsightWidget,
    type IExportInsightWidgetPayload,
    type IAttributeHierarchyModified,
    type IExportRawInsightWidget,
    type IExportRawInsightWidgetPayload,
    type IExportSlidesInsightWidget,
    type IExportSlidesInsightWidgetPayload,
    type IExportImageInsightWidget,
    type IExportImageInsightWidgetPayload,
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
} from "./model/commands/insight.js";
export { type ILoadAllWorkspaceUsers, loadAllWorkspaceUsers } from "./model/commands/users.js";
export {
    type IChangeRichTextWidgetContent,
    type IChangeRichTextWidgetContentPayload,
    type IChangeRichTextWidgetFilterSettings,
    type IChangeRichTextWidgetFilterSettingsPayload,
    changeRichTextWidgetContent,
    enableRichTextWidgetDateFilter,
    disableRichTextWidgetDateFilter,
    ignoreDateFilterOnRichTextWidget,
    unignoreDateFilterOnRichTextWidget,
    ignoreFilterOnRichTextWidget,
    unignoreFilterOnRichTextWidget,
} from "./model/commands/richText.js";
export {
    type IAddVisualizationToVisualizationSwitcherWidgetContent,
    type IAddVisualizationToVisualizationSwitcherWidgetContentPayload,
    type IUpdateVisualizationsFromVisualizationSwitcherWidgetContent,
    type IUpdateVisualizationsFromVisualizationSwitcherWidgetContentPayload,
    addVisualizationToSwitcherWidgetContent,
    updateVisualizationsFromSwitcherWidgetContent,
} from "./model/commands/visualizationSwitcher.js";
export {
    type RequestAsyncRender,
    type RequestAsyncRenderPayload,
    type ResolveAsyncRender,
    type ResolveAsyncRenderPayload,
    requestAsyncRender,
    resolveAsyncRender,
} from "./model/commands/render.js";
export {
    type IChangeRenderMode,
    type IChangeRenderModePayload,
    type IRenderModeChangeOptions,
    changeRenderMode,
    cancelEditRenderMode,
    switchToEditRenderMode,
} from "./model/commands/renderMode.js";
export {
    type IAddDrillTargets,
    type IAddDrillTargetsPayload,
    addDrillTargets,
} from "./model/commands/drillTargets.js";
export {
    type ISetShowWidgetAsTable,
    type ISetShowWidgetAsTablePayload,
    setShowWidgetAsTable,
} from "./model/commands/showWidgetAsTable.js";
export {
    type ISwitchDashboardTab,
    type ISwitchDashboardTabPayload,
    type IConvertDashboardTabFromDefault,
    type IConvertDashboardTabFromDefaultPayload,
    type ICreateDashboardTab,
    type ICreateDashboardTabPayload,
    type IRepositionDashboardTab,
    type IRepositionDashboardTabPayload,
    type IDeleteDashboardTab,
    type IDeleteDashboardTabPayload,
    type IStartRenamingDashboardTab,
    type IStartRenamingDashboardTabPayload,
    type ICancelRenamingDashboardTab,
    type ICancelRenamingDashboardTabPayload,
    type IRenameDashboardTab,
    type IRenameDashboardTabPayload,
    switchDashboardTab,
    repositionDashboardTab,
    convertDashboardTabFromDefault,
    createDashboardTab,
    deleteDashboardTab,
    startRenamingDashboardTab,
    cancelRenamingDashboardTab,
    renameDashboardTab,
} from "./model/commands/tabs.js";

// Re-export from events
export {
    type IDashboardEvent,
    type DashboardEventType,
    type ICustomDashboardEvent,
    type DashboardEventBody,
    isDashboardEvent,
    isCustomDashboardEvent,
    isDashboardEventOrCustomDashboardEvent,
} from "./model/events/base.js";
export {
    type DateFilterValidationFailed,
    type DateFilterValidationFailedPayload,
    type DashboardInitialized,
    type DashboardInitializedPayload,
    type DashboardDeinitialized,
    type DashboardDeinitializedPayload,
    type DashboardSaved,
    type DashboardSavedPayload,
    type DashboardCopySaved,
    type DashboardCopySavedPayload,
    type IDashboardRenamed,
    type IDashboardRenamedPayload,
    type IDashboardWasReset,
    type IDashboardWasResetPayload,
    type IDashboardDeleted,
    type IDashboardDeletedPayload,
    type IDashboardExportToPdfRequested,
    type IDashboardExportToPdfResolved,
    type IDashboardExportToPdfResolvedPayload,
    type DashboardSharingChanged,
    type DashboardSharingChangedPayload,
    type IDashboardExportToExcelRequested,
    type IDashboardExportToExcelResolved,
    type IDashboardExportToPdfPresentationRequested,
    type IDashboardExportToPdfPresentationResolved,
    type IDashboardExportToPptPresentationRequested,
    type IDashboardExportToPptPresentationResolved,
    type IDashboardExportToExcelResolvedPayload,
    type IDashboardExportToPdfPresentationResolvedPayload,
    type IDashboardExportToPptPresentationResolvedPayload,
    type IDashboardIgnoreExecutionTimestampChanged,
    type IDashboardIgnoreExecutionTimestampChangedPayload,
    type IDashboardExportToImageRequested,
    type IDashboardExportToImageResolved,
    type IDashboardExportToImageResolvedPayload,
    isDashboardSaved,
    isDashboardCopySaved,
    isDashboardInitialized,
    isDashboardDeinitialized,
    isDashboardRenamed,
    isDashboardWasReset,
    isDashboardDeleted,
    isDateFilterValidationFailed,
    isDashboardExportToPdfRequested,
    isDashboardExportToPdfResolved,
    isDashboardSharingChanged,
    isDashboardExportToExcelRequested,
    isDashboardExportToExcelResolved,
    isDashboardExportToPdfPresentationRequested,
    isDashboardExportToPdfPresentationResolved,
    isDashboardExportToPptPresentationResolved,
    isDashboardExportToPptPresentationRequested,
    isDashboardExportToImageRequested,
    isDashboardExportToImageResolved,
    isDashboardIgnoreExecutionTimestampChanged,
} from "./model/events/dashboard.js";
export {
    type IDashboardTabSwitched,
    type IDashboardTabSwitchedPayload,
    type IDashboardTabCreated,
    type IDashboardTabCreatedPayload,
    type IDashboardTabConvertedFromDefault,
    type IDashboardTabConvertedFromDefaultPayload,
    type IDashboardTabDeleted,
    type IDashboardTabDeletedPayload,
    type IDashboardTabRenamingStarted,
    type IDashboardTabRenamingStartedPayload,
    type IDashboardTabRenamingCanceled,
    type IDashboardTabRenamingCanceledPayload,
    type IDashboardTabRenamed,
    type IDashboardTabRenamedPayload,
    dashboardTabSwitched,
    isDashboardTabSwitched,
    dashboardTabCreated,
    isDashboardTabCreated,
    dashboardTabConvertedFromDefault,
    isDashboardTabConvertedFromDefault,
    dashboardTabDeleted,
    isDashboardTabDeleted,
    dashboardTabRenamingStarted,
    isDashboardTabRenamingStarted,
    dashboardTabRenamingCanceled,
    isDashboardTabRenamingCanceled,
    dashboardTabRenamed,
    isDashboardTabRenamed,
} from "./model/events/tabs.js";
export {
    type IDashboardCommandStarted,
    type IDashboardCommandStartedPayload,
    type IDashboardCommandRejected,
    type IDashboardCommandFailed,
    type IDashboardCommandFailedPayload,
    type ActionFailedErrorReason,
    type IDashboardQueryRejected,
    type IDashboardQueryFailed,
    type IDashboardQueryFailedPayload,
    type IDashboardQueryStarted,
    type IDashboardQueryStartedPayload,
    type IDashboardQueryCompleted,
    type IDashboardQueryCompletedPayload,
    isDashboardCommandStarted,
    isDashboardCommandFailed,
    isDashboardQueryFailed,
    isDashboardCommandRejected,
    isDashboardQueryCompleted,
    isDashboardQueryRejected,
    isDashboardQueryStarted,
} from "./model/events/general.js";
export {
    type DashboardDateFilterSelectionChanged,
    type DashboardDateFilterSelectionChangedPayload,
    type DashboardAttributeFilterSelectionChangedPayload,
    type DashboardFilterContextChanged,
    type DashboardFilterContextChangedPayload,
    type IDashboardAttributeFilterParentChanged,
    type IDashboardAttributeFilterParentChangedPayload,
    type IDashboardAttributeFilterRemoved,
    type IDashboardAttributeFilterRemovedPayload,
    type DashboardAttributeFilterSelectionChanged,
    type IDashboardAttributeTitleChanged,
    type IDashboardAttributeTitleChangedPayload,
    type IDashboardAttributeSelectionModeChanged,
    type IDashboardAttributeSelectionModeChangedPayload,
    type IDashboardAttributeFilterMoved,
    type IDashboardAttributeFilterMovedPayload,
    type IDashboardAttributeFilterAdded,
    type IDashboardAttributeFilterAddedPayload,
    type IDashboardAttributeFilterConfigModeChanged,
    type IDashboardAttributeFilterConfigModeChangedPayload,
    type IDashboardAttributeFilterConfigLimitingItemsChanged,
    type IDashboardAttributeFilterConfigLimitingItemsChangedPayload,
    type IDashboardFilterViewCreationSucceeded,
    type IDashboardFilterViewCreationSucceededPayload,
    type IDashboardFilterViewCreationFailed,
    type IDashboardFilterViewDeletionSucceeded,
    type IDashboardFilterViewDeletionSucceededPayload,
    type IDashboardFilterViewDeletionFailed,
    type IDashboardFilterViewApplicationSucceeded,
    type IDashboardFilterViewApplicationSucceededPayload,
    type IDashboardFilterViewApplicationFailed,
    type IDashboardFilterViewDefaultStatusChangeSucceeded,
    type IDashboardFilterViewDefaultStatusChangeSucceededPayload,
    type IDashboardFilterViewDefaultStatusChangeFailed,
    type IDashboardFilterViewDefaultStatusChangeFailedPayload,
    type IDashboardFilterContextSelectionReset,
    isDashboardAttributeFilterAdded,
    isDashboardAttributeFilterMoved,
    isDashboardAttributeFilterParentChanged,
    isDashboardAttributeFilterRemoved,
    isDashboardAttributeFilterSelectionChanged,
    isDashboardAttributeFilterSelectionModeChanged,
    isDashboardAttributeFilterTitleChanged,
    isDashboardDateFilterSelectionChanged,
    isDashboardFilterContextChanged,
    isDashboardAttributeFilterConfigModeChanged,
    isDashboardAttributeFilterConfigLimitingItemsChanged,
    isDashboardFilterViewCreationSucceeded,
    isDashboardFilterViewCreationFailed,
    isDashboardFilterViewDeletionSucceeded,
    isDashboardFilterViewDeletionFailed,
    isDashboardFilterViewApplicationSucceeded,
    isDashboardFilterViewApplicationFailed,
    isDashboardFilterViewDefaultStatusChangeSucceeded,
    isDashboardFilterViewDefaultStatusChangeFailed,
    isDashboardFilterContextSelectionReset,
    filterContextSelectionReset,
} from "./model/events/filters.js";
export {
    type IDashboardLayoutSectionAdded,
    type IDashboardLayoutSectionAddedPayload,
    type IDashboardLayoutSectionMoved,
    type IDashboardLayoutSectionMovedPayload,
    type IDashboardLayoutSectionRemoved,
    type IDashboardLayoutSectionRemovedPayload,
    type IDashboardLayoutSectionHeaderChanged,
    type IDashboardLayoutSectionHeaderChangedPayload,
    type IDashboardLayoutSectionItemsAdded,
    type IDashboardLayoutSectionItemsAddedPayload,
    type IDashboardLayoutSectionItemReplaced,
    type IDashboardLayoutSectionItemReplacedPayload,
    type IDashboardLayoutSectionItemMoved,
    type IDashboardLayoutSectionItemMovedPayload,
    type IDashboardLayoutSectionItemRemoved,
    type IDashboardLayoutSectionItemRemovedPayload,
    type IDashboardLayoutSectionItemMovedToNewSection,
    type IDashboardLayoutSectionItemMovedToNewSectionPayload,
    type IDashboardLayoutChanged,
    type IDashboardLayoutChangedPayload,
    type ILayoutSectionHeadersToggled,
    type ILayoutSectionHeadersToggledPayload,
    type IScreenSizeChanged,
    type IScreenSizeChangedPayload,
    type ILayoutDirectionChanged,
    type ILayoutDirectionChangedPayload,
    isDashboardLayoutChanged,
    isDashboardLayoutSectionAdded,
    isDashboardLayoutSectionHeaderChanged,
    isDashboardLayoutSectionItemMoved,
    isDashboardLayoutSectionItemMovedToNewSection,
    isDashboardLayoutSectionItemRemoved,
    isDashboardLayoutSectionItemReplaced,
    isDashboardLayoutSectionItemsAdded,
    isDashboardLayoutSectionMoved,
    isDashboardLayoutSectionRemoved,
    isScreenSizeChanged,
    isLayoutSectionHeadersToggled,
    isLayoutDirectionChanged,
} from "./model/events/layout.js";
export {
    type IDashboardKpiWidgetHeaderChanged,
    type IDashboardKpiWidgetHeaderChangedPayload,
    type IDashboardKpiWidgetDescriptionChanged,
    type IDashboardKpiWidgetDescriptionChangedPayload,
    type IDashboardKpiWidgetConfigurationChanged,
    type IDashboardKpiWidgetConfigurationChangedPayload,
    type IDashboardKpiWidgetMeasureChanged,
    type IDashboardKpiWidgetMeasureChangedPayload,
    type IDashboardKpiWidgetFilterSettingsChanged,
    type IDashboardKpiWidgetFilterSettingsChangedPayload,
    type IDashboardKpiWidgetComparisonChanged,
    type IDashboardKpiWidgetComparisonChangedPayload,
    type IDashboardKpiWidgetDrillRemoved,
    type IDashboardKpiWidgetDrillRemovedPayload,
    type IDashboardKpiWidgetDrillSet,
    type IDashboardKpiWidgetDrillSetPayload,
    type IDashboardKpiWidgetChanged,
    type IDashboardKpiWidgetChangedPayload,
    isDashboardKpiWidgetChanged,
    isDashboardKpiWidgetComparisonChanged,
    isDashboardKpiWidgetFilterSettingsChanged,
    isDashboardKpiWidgetHeaderChanged,
    isDashboardKpiWidgetDescriptionChanged,
    isDashboardKpiWidgetConfigurationChanged,
    isDashboardKpiWidgetMeasureChanged,
    isDashboardKpiWidgetDrillRemoved,
    isDashboardKpiWidgetDrillSet,
} from "./model/events/kpi.js";
export {
    type IDashboardInsightWidgetHeaderChanged,
    type IDashboardInsightWidgetHeaderChangedPayload,
    type IDashboardInsightWidgetDescriptionChanged,
    type IDashboardInsightWidgetDescriptionChangedPayload,
    type IDashboardInsightWidgetFilterSettingsChanged,
    type IDashboardInsightWidgetFilterSettingsChangedPayload,
    type IDashboardInsightWidgetVisPropertiesChanged,
    type IDashboardInsightWidgetVisPropertiesChangedPayload,
    type IDashboardInsightWidgetVisConfigurationChanged,
    type IDashboardInsightWidgetVisConfigurationChangedPayload,
    type IDashboardInsightWidgetInsightSwitched,
    type IDashboardInsightWidgetInsightSwitchedPayload,
    type IDashboardInsightWidgetDrillsModified,
    type IDashboardInsightWidgetDrillsModifiedPayload,
    type IDashboardInsightWidgetDrillsRemoved,
    type IDashboardInsightWidgetDrillsRemovedPayload,
    type IDashboardInsightWidgetChanged,
    type IDashboardInsightWidgetChangedPayload,
    type IDashboardInsightWidgetExportRequested,
    type IDashboardInsightWidgetExportRequestedPayload,
    type IDashboardInsightWidgetExportResolved,
    type IDashboardInsightWidgetExportResolvedPayload,
    type IDashboardInsightWidgetRefreshed,
    type IDashboardInsightWidgetRefreshedPayload,
    isDashboardInsightWidgetChanged,
    isDashboardInsightWidgetDrillsModified,
    isDashboardInsightWidgetDrillsRemoved,
    isDashboardInsightWidgetFilterSettingsChanged,
    isDashboardInsightWidgetHeaderChanged,
    isDashboardInsightWidgetDescriptionChanged,
    isDashboardInsightWidgetInsightSwitched,
    isDashboardInsightWidgetVisPropertiesChanged,
    isDashboardInsightWidgetVisConfigurationChanged,
    isDashboardInsightWidgetExportRequested,
    isDashboardInsightWidgetExportResolved,
    isDashboardInsightWidgetRefreshed,
} from "./model/events/insight.js";
export {
    type IDashboardRichTextWidgetContentChanged,
    type IDashboardRichTextWidgetContentChangedPayload,
    type IDashboardRichTextWidgetFilterSettingsChanged,
    type IDashboardRichTextWidgetFilterSettingsChangedPayload,
    isDashboardRichTextWidgetContentChanged,
    richTextWidgetContentChanged,
    isDashboardRichTextWidgetFilterSettingsChanged,
    richTextWidgetFilterSettingsChanged,
} from "./model/events/richText.js";
export {
    type IDashboardVisualizationSwitcherWidgetVisualizationAdded,
    type IDashboardVisualizationSwitcherWidgetVisualizationAddedPayload,
    type IDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    type IDashboardVisualizationSwitcherWidgetVisualizationsUpdatedPayload,
    isDashboardVisualizationSwitcherWidgetVisualizationAdded,
    visualizationSwitcherWidgetVisualizationAdded,
    isDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    visualizationSwitcherWidgetVisualizationsUpdated,
} from "./model/events/visualizationSwitcher.js";
export {
    type IDashboardWidgetExecutionStarted,
    type IDashboardWidgetExecutionStartedPayload,
    type IDashboardWidgetExecutionSucceeded,
    type IDashboardWidgetExecutionSucceededPayload,
    type IDashboardWidgetExecutionFailed,
    type IDashboardWidgetExecutionFailedPayload,
    isDashboardWidgetExecutionStarted,
    isDashboardWidgetExecutionSucceeded,
    isDashboardWidgetExecutionFailed,
} from "./model/events/widget.js";
export {
    type IDashboardAlertCreated,
    type IDashboardAlertCreatedPayload,
    type IDashboardAlertSaved,
    type IDashboardAlertSavedPayload,
    isDashboardAlertCreated,
    isDashboardAlertSaved,
} from "./model/events/alerts.js";
export {
    type IDashboardScheduledEmailCreated,
    type IDashboardScheduledEmailCreatedPayload,
    type IDashboardScheduledEmailSaved,
    type IDashboardAutomationsRefreshed,
    isDashboardScheduledEmailCreated,
    isDashboardScheduledEmailSaved,
    isDashboardAutomationsRefreshed,
} from "./model/events/scheduledEmail.js";
export {
    type IDashboardDrillRequested,
    type IDashboardDrillRequestedPayload,
    type IDashboardDrillResolved,
    type IDashboardDrillResolvedPayload,
    type IDashboardDrillDownRequested,
    type IDashboardDrillDownRequestedPayload,
    type IDashboardDrillDownResolved,
    type IDashboardDrillDownResolvedPayload,
    type IDashboardDrillToAttributeUrlRequested,
    type IDashboardDrillToAttributeUrlRequestedPayload,
    type IDashboardDrillToAttributeUrlResolved,
    type IDashboardDrillToAttributeUrlResolvedPayload,
    type IDashboardDrillToCustomUrlRequested,
    type IDashboardDrillToCustomUrlRequestedPayload,
    type IDashboardDrillToCustomUrlResolved,
    type IDashboardDrillToCustomUrlResolvedPayload,
    type IDashboardDrillToInsightRequested,
    type IDashboardDrillToInsightRequestedPayload,
    type IDashboardDrillToInsightResolved,
    type IDashboardDrillToInsightResolvedPayload,
    type IDashboardDrillToDashboardRequested,
    type IDashboardDrillToDashboardRequestedPayload,
    type IDashboardDrillToDashboardResolved,
    type IDashboardDrillToDashboardResolvedPayload,
    type IDashboardDrillToLegacyDashboardRequested,
    type IDashboardDrillToLegacyDashboardRequestedPayload,
    type IDashboardDrillToLegacyDashboardResolved,
    type IDashboardDrillToLegacyDashboardResolvedPayload,
    type IDashboardDrillableItemsChanged,
    type IDashboardDrillableItemsChangedPayload,
    type IDashboardCrossFilteringRequested,
    type IDashboardCrossFilteringRequestedPayload,
    type IDashboardCrossFilteringResolved,
    type IDashboardCrossFilteringResolvedPayload,
    type IDashboardKeyDriverAnalysisResolved,
    type IDashboardKeyDriverAnalysisResolvedPayload,
    type IDashboardKeyDriverAnalysisRequested,
    type IDashboardKeyDriverAnalysisRequestedPayload,
    type IDashboardKeyDriverCombinationItem,
    isDashboardDrillDownRequested,
    isDashboardDrillDownResolved,
    isDashboardDrillRequested,
    isDashboardDrillResolved,
    isDashboardDrillToAttributeUrlRequested,
    isDashboardDrillToAttributeUrlResolved,
    isDashboardDrillToCustomUrlRequested,
    isDashboardDrillToCustomUrlResolved,
    isDashboardDrillToDashboardRequested,
    isDashboardDrillToDashboardResolved,
    isDashboardDrillToInsightRequested,
    isDashboardDrillToInsightResolved,
    isDashboardDrillToLegacyDashboardRequested,
    isDashboardDrillToLegacyDashboardResolved,
    isDashboardDrillableItemsChanged,
    isDashboardCrossFilteringRequested,
    isDashboardCrossFilteringResolved,
    isDashboardKeyDriverAnalysisResolved,
    isDashboardKeyDriverAnalysisRequested,
} from "./model/events/drill.js";
export {
    type IDrillTargetsAdded,
    type IDrillTargetsAddedPayload,
    drillTargetsAdded,
    isDrillTargetsAdded,
} from "./model/events/drillTargets.js";
export {
    type IUserInteractionPayloadWithDataBase,
    type KpiAlertDialogOpenedPayload,
    type DescriptionTooltipOpenedFrom,
    type DescriptionTooltipOpenedType,
    type DescriptionTooltipOpenedData,
    type DescriptionTooltipOpenedPayload,
    type ShareDialogInteractionType,
    type ShareDialogInteractionData,
    type ShareDialogInteractionPayload,
    type AttributeFilterInteractionType,
    type AttributeHierarchiesInteractionType,
    type VisualizationSwitcherInteractionType,
    type NestedLayoutInteractionType,
    type AutomationInteractionType,
    type AutomationInteractionData,
    type AutomationInteractionPayload,
    type SavedFilterViewInteractionType,
    type ISavedFilterViewInteractionData,
    type SavedFilterViewInteractionPayload,
    type IBareUserInteractionPayload,
    type DateFilterInteractionType,
    type UserInteractionPayloadWithData,
    type UserInteractionPayload,
    type UserInteractionType,
    type BareUserInteractionType,
    type IDashboardUserInteractionTriggered,
    userInteractionTriggered,
    isDashboardUserInteractionTriggered,
} from "./model/events/userInteraction.js";

export {
    type IShowWidgetAsTableSet,
    type IShowWidgetAsTableSetPayload,
    isShowWidgetAsTableSet,
    showWidgetAsTableSet,
} from "./model/events/showWidgetAsTable.js";
export {
    type DashboardRenderRequested,
    type DashboardAsyncRenderRequestedPayload,
    type DashboardAsyncRenderRequested,
    type DashboardAsyncRenderResolved,
    type DashboardAsyncRenderResolvedPayload,
    type DashboardRenderResolved,
    isDashboardAsyncRenderRequested,
    isDashboardAsyncRenderResolved,
    isDashboardRenderRequested,
    isDashboardRenderResolved,
} from "./model/events/render.js";
export {
    type IDashboardRenderModeChanged,
    type IDashboardRenderModeChangedPayload,
    isDashboardRenderModeChanged,
} from "./model/events/renderMode.js";
export {
    type ICreateInsightRequested,
    createInsightRequested,
    isCreateInsightRequested,
} from "./model/events/lab.js";
export {
    type ICreateAttributeHierarchyRequested,
    type IDeleteAttributeHierarchyRequested,
    createAttributeHierarchyRequested,
    isCreateAttributeHierarchyRequested,
    deleteAttributeHierarchyRequested,
    isDeleteAttributeHierarchyRequested,
} from "./model/events/attributeHierarchies.js";
export { newDashboardEventPredicate, type DashboardEvents } from "./model/events/index.js";

export type { IDashboardQuery, DashboardQueryType } from "./model/queries/base.js";
export type { DashboardQueries } from "./model/queries/index.js";
export {
    type IQueryInsightDateDatasets,
    type IInsightDateDatasets,
    type IQueryInsightAttributesMeta,
    type IInsightAttributesMeta,
    queryDateDatasetsForInsight,
    queryInsightAttributesMeta,
    insightSelectDateDataset,
} from "./model/queries/insights.js";
export {
    type IQueryMeasureDateDatasets,
    type IMeasureDateDatasets,
    queryDateDatasetsForMeasure,
} from "./model/queries/kpis.js";
export {
    type IQueryWidgetFilters,
    type IQueryWidgetBrokenAlerts,
    type IQueryWidgetAlertCount,
    queryWidgetFilters,
    queryWidgetBrokenAlerts,
    queryWidgetAlertCount,
} from "./model/queries/widgets.js";
export {
    type IQueryConnectingAttributes,
    queryConnectingAttributes,
} from "./model/queries/connectingAttributes.js";
export {
    type IQueryConnectedAttributes,
    queryConnectedAttributes,
} from "./model/queries/connectedAttributes.js";
export {
    type IQueryAttributeByDisplayForm,
    queryAttributeByDisplayForm,
} from "./model/queries/attributes.js";
export { type IQueryAttributeDataSet, queryAttributeDataSet } from "./model/queries/attributeDataSet.js";
export { type IQueryAttributeElements, queryAttributeElements } from "./model/queries/attributeElements.js";
export {
    type IQueryMetricsAndFacts,
    type IMetricsAndFacts,
    queryMetricsAndFacts,
} from "./model/queries/metricsAndFacts.js";
export {
    type IQueryAvailableDatasetsForItems,
    queryAvailableDatasetsForItems,
} from "./model/queries/availableDatasetsForItems.js";

// Re-export from store
export type {
    DashboardDispatch,
    DashboardState,
    DashboardSelector,
    DashboardSelectorEvaluator,
} from "./model/store/types.js";
export { selectDashboardLoading, selectIsDashboardLoading } from "./model/store/loading/loadingSelectors.js";
export type { ILoadingState } from "./model/store/loading/loadingState.js";
export { selectDashboardSaving, selectIsDashboardSaving } from "./model/store/saving/savingSelectors.js";
export type { SavingState } from "./model/store/saving/savingState.js";
export type { BackendCapabilitiesState } from "./model/store/backendCapabilities/backendCapabilitiesState.js";
export {
    selectBackendCapabilities,
    selectSupportsElementsQueryParentFiltering,
    selectSupportsElementUris,
    selectSupportsKpiWidgetCapability,
    selectSupportsAccessControlCapability,
    selectSupportsHierarchicalWorkspacesCapability,
    selectSupportsObjectUris,
    selectSupportsSettingConnectingAttributes,
    selectSupportsKeepingDependentFiltersSelection,
    selectAllowMultipleInteractionsPerAttributeAndMeasure,
    selectSupportsAttributeHierarchies,
    selectSupportsSingleSelectDependentFilters,
    selectSupportsCrossFiltering,
    selectSupportsMultipleDateFilters,
    selectSupportsRichTextWidgets,
} from "./model/store/backendCapabilities/backendCapabilitiesSelectors.js";
export type { ConfigState } from "./model/store/config/configState.js";
export {
    selectConfig,
    selectLocale,
    selectSeparators,
    selectSettings,
    selectColorPalette,
    selectDateFilterConfig,
    selectObjectAvailabilityConfig,
    selectIsReadOnly,
    selectMapboxToken,
    selectAgGridToken,
    selectDateFormat,
    selectIsEmbedded,
    selectIsExport,
    selectPlatformEdition,
    selectDisableDefaultDrills,
    selectEnableFilterValuesResolutionInDrillEvents,
    selectEnableKPIDashboardExportPDF,
    selectDisableKpiDashboardHeadlineUnderline,
    selectIsWhiteLabeled,
    selectIsSaveAsNewButtonHidden,
    selectAllowUnfinishedFeatures,
    selectAllowCreateInsightRequest,
    selectIsKPIDashboardDependentFiltersEnabled,
    selectIsShareButtonHidden,
    selectWeekStart,
    selectTimezone,
    selectEnableUnavailableItemsVisibility,
    selectEnableKDDependentFilters,
    selectIsKDDependentFiltersEnabled,
    selectEnableKDCrossFiltering,
    selectEnableMultipleDateFilters,
    selectEnableKDRichText,
    selectEnableKDAttributeFilterDatesValidation,
    selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    selectEnableRichTextDescriptions,
    selectIsDisabledCrossFiltering,
    selectIsDisableUserFilterReset,
    selectEnableScheduling,
    selectEnableFilterViews,
    selectEnableCustomizedDashboardsWithoutPluginOverlay,
    selectEnableAlerting,
    selectEnableAlertAttributes,
    selectEnableComparisonInAlerting,
    selectEnableVisualizationSwitcher,
    selectEnableIgnoreCrossFiltering,
    selectEnableAutomations,
    selectEnableCrossFilteringAliasTitles,
    selectEnableInPlatformNotifications,
    selectEnableExternalRecipients,
    selectEnableDrilledTooltip,
    selectFocusObject,
    selectEnableDashboardDescriptionDynamicHeight,
    selectEnableSlideshowExports,
    selectEnableRichTextDynamicReferences,
    selectEnableRichTextWidgetFilterConfiguration,
    selectEnableDashboardSectionHeadersDateDataSet,
    selectDashboardFiltersApplyMode,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectEnableExecutionCancelling,
    selectEnableOrchestratedTabularExports,
    selectEnableDashboardTabularExport,
    selectEnableDashboardShareLink,
    selectEnableAutomationFilterContext,
    selectEnableAlertsEvaluationFrequencySetup,
    selectEnableDateFilterIdentifiers,
    selectEnableSnapshotExportAccessibility,
    selectEnableExportToDocumentStorage,
    selectExternalRecipient,
    selectEnableDashboardShareDialogLink,
    selectEnableNewScheduledExport,
    selectEnableAutomationManagement,
    selectEnableAutomationEvaluationMode,
    selectEnableExportToPdfTabular,
    selectEnableSnapshotExport,
    selectEnableAccessibilityMode,
    selectIsAddTabButtonHidden,
    selectExportResultPollingTimeout,
    selectEnableAnomalyDetectionAlert,
    selectEnableImplicitDrillToUrl,
    selectEnableFiscalCalendars,
    selectActiveCalendars,
    selectEnableDashboardFilterGroups,
} from "./model/store/config/configSelectors.js";
export type { IEntitlementsState } from "./model/store/entitlements/entitlementsState.js";
export {
    selectEntitlementMaxAutomationRecipients,
    selectEntitlementMaxAutomations,
    selectEntitlementMinimumRecurrenceMinutes,
    selectEntitlementUnlimitedAutomations,
} from "./model/store/entitlements/entitlementsSelectors.js";
export type { PermissionsState } from "./model/store/permissions/permissionsState.js";
export {
    selectPermissions,
    selectCanListUsersInWorkspace,
    selectCanManageWorkspace,
    selectCanExportReport,
    selectCanExportTabular,
    selectCanExportPdf,
    selectCanCreateAnalyticalDashboard,
    selectCanManageACL,
    selectCanManageAnalyticalDashboard,
    selectCanCreateScheduledMail,
    selectCanInitData,
    selectCanUploadNonProductionCSV,
    selectCanExecuteRaw,
    selectCanCreateVisualization,
    selectCanManageMetric,
    selectCanManageDomain,
    selectCanInviteUserToWorkspace,
    selectCanRefreshData,
    selectCanManageScheduledMail,
    selectCanManageAttributeHierarchy,
    selectCanCreateFilterView,
    selectCanCreateAutomation,
    selectCanUseAiAssistant,
} from "./model/store/permissions/permissionsSelectors.js";
export type { DashboardPermissionsState } from "./model/store/dashboardPermissions/dashboardPermissionsState.js";
export {
    selectCanViewDashboardPermission,
    selectCanShareDashboardPermission,
    selectCanShareLockedDashboardPermission,
    selectCanEditDashboardPermission,
    selectCanEditLockedDashboardPermission,
    selectDashboardPermissions,
} from "./model/store/dashboardPermissions/dashboardPermissionsSelectors.js";
export {
    selectFilterContextDefinition,
    selectFilterContextIdentity,
    selectFilterContextFilters,
    selectFiltersByTab,
    selectFilterContextDateFilter,
    selectFilterContextDateFiltersWithDimension,
    selectFilterContextAttributeFilters,
    selectWorkingFilterContextDefinition,
    selectWorkingFilterContextFilters,
    selectWorkingFilterContextAttributeFilters,
    selectWorkingFilterContextDateFilter,
    selectWorkingFilterContextDateFiltersWithDimension,
    selectIsWorkingFilterContextChanged,
    selectOtherContextAttributeFilters,
    selectAttributeFilterDisplayFormsMap,
    selectAttributeFilterDisplayForms,
    selectFilterContextAttributeFilterByLocalId,
    selectFilterContextAttributeFilterByDisplayForm,
    selectOriginalFilterContextDefinition,
    selectOriginalFilterContextFilters,
    selectOriginalFilterContextFiltersByTab,
    selectFiltersWithInvalidSelection,
    selectAttributeFilterDescendants,
    selectAttributeFilterDisplayFormByLocalId,
    selectIsCircularDependency,
    selectCanAddMoreAttributeFilters,
    selectCanAddMoreFilters,
    selectIsAttributeFilterDependentByLocalIdentifier,
    selectIsAttributeFilterDependentByLocalIdentifierForTab,
    selectFilterContextDateFilterByDataSet,
    selectPreloadedAttributesWithReferences,
    selectDefaultFilterOverrides,
    selectNamesOfFiltersWithInvalidSelection,
    selectFiltersForTab,
    selectFilterContextAttributeFiltersForTab,
    selectFilterContextAttributeFilterByDisplayFormForTab,
    selectFilterContextAttributeFilterByLocalIdForTab,
    selectFilterContextDateFiltersWithDimensionForTab,
    selectFilterContextDateFilterForTab,
    selectFilterContextDateFilterByDataSetForTab,
    selectWorkingFilterContextAttributeFiltersForTab,
    selectWorkingFilterContextDateFiltersWithDimensionForTab,
    selectWorkingFilterContextDateFilterForTab,
} from "./model/store/tabs/filterContext/filterContextSelectors.js";
export { getFilterIdentifier } from "./model/store/tabs/filterContext/filterContextUtils.js";
export {
    type IImplicitDrillWithPredicates,
    selectImplicitDrillsDownByWidgetRef,
    selectConfiguredDrillsByWidgetRef,
    selectDrillableItemsByWidgetRef,
    selectConfiguredAndImplicitDrillsByWidgetRef,
    selectValidConfiguredDrillsByWidgetRef,
    selectImplicitDrillsByAvailableDrillTargets,
    selectDrillableItemsByAvailableDrillTargets,
    selectImplicitDrillsToUrlByWidgetRef,
    selectDrillsToUrlAttributeByWidgetRef,
    selectGlobalDrillsDownAttributeHierarchyByWidgetRef,
} from "./model/store/widgetDrills/widgetDrillSelectors.js";
export {
    selectIsExportableToCSV,
    selectIsExportableToXLSX,
    selectIsExportableToPdfTabular,
    selectIsExportableToPngImage,
} from "./model/store/widgetExports/widgetExportsSelectors.js";
export {
    selectDeleteVisible,
    selectFilterViewsVisible,
    selectPdfExportVisible,
    selectSaveAsVisible,
    selectCommonExportAvailable,
    selectSlideShowExportAvailable,
    selectSlideShowExportVisible,
    selectCanEnterEditModeAndIsLoaded,
    selectIsShareGrantVisible,
    selectIsDashboardShareLinkVisible,
    selectIsShareButtonVisible,
    selectIsSaveAsNewButtonVisible,
    selectCanSaveDashboard,
    selectCanEnterEditMode,
    selectIsPrivateDashboard,
    selectIsCurrentDashboardVisibleInList,
    selectCrossFilteringEnabledAndSupported,
    selectSettingsVisible,
    selectIsAutomationDialogSecondaryTitleVisible,
} from "./model/store/topBar/topBarSelectors.js";
export type { IUndoEnhancedState, IUndoEntry, IUndoPayload } from "./model/store/_infra/undoEnhancer.js";
export {
    selectLayout,
    selectStash,
    selectScreen,
    selectWidgetByRef,
    selectAnalyticalWidgetByRef,
    selectFilterableWidgetByRef,
    selectWidgets,
    selectWidgetsMap,
    selectAllInsightWidgets,
    selectAllCustomWidgets,
    selectAllKpiWidgets,
    selectAllAnalyticalWidgets,
    selectIsLayoutEmpty,
    selectLayoutHasAnalyticalWidgets,
    selectWidgetDrills,
    selectWidgetPathByRef,
    selectWidgetCoordinatesByRef,
    selectWidgetPlaceholder,
    selectWidgetPlaceholderPath,
    selectWidgetPlaceholderCoordinates,
    selectInsightWidgetPlaceholder,
    selectInsightWidgetPlaceholderPath,
    selectInsightWidgetPlaceholderCoordinates,
    selectKpiWidgetPlaceholder,
    selectKpiWidgetPlaceholderPath,
    selectKpiWidgetPlaceholderCoordinates,
    selectIgnoredDrillDownHierarchiesByWidgetRef,
    selectWidgetLocalIdToTabIdMap,
} from "./model/store/tabs/layout/layoutSelectors.js";
export type { IDateFilterConfigState } from "./model/store/tabs/dateFilterConfig/dateFilterConfigState.js";
export {
    selectDateFilterConfigOverrides,
    selectDateFilterConfigOverridesByTab,
    selectEffectiveDateFilterConfig,
    selectEffectiveDateFilterConfigForTab,
    selectEffectiveDateFilterTitle,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterOptionsForTab,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterAvailableGranularitiesForTab,
    selectDateFilterConfigValidationWarnings,
} from "./model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
export {
    selectAttributeFilterConfigsOverrides,
    selectAttributeFilterConfigsOverridesByTab,
    selectAttributeFilterConfigsModeMap,
    selectEffectiveAttributeFiltersModeMap,
    selectAttributeFilterConfigsDisplayAsLabelMap,
    selectAttributeFilterConfigsModeMapByTab,
} from "./model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
export type { IDateFilterConfigsState } from "./model/store/tabs/dateFilterConfigs/dateFilterConfigsState.js";
export type { IAttributeFilterConfigsState } from "./model/store/tabs/attributeFilterConfigs/attrtibuteFilterConfigsState.js";
export type { ILayoutState, LayoutStash } from "./model/store/tabs/layout/layoutState.js";
export type { TabsReducer } from "./model/store/tabs/tabsReducers.js";
export type { IdentityMapping } from "./_staging/dashboard/dashboardLayout.js";
export type {
    IAddAttributeFilterPayload,
    IRemoveAttributeFilterPayload,
    ISetAttributeFilterDependentDateFiltersPayload,
    ISetAttributeFilterParentsPayload,
    IMoveAttributeFilterPayload,
    IRemoveDateFilterPayload,
    IMoveDateFilterPayload,
    IUpdateAttributeFilterSelectionPayload,
    IClearAttributeFiltersSelectionPayload,
    IUpsertDateFilterPayload,
    IUpsertDateFilterAllTimePayload,
    IUpsertDateFilterNonAllTimePayload,
    IChangeAttributeDisplayFormPayload,
    IChangeAttributeTitlePayload,
    IChangeAttributeSelectionModePayload,
    IChangeAttributeLimitingItemsPayload,
    IApplyWorkingSelectionPayload,
    IAddAttributeFilterDisplayFormPayload,
} from "./model/store/tabs/filterContext/filterContextReducers.js";
export {
    selectTabs,
    selectActiveTabLocalIdentifier,
    selectActiveTab,
    selectTabById,
    selectHasTabs,
} from "./model/store/tabs/tabsSelectors.js";
export { tabsActions } from "./model/store/tabs/index.js";
export { type ITabState, DEFAULT_TAB_ID, type ITabsState } from "./model/store/tabs/tabsState.js";
export type {
    FilterContextState,
    WorkingDashboardAttributeFilter,
    WorkingFilterContextItem,
    IWorkingFilterContextDefinition,
} from "./model/store/tabs/filterContext/filterContextState.js";
export { selectFilterGroupsConfig } from "./model/store/tabs/filterGroups/filterGroupsSelectors.js";
export {
    selectDateFilterConfigsOverrides,
    selectDateFilterConfigsOverridesByTab,
    selectDateFilterConfigsModeMap,
    selectEffectiveDateFiltersModeMap,
    selectDateFilterConfigsModeMapByTab,
} from "./model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
export {
    selectInsights,
    selectInsightRefs,
    selectInsightsMap,
    selectInsightByRef,
    selectInsightByWidgetRef,
    selectRawExportOverridesForInsightByRef,
} from "./model/store/insights/insightsSelectors.js";
export type { CatalogState } from "./model/store/catalog/catalogState.js";
export {
    selectCatalogIsLoaded,
    selectAttributesWithDrillDown,
    selectCatalogAttributes,
    selectCatalogAttributeDisplayForms,
    selectCatalogDateDatasets,
    selectCatalogFacts,
    selectCatalogMeasures,
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
    selectAllCatalogDateDatasetsMap,
    selectAllCatalogMeasuresMap,
    selectHasCatalogAttributes,
    selectHasCatalogMeasures,
    selectHasCatalogDateDatasets,
    selectHasCatalogFacts,
    selectCatalogAttributeHierarchies,
    selectCatalogDateAttributes,
    selectDateHierarchyTemplates,
    selectAdhocDateHierarchies,
    selectAllCatalogAttributeHierarchies,
    selectCatalogAttributeDisplayFormsById,
} from "./model/store/catalog/catalogSelectors.js";
export { catalogActions } from "./model/store/catalog/index.js";
export type {
    SetCatalogMeasuresAndFactsPayload,
    SetCatalogItemsPayload,
} from "./model/store/catalog/catalogReducers.js";
export { drillActions } from "./model/store/drill/index.js";
export {
    selectDrillableItems,
    selectIsCrossFiltering,
    selectCrossFilteringItems,
    selectCrossFilteringItemByWidgetRef,
    selectCrossFilteringFiltersLocalIdentifiers,
    selectCrossFilteringFiltersLocalIdentifiersByWidgetRef,
    selectCrossFilteringSelectedPointsByWidgetRef,
    selectIsFilterFromCrossFilteringByLocalIdentifier,
} from "./model/store/drill/drillSelectors.js";
export type { IDrillState } from "./model/store/drill/drillState.js";
export type { ICrossFilteringItem } from "./model/store/drill/types.js";
export type { UserState } from "./model/store/user/userState.js";
export { selectCurrentUser, selectCurrentUserRef } from "./model/store/user/userSelectors.js";
export type { IDashboardMetaState, DashboardDescriptor } from "./model/store/meta/metaState.js";
export {
    selectDashboardRef,
    selectDashboardUriRef,
    selectDashboardTitle,
    selectDashboardDescription,
    selectDashboardIdRef,
    selectDashboardTags,
    selectDashboardUri,
    selectDashboardId,
    selectDashboardShareStatus,
    selectDashboardShareInfo,
    selectPersistedDashboard,
    selectDashboardLockStatus,
    selectIsNewDashboard,
    selectIsNewDashboardWithContent,
    selectIsDashboardDirty,
    selectIsDashboardPrivate,
    selectDashboardWorkingDefinition,
    selectDisableDashboardCrossFiltering,
    selectDisableDashboardUserFilterReset,
    selectDisableDashboardUserFilterSave,
    selectDisableFilterViews,
    selectDashboardDescriptor,
    selectEvaluationFrequency,
    selectPersistedDashboardFilterContextDateFilterConfig,
    selectSectionHeadersDateDataSet,
} from "./model/store/meta/metaSelectors.js";
export { metaActions } from "./model/store/meta/index.js";
export {
    selectListedDashboards,
    selectListedDashboardsMap,
} from "./model/store/listedDashboards/listedDashboardsSelectors.js";
export {
    selectAccessibleDashboards,
    selectAccessibleDashboardsLoaded,
    selectAccessibleDashboardsMap,
} from "./model/store/accessibleDashboards/accessibleDashboardsSelectors.js";
export {
    selectInaccessibleDashboards,
    selectInaccessibleDashboardsMap,
} from "./model/store/inaccessibleDashboards/inaccessibleDashboardsSelectors.js";
export {
    selectDrillTargetsByWidgetRef,
    selectDrillTargets,
} from "./model/store/drillTargets/drillTargetsSelectors.js";
export type { IDrillTargets } from "./model/store/drillTargets/drillTargetsTypes.js";
export {
    selectExecutionResult,
    selectExecutionResultByRef,
    selectIsExecutionResultExportableToCsvByRef,
    selectIsExecutionResultExportableToXlsxByRef,
    selectIsExecutionResultExportableToPdfByRef,
    selectIsExecutionResultReadyForExportByRef,
    selectHasSomeExecutionResult,
    selectIsExecutionResultExportableToCsvRawByRef,
} from "./model/store/executionResults/executionResultsSelectors.js";
export type { IExecutionResultEnvelope } from "./model/store/executionResults/types.js";
export type {
    IUiState,
    IInvalidCustomUrlDrillParameterInfo,
    FilterViewDialogMode,
} from "./model/store/ui/uiState.js";
export {
    selectIsScheduleEmailDialogOpen,
    selectIsScheduleEmailManagementDialogOpen,
    selectIsScheduleEmailDialogContext,
    selectIsScheduleEmailManagementDialogContext,
    selectIsAlertingManagementDialogContext,
    selectIsSaveAsDialogOpen,
    selectIsShareDialogOpen,
    selectFilterBarExpanded,
    selectIsKpiAlertOpenedByWidgetRef,
    selectIsKpiAlertHighlightedByWidgetRef,
    selectMenuButtonItemsVisibility,
    selectScheduleEmailDialogReturnFocusTo,
    selectAlertingDialogReturnFocusTo,
    selectScheduleEmailDialogDefaultAttachment,
    selectSelectedWidgetRef,
    selectConfigurationPanelOpened,
    selectWidgetDateDatasetAutoSelect,
    selectIsDeleteDialogOpen,
    selectIsKpiDeleteDialogOpen,
    selectKpiDeleteDialogWidgetLayoutPath,
    selectKpiDeleteDialogWidgetCoordinates,
    selectInsightListLastUpdateRequested,
    selectIsWidgetLoadingAdditionalDataByWidgetRef,
    selectIsFilterAttributeSelectionOpen,
    selectSelectedFilterIndex,
    selectIsDraggingWidget,
    selectActiveSection,
    selectActiveSectionIndex,
    selectIsCancelEditModeDialogOpen,
    selectDraggingWidgetSource,
    selectDraggingWidgetTargetLayoutPath,
    selectDraggingWidgetTriggeringDropZoneType,
    selectDraggingWidgetTarget,
    selectWidgetsOverlay,
    selectWidgetsOverlayState,
    selectWidgetsModification,
    selectSectionModification,
    selectIsSectionInsertedByPlugin,
    selectInvalidDrillWidgetRefs,
    selectInvalidUrlDrillParameterDrillLocalIdsByWidgetRef,
    selectInvalidUrlDrillParameterWidgetRefs,
    selectInvalidUrlDrillParameterWidgetWarnings,
    selectFilterViewsDialogMode,
    selectIsFilterViewsDialogOpen,
    selectIsAlertingDialogOpen,
    selectIsAlertsManagementDialogOpen,
    selectIsWidgetDeleteDialogOpen,
    selectWidgetDeleteDialogWidgetRef,
    selectIgnoreExecutionTimestamp,
    selectExecutionTimestamp,
    selectIsSettingsDialogOpen,
    selectFilterValidationIncompatibleDefaultFiltersOverride,
    selectAutomationsInvalidationId,
} from "./model/store/ui/uiSelectors.js";
export { uiActions } from "./model/store/ui/index.js";
export type { IRenderModeState } from "./model/store/renderMode/renderModeState.js";
export {
    selectIsInEditMode,
    selectIsInExportMode,
    selectIsInViewMode,
    selectRenderMode,
} from "./model/store/renderMode/renderModeSelectors.js";
export { renderModeActions } from "./model/store/renderMode/index.js";
export { queryAndWaitFor } from "./model/store/_infra/queryAndWaitFor.js";
export { dispatchAndWaitFor } from "./model/store/_infra/dispatchAndWaitFor.js";
export type {
    IDashboardQueryService,
    QueryCache,
    QueryActions,
    QueryCacheEntry,
    QueryCacheEntryResult,
    AllQueryCacheReducers,
    QueryCacheReducer,
} from "./model/store/_infra/queryService.js";
export { DashboardStoreAccessor } from "./model/store/storeAccessors/DashboardStoreAccessor.js";
export { DashboardStoreAccessorRepository } from "./model/store/storeAccessors/DashboardStoreAccessorRepository.js";
export { SingleDashboardStoreAccessor } from "./model/store/storeAccessors/SingleDashboardStoreAccessor.js";
export type {
    DashboardSummaryWorkflowState,
    DashboardSummaryWorkflowInfo,
} from "./model/store/dashboardSummaryWorkflow/dashboardSummaryWorkflowState.js";
export {
    selectNotificationChannels,
    selectNotificationChannelsCount,
    selectNotificationChannelsWithoutInPlatform,
    selectNotificationChannelsCountWithoutInPlatform,
} from "./model/store/notificationChannels/notificationChannelsSelectors.js";
export type { INotificationChannelsState } from "./model/store/notificationChannels/notificationChannelsState.js";
export type { IAutomationsState } from "./model/store/automations/automationsState.js";
export {
    selectAutomationsIsInitialized,
    selectAllAutomationsCount,
    selectDashboardUserAutomations,
    selectDashboardUserAutomationAlerts,
    selectDashboardUserAutomationSchedules,
    selectDashboardUserAutomationAlertsInContext,
    selectDashboardUserAutomationSchedulesInContext,
    selectAutomationsIsLoading,
    selectAutomationsError,
} from "./model/store/automations/automationsSelectors.js";
export type { IUsersState } from "./model/store/users/usersState.js";
export {
    selectUsers,
    selectErrorUsers,
    selectUsersLoadingStatus,
} from "./model/store/users/usersSelectors.js";
export {
    keyDriverYearGranularity,
    keyDriverAnalysisSupportedGranularities,
    keyDriverAnalysisSupportedStringGranularities,
} from "./model/store/keyDriverAnalysis/const.js";
export {
    selectFilterViews,
    selectFilterViewsAreLoading,
} from "./model/store/filterViews/filterViewsReducersSelectors.js";
export type { IFilterViewsState, IFilterViews } from "./model/store/filterViews/filterViewsState.js";
export type { IExecutedState } from "./model/store/executed/executedState.js";
export { selectIsDashboardExecuted } from "./model/store/executed/executedSelectors.js";
export type { IAccessibleDashboardsState } from "./model/store/accessibleDashboards/index.js";
export type { IShowWidgetAsTableState } from "./model/store/showWidgetAsTable/showWidgetAsTableState.js";
export { selectShowWidgetAsTable } from "./model/store/showWidgetAsTable/showWidgetAsTableSelectors.js";

export {
    selectDateDatasetsForInsight,
    type selectDateDatasetsForInsightType,
} from "./model/queryServices/queryInsightDateDatasets.js";
export {
    selectInsightAttributesMeta,
    type selectInsightAttributesMetaType,
} from "./model/queryServices/queryInsightAttributesMeta.js";
export {
    selectDateDatasetsForMeasure,
    type selectDateDatasetsForMeasureType,
} from "./model/queryServices/queryMeasureDateDatasets.js";

export type { IRenderingWorkerConfiguration } from "./model/commandHandlers/render/types.js";
export {
    type DashboardEventHandler,
    type DashboardEventHandlerFn,
    type DashboardEventEvalFn,
    anyEventHandler,
    anyDashboardEventHandler,
    singleEventTypeHandler,
    commandStartedEventHandler,
    commandFailedEventHandler,
} from "./model/eventHandlers/eventHandler.js";
export { newDrillToSameDashboardHandler } from "./model/eventHandlers/drillToSameDashboardHandlerFactory.js";
export {
    type IHeadlessDashboardConfig,
    type IMonitoredAction,
    HeadlessDashboard,
} from "./model/headlessDashboard/HeadlessDashboard.js";

export { isTemporaryIdentity, getWidgetTitle } from "./model/utils/dashboardItemUtils.js";
export { existBlacklistHierarchyPredicate } from "./model/utils/attributeHierarchyUtils.js";
export { removeDateFilters, removeIgnoredWidgetFilters } from "./model/utils/widgetFilters.js";
export { getAuthor } from "./model/utils/author.js";

export type {
    ICustomComponentBase,
    IDraggingComponentProps,
    IDropTargetComponentProps,
    IAttributeFilterDraggingComponentProps,
    IDateFilterDraggingComponentProps,
    IInsightDraggingComponentProps,
    IKpiDraggingComponentProps,
    IRichTextDraggingComponentProps,
    IVisualizationSwitcherDraggingComponentProps,
    IDashboardLayoutDraggingComponentProps,
    ICustomDraggingComponentProps,
    AttributeFilterDraggingComponent,
    DateFilterDraggingComponent,
    InsightDraggingComponent,
    KpiDraggingComponent,
    RichTextDraggingComponent,
    VisualizationSwitcherDraggingComponent,
    DashboardLayoutDraggingComponent,
    CustomDraggingComponent,
    AttributeFilterDraggableComponent,
    DateFilterDraggableComponent,
    InsightDraggableComponent,
    KpiDraggableComponent,
    RichTextDraggableComponent,
    VisualizationSwitcherDraggableComponent,
    DashboardLayoutDraggableComponent,
    CustomDraggableComponent,
    DraggableComponent,
    DropTarget,
    ICreatePanelItemComponentProps,
    CustomCreatePanelItemComponent,
    CreatableByDragComponent,
    CreatablePlaceholderComponent,
    CustomWidgetConfigPanelComponent,
    IWidgetConfigPanelProps,
    ConfigurableWidget,
    AttributeFilterComponentSet,
    DateFilterComponentSet,
    InsightWidgetComponentSet,
    RichTextWidgetComponentSet,
    VisualizationSwitcherWidgetComponentSet,
    DashboardLayoutWidgetComponentSet,
    CustomWidgetComponentSet,
    InsightComponentSetProvider,
} from "./presentation/componentDefinition/types.js";
export { renderModeAware } from "./presentation/componentDefinition/renderModeAware.js";
export { Dashboard } from "./presentation/dashboard/Dashboard.js";
export { defaultDashboardThemeModifier } from "./presentation/dashboard/defaultDashboardThemeModifier.js";
export type {
    CustomSidebarComponent,
    ISidebarProps,
} from "./presentation/dashboard/DashboardSidebar/types.js";
export { SidebarConfigurationPanel } from "./presentation/dashboard/DashboardSidebar/SidebarConfigurationPanel.js";
export { DefaultDashboardMainContent } from "./presentation/dashboard/DefaultDashboardContent/DefaultDashboardMainContent.js";
export {
    type IDashboardCustomComponentProps,
    type IDashboardCustomizationProps,
    type IDashboardWidgetsOverlayProps,
    type IDashboardThemingProps,
    type IDashboardEventing,
    DashboardPartId,
    type IKeyboardNavigationConfigItem,
    type KeyboardNavigationConfig,
    type IDashboardBaseProps,
    type IDashboardExtensionProps,
    type IDashboardProps,
} from "./presentation/dashboard/types.js";
// only export the types for this, not the actual code
export type {
    OptionalProvider,
    WidgetComponentProvider,
    OptionalWidgetComponentProvider,
    InsightComponentProvider,
    OptionalInsightComponentProvider,
    InsightBodyComponentProvider,
    OptionalInsightBodyComponentProvider,
    InsightMenuButtonComponentProvider,
    OptionalInsightMenuButtonComponentProvider,
    InsightMenuComponentProvider,
    OptionalInsightMenuComponentProvider,
    RichTextMenuComponentProvider,
    OptionalRichTextMenuComponentProvider,
    InsightMenuTitleComponentProvider,
    OptionalInsightMenuTitleComponentProvider,
    InsightMenuItemsProvider,
    RichTextMenuItemsProvider,
    RichTextComponentProvider,
    OptionalRichTextComponentProvider,
    ShowAsTableButtonComponentProvider,
    OptionalShowAsTableButtonComponentProvider,
    RichTextMenuTitleComponentProvider,
    OptionalRichTextMenuTitleComponentProvider,
    VisualizationSwitcherComponentProvider,
    DashboardLayoutComponentProvider,
    VisualizationSwitcherToolbarComponentProvider,
    OptionalVisualizationSwitcherToolbarComponentProvider,
    OptionalVisualizationSwitcherComponentProvider,
    OptionalDashboardLayoutComponentProvider,
    DateFilterComponentProvider,
    OptionalDateFilterComponentProvider,
    AttributeFilterComponentProvider,
    OptionalAttributeFilterComponentProvider,
    TopBarComponentProvider,
    OptionalTopBarComponentProvider,
    FilterBarComponentProvider,
    OptionalTitleComponentProvider,
    TitleComponentProvider,
    OptionalFilterBarComponentProvider,
    OptionalLayoutComponentProvider,
    LayoutComponentProvider,
    OptionalLoadingComponentProvider,
    LoadingComponentProvider,
    DashboardContentComponentProvider,
    OptionalDashboardContentComponentProvider,
    IDashboardContentBaseProps,
    CustomDashboardContentComponent,
    OptionalFilterGroupComponentProvider,
    FilterGroupComponentProvider,
} from "./presentation/dashboardContexts/types.js";
export { DefaultDashboardFilterGroup } from "./presentation/filterBar/filterBar/DefaultDashboardFilterGroup.js";
export type {
    IFilterBarFilterGroupItem,
    FilterBarItem,
    FilterBarFilterPlaceholder,
    FilterBarAttributeFilterIndexed,
    FilterBarDateFilterIndexed,
} from "./presentation/filterBar/filterBar/useFiltersWithAddedPlaceholder.js";
export {
    type DraggableContentItemType,
    type DraggableInternalItemType,
    isDraggableInternalItemType,
    type DraggableItemType,
    type AttributeFilterDraggableItem,
    isAttributeFilterDraggableItem,
    type DateFilterDraggableItem,
    isDateFilterDraggableItem,
    type BaseDraggableLayoutItemSize,
    type BaseDraggableLayoutItem,
    isBaseDraggableLayoutItem,
    type BaseDraggableMovingItem,
    isBaseDraggableMovingItem,
    type InsightDraggableItem,
    isInsightDraggableItem,
    type KpiDraggableItem,
    isKpiDraggableItem,
    type RichTextDraggableItem,
    isRichTextDraggableItem,
    type RichTextDraggableListItem,
    isRichTextDraggableListItem,
    type VisualizationSwitcherDraggableItem,
    isVisualizationSwitcherDraggableItem,
    type VisualizationSwitcherDraggableListItem,
    isVisualizationSwitcherDraggableListItem,
    type DashboardLayoutDraggableItem,
    isDashboardLayoutDraggableItem,
    type DashboardLayoutDraggableListItem,
    isDashboardLayoutDraggableListItem,
    type CustomWidgetDraggableItem,
    type AttributeFilterPlaceholderDraggableItem,
    isAttributeFilterPlaceholderDraggableItem,
    type KpiPlaceholderDraggableItem,
    isKpiPlaceholderDraggableItem,
    type InsightPlaceholderDraggableItem,
    isInsightPlaceholderDraggableItem,
    type InsightDraggableListItem,
    isInsightDraggableListItem,
    type CustomDraggableItem,
    type DraggableContentItem,
    type DraggableLayoutItem,
    type DraggableInternalItem,
    type DraggableItem,
    type DraggableItemTypeMapping,
    type DraggableItemComponentTypeMapping,
    type IHeightResizerDragItem,
    type IWidthResizerDragItem,
    type DraggableItemInternalTypeMapping,
    type CustomDashboardInsightListItemComponentProps,
    type CustomDashboardInsightListItemComponent,
    type IWrapCreatePanelItemWithDragProps,
    type IWrapCreatePanelItemWithDragInnerProps,
    type IWrapCreatePanelItemWithDragComponent,
    type IWrapInsightListItemWithDragProps,
    type IWrapInsightListItemWithDragComponent,
} from "./presentation/dragAndDrop/types.js";
export { useWidgetDragEndHandler } from "./presentation/dragAndDrop/draggableWidget/useWidgetDragEndHandler.js";
export {
    DraggableCreatePanelItem,
    type IDraggableCreatePanelItemProps,
} from "./presentation/dragAndDrop/DraggableCreatePanelItem.js";
export { type IUseDrillProps, useDrill } from "./presentation/drill/hooks/useDrill.js";
export { type IUseDrillDownProps, useDrillDown } from "./presentation/drill/hooks/useDrillDown.js";
export {
    type IUseDrillToInsightProps,
    useDrillToInsight,
} from "./presentation/drill/hooks/useDrillToInsight.js";
export {
    type IUseDrillToDashboardProps,
    useDrillToDashboard,
} from "./presentation/drill/hooks/useDrillToDashboard.js";
export {
    type IUseDrillToAttributeUrlProps,
    useDrillToAttributeUrl,
} from "./presentation/drill/hooks/useDrillToAttributeUrl.js";
export {
    type IUseDrillToCustomUrlProps,
    useDrillToCustomUrl,
} from "./presentation/drill/hooks/useDrillToCustomUrl.js";
export {
    type IUseDrillToLegacyDashboardProps,
    useDrillToLegacyDashboard,
} from "./presentation/drill/hooks/useDrillToLegacyDashboard.js";
export {
    type IWithDrillSelectProps,
    WithDrillSelect,
} from "./presentation/drill/DrillSelect/WithDrillSelect.js";
export type {
    OnWidgetDrill,
    OnDashboardDrill,
    IDrillStep,
    OnDrillDown,
    OnDrillToAttributeUrl,
    OnDrillToCustomUrl,
    OnDrillToDashboard,
    OnDrillToInsight,
    OnDashboardDrillError,
    OnDashboardDrillSuccess,
    OnDrillDownSuccess,
    OnDrillToAttributeUrlSuccess,
    OnDrillToCustomUrlSuccess,
    OnDrillToDashboardSuccess,
    OnDrillToInsightSuccess,
    OnDrillToLegacyDashboard,
    OnDrillToLegacyDashboardSuccess,
    OnKeyDriverAnalysis,
    OnKeyDriverAnalysisError,
    OnKeyDriverAnalysisSuccess,
    IKeyDriveInfo,
    IDrillToUrl,
} from "./presentation/drill/types.js";
export { getDrillDownTitle } from "./presentation/drill/utils/drillDownUtils.js";
export {
    getKdaKeyDriverCombinations,
    getKeyDriverCombinationItemTitle,
} from "./presentation/drill/utils/kdaUtils.js";
export { DefaultDashboardAttributeFilter } from "./presentation/filterBar/attributeFilter/DefaultDashboardAttributeFilter.js";
export { HiddenDashboardAttributeFilter } from "./presentation/filterBar/attributeFilter/HiddenDashboardAttributeFilter.js";
export { CreatableAttributeFilter } from "./presentation/filterBar/attributeFilter/CreatableAttributeFilter.js";
export { DefaultDashboardAttributeFilterComponentSetFactory } from "./presentation/filterBar/attributeFilter/DefaultDashboardAttributeFilterComponentSetFactory.js";
export {
    type IAddAttributeFilterButtonProps,
    AddAttributeFilterButton,
} from "./presentation/filterBar/attributeFilter/addAttributeFilter/AddAttributeFilterButton.js";
export {
    type IAddAttributeFilterPlaceholderProps,
    AddAttributeFilterPlaceholder,
} from "./presentation/filterBar/attributeFilter/addAttributeFilter/AddAttributeFilterPlaceholder.js";
export { AttributesDropdown } from "./presentation/filterBar/attributeFilter/addAttributeFilter/AttributesDropdown.js";
export type {
    IDashboardAttributeFilterProps,
    CustomDashboardAttributeFilterComponent,
    CustomDashboardFilterGroupComponent,
    IDashboardAttributeFilterAccessibilityConfig,
    IDashboardAttributeFilterPlaceholderProps,
    IDashboardFilterGroupProps,
    ValuesLimitingItem,
} from "./presentation/filterBar/attributeFilter/types.js";
export {
    type UseParentFiltersResult,
    useParentFilters,
} from "./presentation/filterBar/attributeFilter/useParentFilters.js";
export { DefaultDashboardDateFilter } from "./presentation/filterBar/dateFilter/DefaultDashboardDateFilter.js";
export { HiddenDashboardDateFilter } from "./presentation/filterBar/dateFilter/HiddenDashboardDateFilter.js";
export { DefaultDashboardDateFilterComponentSetFactory } from "./presentation/filterBar/dateFilter/DefaultDashboardDateFilterComponentSetFactory.js";
export type {
    IDashboardDateFilterConfig,
    IDashboardDateFilterProps,
    CustomDashboardDateFilterComponent,
} from "./presentation/filterBar/dateFilter/types.js";
export { DefaultFilterBar, useFilterBarProps } from "./presentation/filterBar/filterBar/DefaultFilterBar.js";
export { FilterBar } from "./presentation/filterBar/filterBar/FilterBar.js";
export { HiddenFilterBar } from "./presentation/filterBar/filterBar/HiddenFilterBar.js";
export { RenderModeAwareFilterBar } from "./presentation/filterBar/filterBar/RenderModeAwareFilterBar.js";
export type { IFilterBarProps, CustomFilterBarComponent } from "./presentation/filterBar/filterBar/types.js";
export { DefaultFlexibleDashboardLayout } from "./presentation/flexibleLayout/DefaultFlexibleDashboardLayout.js";
export { DefaultDashboardLayout } from "./presentation/flexibleLayout/DefaultDashboardLayout.js";
export type { CustomEmptyLayoutDropZoneBodyComponent } from "./presentation/flexibleLayout/types.js";
export { DefaultScheduledEmailDialog } from "./presentation/scheduledEmail/DefaultScheduledEmailDialog/DefaultScheduledEmailDialog.js";
export { ScheduledEmailManagementDialog as DefaultScheduledEmailManagementDialog } from "./presentation/scheduledEmail/DefaultScheduledEmailManagementDialog/DefaultScheduledEmailManagementDialog.js";
export { ScheduledEmailDialog } from "./presentation/scheduledEmail/ScheduledEmailDialog.js";
export { ScheduledEmailManagementDialog } from "./presentation/scheduledEmail/ScheduledEmailManagementDialog.js";
export type {
    IScheduledEmailDialogPropsContext,
    IScheduledEmailDialogProps,
    IScheduledEmailManagementDialogProps,
    CustomScheduledEmailDialogComponent,
    CustomScheduledEmailManagementDialogComponent,
} from "./presentation/scheduledEmail/types.js";
export { DefaultAlertingDialogNew } from "./presentation/alerting/DefaultAlertingDialog/DefaultAlertingDialogNew.js";
export { DefaultAlertingDialogOld } from "./presentation/alerting/DefaultAlertingDialog/DefaultAlertingDialogOld.js";
export { DefaultAlertingManagementDialogOld } from "./presentation/alerting/DefaultAlertingManagementDialog/DefaultAlertingManagementDialogOld.js";
export { DefaultAlertingManagementDialogNew } from "./presentation/alerting/DefaultAlertingManagementDialog/DefaultAlertingManagementDialogNew.js";
export { AlertingDialog } from "./presentation/alerting/AlertingDialog.js";
export { AlertingManagementDialog } from "./presentation/alerting/AlertingManagementDialog.js";
export type {
    CustomAlertingManagementDialogComponent,
    CustomAlertingDialogComponent,
    IAlertingManagementDialogProps,
    IAlertingDialogProps,
    IAlertingDialogOldProps,
    IAlertingManagementDialogOldProps,
} from "./presentation/alerting/types.js";
export {
    DefaultSaveAsDialog,
    useSaveAsDialogProps,
} from "./presentation/saveAs/DefaultSaveAsDialog/index.js";
export { SaveAsDialog } from "./presentation/saveAs/SaveAsDialog.js";
export type { CustomSaveAsDialogComponent, ISaveAsDialogProps } from "./presentation/saveAs/types.js";
export { ButtonBar } from "./presentation/topBar/buttonBar/ButtonBar.js";
export { DefaultButtonBar } from "./presentation/topBar/buttonBar/DefaultButtonBar.js";
export { HiddenButtonBar } from "./presentation/topBar/buttonBar/HiddenButtonBar.js";
export type { IButtonBarProps, CustomButtonBarComponent } from "./presentation/topBar/buttonBar/types.js";
export { CancelButton } from "./presentation/topBar/buttonBar/button/cancelButton/CancelButton.js";
export {
    DefaultCancelButton,
    useCancelButtonProps,
} from "./presentation/topBar/buttonBar/button/cancelButton/DefaultCancelButton.js";
export type {
    ICancelButtonProps,
    CustomCancelButtonComponent,
} from "./presentation/topBar/buttonBar/button/cancelButton/types.js";
export {
    DefaultEditButton,
    useEditButtonProps,
} from "./presentation/topBar/buttonBar/button/editButton/DefaultEditButton.js";
export { EditButton } from "./presentation/topBar/buttonBar/button/editButton/EditButton.js";
export type {
    IEditButtonProps,
    CustomEditModeButtonComponent,
} from "./presentation/topBar/buttonBar/button/editButton/types.js";
export {
    DefaultSaveAsNewButton,
    useSaveAsNewButtonProps,
} from "./presentation/topBar/buttonBar/button/saveAsButton/DefaultSaveAsNewButton.js";
export { SaveAsNewButton } from "./presentation/topBar/buttonBar/button/saveAsButton/SaveAsNewButton.js";
export type {
    ISaveAsNewButtonProps,
    CustomSaveAsNewButtonComponent,
} from "./presentation/topBar/buttonBar/button/saveAsButton/types.js";
export {
    DefaultSaveButton,
    useSaveButtonProps,
} from "./presentation/topBar/buttonBar/button/saveButton/DefaultSaveButton.js";
export { SaveButton } from "./presentation/topBar/buttonBar/button/saveButton/SaveButton.js";
export type {
    ISaveButtonProps,
    CustomSaveButtonComponent,
} from "./presentation/topBar/buttonBar/button/saveButton/types.js";
export {
    DefaultShareButton,
    useShareButtonProps,
} from "./presentation/topBar/buttonBar/button/shareButton/DefaultShareButton.js";
export { HiddenShareButton } from "./presentation/topBar/buttonBar/button/shareButton/HiddenShareButton.js";
export { ShareButton } from "./presentation/topBar/buttonBar/button/shareButton/ShareButton.js";
export type {
    IShareButtonProps,
    CustomShareButtonComponent,
} from "./presentation/topBar/buttonBar/button/shareButton/types.js";
export {
    DefaultSettingButton,
    useSettingButtonProps,
} from "./presentation/topBar/buttonBar/button/settingButton/DefaultSettingButton.js";
export { SettingButton } from "./presentation/topBar/buttonBar/button/settingButton/SettingButton.js";
export type {
    ISettingButtonProps,
    CustomSettingButtonComponent,
} from "./presentation/topBar/buttonBar/button/settingButton/types.js";
export { DefaultMenuButton } from "./presentation/topBar/menuButton/DefaultMenuButton.js";
export { HiddenMenuButton } from "./presentation/topBar/menuButton/HiddenMenuButton.js";
export { MenuButton } from "./presentation/topBar/menuButton/MenuButton.js";
export { useDefaultMenuItems } from "./presentation/topBar/menuButton/useDefaultMenuItems.js";
export type {
    IMenuItemCommonProps,
    IMenuButtonItemButton,
    IMenuButtonItemMenu,
    IMenuButtonItemSeparator,
    IMenuButtonItemHeader,
    IMenuButtonItem,
    IMenuButtonProps,
    CustomMenuButtonComponent,
    IMenuButtonConfiguration,
} from "./presentation/topBar/menuButton/types.js";
export { DefaultTitle } from "./presentation/topBar/title/DefaultTitle.js";
export { EditableTitle } from "./presentation/topBar/title/EditableTitle.js";
export { HiddenTitle } from "./presentation/topBar/title/HiddenTitle.js";
export { Title } from "./presentation/topBar/title/Title.js";
export { RenderModeAwareTitle } from "./presentation/topBar/title/RenderModeAwareTitle.js";
export type { ITitleProps, CustomTitleComponent } from "./presentation/topBar/title/types.js";
export { DefaultTopBar, useTopBarProps } from "./presentation/topBar/topBar/DefaultTopBar.js";
export { HiddenTopBar } from "./presentation/topBar/topBar/HiddenTopBar.js";
export { TopBar } from "./presentation/topBar/topBar/TopBar.js";
export { RenderModeAwareTopBar } from "./presentation/topBar/topBar/RenderModeAwareTopBar.js";
export type { ITopBarProps, CustomTopBarComponent } from "./presentation/topBar/topBar/types.js";
export { LockedStatusIndicator } from "./presentation/topBar/shareIndicators/lockedStatus/LockedStatusIndicator.js";
export { DefaultLockedStatus } from "./presentation/topBar/shareIndicators/lockedStatus/DefaultLockedStatus.js";
export { ShareStatusIndicator } from "./presentation/topBar/shareIndicators/shareStatus/ShareStatusIndicator.js";
export { DefaultShareStatus } from "./presentation/topBar/shareIndicators/shareStatus/DefaultShareStatus.js";
export type { ILockedStatusProps } from "./presentation/topBar/shareIndicators/lockedStatus/types.js";
export type { IShareStatusProps } from "./presentation/topBar/shareIndicators/shareStatus/types.js";
export { DefaultDashboardToolbar } from "./presentation/toolbar/DefaultDashboardToolbar/DefaultDashboardToolbar.js";
export {
    DefaultDashboardToolbarGroup,
    type IDefaultDashboardToolbarGroupProps,
} from "./presentation/toolbar/DefaultDashboardToolbar/DefaultDashboardToolbarGroup.js";
export {
    DefaultDashboardToolbarButton,
    type IDefaultDashboardToolbarButtonProps,
} from "./presentation/toolbar/DefaultDashboardToolbar/DefaultDashboardToolbarButton.js";
export { HiddenToolbar } from "./presentation/toolbar/HiddenToolbar.js";
export { Toolbar } from "./presentation/toolbar/Toolbar.js";
export type { IToolbarProps, CustomToolbarComponent } from "./presentation/toolbar/types.js";
export {
    type IUseInsightWidgetDataView,
    type UseInsightWidgetInsightDataViewCallbacks,
    useInsightWidgetDataView,
} from "./presentation/widget/common/useInsightWidgetDataView.js";
export {
    type IUseCustomWidgetExecutionDataViewConfig,
    type UseCustomWidgetExecutionDataViewCallbacks,
    useCustomWidgetExecutionDataView,
} from "./presentation/widget/common/useCustomWidgetExecutionDataView.js";
export {
    type IUseCustomWidgetInsightDataViewConfig,
    type UseCustomWidgetInsightDataViewCallbacks,
    useCustomWidgetInsightDataView,
} from "./presentation/widget/common/useCustomWidgetInsightDataView.js";
export { DefaultInsightBody } from "./presentation/widget/insight/DefaultInsightBody/DefaultInsightBody.js";
export { DashboardInsight } from "./presentation/widget/insight/DashboardInsight.js";
export { DefaultDashboardInsight } from "./presentation/widget/insight/DefaultDashboardInsight.js";
export { DefaultDashboardInsightComponentSetFactory } from "./presentation/widget/insight/DefaultDashboardInsightComponentSetFactory.js";
export type {
    IDashboardInsightProps,
    CustomDashboardInsightComponent,
    IInsightBodyProps,
    CustomInsightBodyComponent,
} from "./presentation/widget/insight/types.js";
export { DefaultDashboardInsightMenu } from "./presentation/widget/insightMenu/DefaultDashboardInsightMenu/DefaultDashboardInsightMenu.js";
export { DefaultDashboardInsightMenuButton } from "./presentation/widget/insightMenu/DefaultDashboardInsightMenu/DefaultDashboardInsightMenuButton.js";
export { DefaultDashboardInsightMenuTitle } from "./presentation/widget/insightMenu/DefaultDashboardInsightMenu/DefaultDashboardInsightMenuTitle.js";
export type {
    AlertingDisabledReason,
    SchedulingDisabledReason,
    IUseInsightMenuConfig,
    DisabledReason,
} from "./presentation/widget/insightMenu/DefaultDashboardInsightMenu/types.js";
export { getDefaultInsightMenuItems } from "./presentation/widget/insightMenu/DefaultDashboardInsightMenu/getDefaultInsightMenuItems.js";
export {
    getDefaultInsightEditMenuItems,
    type InsightMenuItemDependencies,
} from "./presentation/widget/insightMenu/DefaultDashboardInsightMenu/getDefaultInsightEditMenuItems.js";
export { DashboardInsightMenuButton } from "./presentation/widget/insightMenu/DashboardInsightMenuButton.js";
export { DashboardInsightMenu } from "./presentation/widget/insightMenu/DashboardInsightMenu.js";
export { DashboardInsightMenuTitle } from "./presentation/widget/insightMenu/DashboardInsightMenuTitle.js";
export type {
    CustomDashboardInsightMenuButtonComponent,
    CustomDashboardInsightMenuComponent,
    CustomDashboardInsightMenuTitleComponent,
    IDashboardInsightMenuButtonProps,
    IDashboardInsightMenuProps,
    IDashboardInsightMenuTitleProps,
    IInsightMenuItem,
    IInsightMenuSubmenu,
    IInsightMenuGroup,
    IInsightMenuItemButton,
    IInsightMenuItemSeparator,
    IInsightMenuSubmenuComponentProps,
} from "./presentation/widget/insightMenu/types.js";
export type {
    CustomDashboardRichTextComponent,
    IDashboardRichTextProps,
} from "./presentation/widget/richText/types.js";
export { DefaultDashboardRichText } from "./presentation/widget/richText/DefaultDashboardRichText.js";
export { DefaultDashboardRichTextComponentSetFactory } from "./presentation/widget/richText/DefaultDashboardRichTextComponentSetFactory.js";
export { DefaultDashboardRichTextMenu } from "./presentation/widget/richTextMenu/DefaultDashboardRichTextMenu/DefaultDashboardRichTextMenu.js";
export { DefaultDashboardRichTextMenuTitle } from "./presentation/widget/richTextMenu/DefaultDashboardRichTextMenu/DefaultDashboardRichTextMenuTitle.js";
export {
    getDefaultRichTextEditMode,
    type RichTextMenuItemDependencies,
} from "./presentation/widget/richTextMenu/DefaultDashboardRichTextMenu/getDefaultRichTextEditMenuItems.js";
export type {
    CustomDashboardRichTextMenuComponent,
    CustomDashboardRichTextMenuTitleComponent,
    CustomDashboardRichTextMenuButtonComponent,
    IRichTextMenuItem,
    IDashboardRichTextMenuButtonProps,
    IDashboardRichTextMenuTitleProps,
    IDashboardRichTextMenuProps,
    IRichTextMenuItemButton,
    IIRichTextMenuItemSeparator,
    IRichTextMenuSubmenu,
    IRichTextMenuSubmenuComponentProps,
} from "./presentation/widget/richTextMenu/types.js";
export type {
    CustomDashboardVisualizationSwitcherComponent,
    IDashboardVisualizationSwitcherProps,
} from "./presentation/widget/visualizationSwitcher/types.js";
export { DefaultDashboardVisualizationSwitcher } from "./presentation/widget/visualizationSwitcher/DefaultDashboardVisualizationSwitcher.js";
export { DefaultDashboardVisualizationSwitcherComponentSetFactory } from "./presentation/widget/visualizationSwitcher/DefaultDashboardVisualizationSwitcherComponentSetFactory.js";
export type {
    CustomVisualizationSwitcherToolbarComponent,
    IVisualizationSwitcherToolbarProps,
} from "./presentation/widget/visualizationSwitcher/configuration/types.js";
export { DefaultVisualizationSwitcherToolbar } from "./presentation/widget/visualizationSwitcher/configuration/DefaultVisualizationSwitcherToolbar.js";
export type {
    CustomDashboardLayoutComponent as CustomDashboardNestedLayoutComponent,
    IDashboardLayoutProps as IDashboardNestedLayoutProps,
    INestedLayoutProps,
    IDashboardLayoutProps,
    CustomDashboardLayoutComponent,
} from "./presentation/widget/dashboardLayout/types.js";
export { DefaultDashboardLayout as DefaultDashboardNestedLayout } from "./presentation/widget/dashboardLayout/DefaultDashboardLayout.js";
export { DefaultDashboardLayoutComponentSetFactory } from "./presentation/widget/dashboardLayout/DefaultDashboardLayoutComponentSetFactory.js";
export { DashboardLayout } from "./presentation/widget/dashboardLayout/DashboardLayout.js";
export type {
    IDashboardWidgetProps,
    CustomDashboardWidgetComponent,
} from "./presentation/widget/widget/types.js";
export { DefaultDashboardWidget } from "./presentation/widget/widget/DefaultDashboardWidget.js";
export { DashboardWidget } from "./presentation/widget/widget/DashboardWidget.js";
export { DefaultShowAsTableButton } from "./presentation/widget/showAsTableButton/DefaultShowAsTableButton/DefaultShowAsTableButton.js";
export { ShowAsTableButton } from "./presentation/widget/showAsTableButton/ShowAsTableButton.js";
export type {
    CustomShowAsTableButtonComponent,
    IShowAsTableButtonProps,
} from "./presentation/widget/showAsTableButton/types.js";
export { DefaultShareDialog } from "./presentation/shareDialog/DefaultShareDialog.js";
export type {
    CustomShareDialogComponent,
    IShareDialogProps,
    ISharingApplyPayload,
} from "./presentation/shareDialog/types.js";
export { ShareDialog } from "./presentation/shareDialog/ShareDialog.js";
export { DefaultDashboardSettingsDialog } from "./presentation/dashboardSettingsDialog/DefaultDashboardSettingsDialog.js";
export type {
    CustomDashboardSettingsDialogComponent,
    IDashboardSettingsDialogProps,
    IDashboardSettingsApplyPayload,
} from "./presentation/dashboardSettingsDialog/types.js";
export { DashboardSettingsDialog } from "./presentation/dashboardSettingsDialog/DashboardSettingsDialog.js";
export type { IInsightListProps } from "./presentation/insightList/types.js";
export { InsightList } from "./presentation/insightList/InsightList.js";
export type { ICancelEditDialogProps } from "./presentation/cancelEditDialog/types.js";
export {
    DefaultCancelEditDialog,
    useCancelEditDialog,
} from "./presentation/cancelEditDialog/DefaultCancelEditDialog.js";
export { CancelEditDialog } from "./presentation/cancelEditDialog/CancelEditDialog.js";
export type {
    ExportElementType,
    ExportMetaType,
    CommonExportDataAttributes,
    MetaExportDataAttributes,
    MetaExportData,
    HeaderExportData,
    DescriptionExportData,
    WidgetExportDimensionsAttributes,
    WidgetExportDataAttributes,
    SectionDescriptionExportDataAttributes,
    WidgetExportData,
    RichTextDataAttributes,
    RichTextExportData,
    SectionExportData,
} from "./presentation/export/types.js";
export {
    EXPORT_VIS_WARNING_MINIMAL_FONT_SIZE,
    EXPORT_VIS_MINIMAL_WIDTH,
    EXPORT_VIS_MINIMAL_HEIGHT,
} from "./presentation/export/const.js";
export {
    useDashboardExportData,
    useSectionExportData,
    useSectionDescriptionExportData,
    useWidgetExportData,
    useRichTextExportData,
    useVisualizationExportData,
    useMetaExportData,
    useMetaExportImageData,
    useMetaPaletteData,
} from "./presentation/export/useExportData.js";
export {
    type IDefaultDashboardExportVariablesProps,
    DefaultDashboardExportVariables,
} from "./presentation/export/DefaultDashboardExportVariables.js";
export {
    type IExportThemeProviderProps,
    ExportThemeProvider,
} from "./presentation/export/ExportThemeProvider.js";
export { useMinimalSizeValidation } from "./presentation/export/hooks/useMinimalSizeValidation.js";
export type { DashboardRelatedFilter } from "./presentation/export/hooks/useDashboardRelatedFilters.js";
export { resolveMessages, DEFAULT_MESSAGES } from "./presentation/localization/translations.js";

export {
    type IDashboardFilter,
    isDashboardFilter,
    type DashboardDrillDefinition,
    type IDashboardDrillEvent,
    type OnFiredDashboardDrillEvent,
    type IDrillDownContext,
    type IDrillDownDefinition,
    isDrillDownDefinition,
    type IDashboardDrillContext,
    type IDrillToUrlPlaceholder,
    type ISharingProperties,
    type IMenuButtonItemsVisibility,
    type RenderMode,
    type DateFilterValidationResult,
    type ILegacyDashboardTab,
    type ILegacyDashboard,
    type ILayoutCoordinates,
    isLayoutCoordinates,
    type DropZoneType,
    type ILayoutItemPath,
    isLayoutItemPath,
    type ILayoutSectionPath,
    isLayoutSectionPath,
    type IGlobalDrillDownAttributeHierarchyDefinition,
    type IDrillToUrlAttributeDefinition,
    type IScheduleEmailContext,
    type IAlertDialogContext,
} from "./types.js";

export {
    filterContextItemsToDashboardFiltersByWidget,
    filterContextItemsToDashboardFiltersByDateDataSet,
    filterContextToDashboardFiltersByWidget,
    filterContextToDashboardFiltersByDateDataSet,
    filterContextItemsToDashboardFiltersByRichTextWidget,
    dashboardDateFilterToDateFilterByWidget,
    dashboardDateFilterToDateFilterByDateDataSet,
    dashboardAttributeFilterToAttributeFilter,
} from "./converters/filterConverters.js";

export {
    DashboardPluginV1,
    type IDashboardPluginContract_V1,
    type DashboardPluginDescriptor,
} from "./plugins/plugin.js";
export { newDashboardEngine, type IDashboardEngine } from "./plugins/engine.js";
export type {
    IDashboardEventHandling,
    IDashboardCustomizer,
    IDashboardInsightCustomizer,
    IDashboardLayoutCustomizer,
    IDashboardContentCustomizer,
    IDashboardWidgetCustomizer,
    FluidLayoutCustomizationFn,
    IFluidLayoutCustomizer,
    IFilterBarCustomizer,
    DashboardStateChangeCallback,
    FilterBarRenderingMode,
    IAttributeFiltersCustomizer,
    IFilterGroupsCustomizer,
    IDateFiltersCustomizer,
    IFiltersCustomizer,
    ITitleCustomizer,
    ITopBarCustomizer,
    ILoadingCustomizer,
    IVisualizationSwitcherCustomizer,
    IRichTextCustomizer,
    ExportLayoutCustomizationFn,
    IExportLayoutCustomizer,
    SectionSlidesTransformer,
    ISectionSlidesTransformerFunction,
} from "./plugins/customizer.js";

export {
    type IKpiPlaceholderWidget,
    isKpiPlaceholderWidget,
    KPI_PLACEHOLDER_WIDGET_ID,
    newKpiPlaceholderWidget,
    type IInsightPlaceholderWidget,
    isInsightPlaceholderWidget,
    INSIGHT_PLACEHOLDER_WIDGET_ID,
    newInsightPlaceholderWidget,
    type IPlaceholderWidget,
    isPlaceholderWidget,
    isInitialPlaceholderWidget,
    isLoadingPlaceholderWidget,
    PLACEHOLDER_WIDGET_ID,
    newPlaceholderWidget,
    newInitialPlaceholderWidget,
    newLoadingPlaceholderWidget,
    isAnyPlaceholderWidget,
} from "./widgets/placeholders/types.js";
export {
    newInsightWidget,
    InsightWidgetBuilder,
    type InsightWidgetModifications,
} from "./tools/InsightWidgetBuilder.js";

export { KdaDialog } from "./kdaDialog/KdaDialog.js";
export type {
    IKdaDialogProps,
    IKdaDefinition,
    IKdaDataPoint,
    KdaPeriodType,
    DeepReadonly,
    DeepReadonlyObject,
} from "./kdaDialog/types.js";
export { formatKeyDriverAnalysisDateRange } from "./kdaDialog/utils.js";
