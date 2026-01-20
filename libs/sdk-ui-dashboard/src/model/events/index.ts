// (C) 2021-2026 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";

import { type IDashboardAlertCreated, type IDashboardAlertSaved } from "./alerts.js";
import {
    type ICreateAttributeHierarchyRequested,
    type IDeleteAttributeHierarchyRequested,
} from "./attributeHierarchies.js";
import {
    type DashboardCopySaved,
    type DashboardDeinitialized,
    type DashboardInitialized,
    type DashboardSaved,
    type DashboardSharingChanged,
    type DateFilterValidationFailed,
    type IDashboardExportToExcelRequested,
    type IDashboardExportToExcelResolved,
    type IDashboardExportToImageRequested,
    type IDashboardExportToImageResolved,
    type IDashboardExportToPdfPresentationRequested,
    type IDashboardExportToPdfPresentationResolved,
    type IDashboardExportToPdfRequested,
    type IDashboardExportToPdfResolved,
    type IDashboardExportToPptPresentationRequested,
    type IDashboardExportToPptPresentationResolved,
    type IDashboardIgnoreExecutionTimestampChanged,
    type IDashboardRenamed,
    type IDashboardWasReset,
} from "./dashboard.js";
import {
    type IDashboardDrillDownRequested,
    type IDashboardDrillDownResolved,
    type IDashboardDrillRequested,
    type IDashboardDrillResolved,
    type IDashboardDrillToAttributeUrlRequested,
    type IDashboardDrillToAttributeUrlResolved,
    type IDashboardDrillToCustomUrlRequested,
    type IDashboardDrillToCustomUrlResolved,
    type IDashboardDrillToDashboardRequested,
    type IDashboardDrillToDashboardResolved,
    type IDashboardDrillToInsightRequested,
    type IDashboardDrillToInsightResolved,
    type IDashboardDrillToLegacyDashboardRequested,
    type IDashboardDrillToLegacyDashboardResolved,
    type IDashboardDrillableItemsChanged,
    type IDashboardKeyDriverAnalysisRequested,
    type IDashboardKeyDriverAnalysisResolved,
} from "./drill.js";
import {
    type DashboardAttributeFilterSelectionChanged,
    type DashboardDateFilterSelectionChanged,
    type DashboardFilterContextChanged,
    type IDashboardAttributeFilterAdded,
    type IDashboardAttributeFilterMoved,
    type IDashboardAttributeFilterParentChanged,
    type IDashboardAttributeFilterRemoved,
    type IDashboardAttributeSelectionModeChanged,
    type IDashboardAttributeTitleChanged,
} from "./filters.js";
import {
    type IDashboardCommandFailed,
    type IDashboardCommandRejected,
    type IDashboardCommandStarted,
    type IDashboardQueryCompleted,
    type IDashboardQueryFailed,
    type IDashboardQueryRejected,
    type IDashboardQueryStarted,
} from "./general.js";
import {
    type IDashboardInsightWidgetChanged,
    type IDashboardInsightWidgetDescriptionChanged,
    type IDashboardInsightWidgetDrillsModified,
    type IDashboardInsightWidgetDrillsRemoved,
    type IDashboardInsightWidgetExportRequested,
    type IDashboardInsightWidgetExportResolved,
    type IDashboardInsightWidgetFilterSettingsChanged,
    type IDashboardInsightWidgetHeaderChanged,
    type IDashboardInsightWidgetInsightSwitched,
    type IDashboardInsightWidgetRefreshed,
    type IDashboardInsightWidgetVisConfigurationChanged,
    type IDashboardInsightWidgetVisPropertiesChanged,
} from "./insight.js";
import {
    type IDashboardKpiWidgetChanged,
    type IDashboardKpiWidgetComparisonChanged,
    type IDashboardKpiWidgetConfigurationChanged,
    type IDashboardKpiWidgetDescriptionChanged,
    type IDashboardKpiWidgetDrillRemoved,
    type IDashboardKpiWidgetDrillSet,
    type IDashboardKpiWidgetFilterSettingsChanged,
    type IDashboardKpiWidgetHeaderChanged,
    type IDashboardKpiWidgetMeasureChanged,
} from "./kpi.js";
import { type ICreateInsightRequested } from "./lab.js";
import {
    type IDashboardLayoutChanged,
    type IDashboardLayoutSectionAdded,
    type IDashboardLayoutSectionHeaderChanged,
    type IDashboardLayoutSectionItemMoved,
    type IDashboardLayoutSectionItemMovedToNewSection,
    type IDashboardLayoutSectionItemRemoved,
    type IDashboardLayoutSectionItemReplaced,
    type IDashboardLayoutSectionItemsAdded,
    type IDashboardLayoutSectionMoved,
    type IDashboardLayoutSectionRemoved,
} from "./layout.js";
import {
    type DashboardAsyncRenderRequested,
    type DashboardAsyncRenderResolved,
    type DashboardRenderRequested,
    type DashboardRenderResolved,
} from "./render.js";
import { type IDashboardRenderModeChanged } from "./renderMode.js";
import {
    type IDashboardRichTextWidgetContentChanged,
    type IDashboardRichTextWidgetFilterSettingsChanged,
} from "./richText.js";
import {
    type IDashboardAutomationsRefreshed,
    type IDashboardScheduledEmailCreated,
    type IDashboardScheduledEmailSaved,
} from "./scheduledEmail.js";
import type { IShowWidgetAsTableSet } from "./showWidgetAsTable.js";
import {
    type IDashboardTabConvertedFromDefault,
    type IDashboardTabCreated,
    type IDashboardTabDeleted,
    type IDashboardTabRenamed,
    type IDashboardTabRenamingCanceled,
    type IDashboardTabRenamingStarted,
    type IDashboardTabSwitched,
} from "./tabs.js";
import { type IDashboardUserInteractionTriggered } from "./userInteraction.js";
import {
    type IDashboardVisualizationSwitcherWidgetVisualizationAdded,
    type IDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
} from "./visualizationSwitcher.js";
import {
    type IDashboardWidgetExecutionFailed,
    type IDashboardWidgetExecutionStarted,
    type IDashboardWidgetExecutionSucceeded,
} from "./widget.js";

export type {
    IDashboardEvent,
    DashboardEventType,
    ICustomDashboardEvent,
    DashboardEventBody,
} from "./base.js";
export { isDashboardEvent, isCustomDashboardEvent, isDashboardEventOrCustomDashboardEvent } from "./base.js";

export type {
    DateFilterValidationFailed,
    DateFilterValidationFailedPayload,
    DashboardInitialized,
    DashboardInitializedPayload,
    DashboardDeinitialized,
    DashboardDeinitializedPayload,
    DashboardSaved,
    DashboardSavedPayload,
    DashboardCopySaved,
    DashboardCopySavedPayload,
    IDashboardRenamed,
    IDashboardRenamedPayload,
    IDashboardWasReset,
    IDashboardWasResetPayload,
    IDashboardDeleted,
    IDashboardDeletedPayload,
    IDashboardExportToPdfRequested,
    IDashboardExportToPdfResolved,
    IDashboardExportToPdfResolvedPayload,
    DashboardSharingChanged,
    DashboardSharingChangedPayload,
    IDashboardExportToExcelRequested,
    IDashboardExportToExcelResolved,
    IDashboardExportToPdfPresentationRequested,
    IDashboardExportToPdfPresentationResolved,
    IDashboardExportToPptPresentationRequested,
    IDashboardExportToPptPresentationResolved,
    IDashboardExportToExcelResolvedPayload,
    IDashboardExportToPdfPresentationResolvedPayload,
    IDashboardExportToPptPresentationResolvedPayload,
    IDashboardIgnoreExecutionTimestampChanged,
    IDashboardIgnoreExecutionTimestampChangedPayload,
    IDashboardExportToImageRequested,
    IDashboardExportToImageResolved,
    IDashboardExportToImageResolvedPayload,
} from "./dashboard.js";
export type {
    IDashboardTabSwitched,
    IDashboardTabSwitchedPayload,
    IDashboardTabCreated,
    IDashboardTabCreatedPayload,
    IDashboardTabConvertedFromDefault,
    IDashboardTabConvertedFromDefaultPayload,
    IDashboardTabDeleted,
    IDashboardTabDeletedPayload,
    IDashboardTabRenamingStarted,
    IDashboardTabRenamingStartedPayload,
    IDashboardTabRenamingCanceled,
    IDashboardTabRenamingCanceledPayload,
    IDashboardTabRenamed,
    IDashboardTabRenamedPayload,
} from "./tabs.js";
export {
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
} from "./tabs.js";
export {
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
} from "./dashboard.js";

export type {
    IDashboardCommandStarted,
    IDashboardCommandStartedPayload,
    IDashboardCommandRejected,
    IDashboardCommandFailed,
    IDashboardCommandFailedPayload,
    ActionFailedErrorReason,
    IDashboardQueryRejected,
    IDashboardQueryFailed,
    IDashboardQueryFailedPayload,
    IDashboardQueryStarted,
    IDashboardQueryStartedPayload,
    IDashboardQueryCompleted,
    IDashboardQueryCompletedPayload,
} from "./general.js";
export {
    isDashboardCommandStarted,
    isDashboardCommandFailed,
    isDashboardQueryFailed,
    isDashboardCommandRejected,
    isDashboardQueryCompleted,
    isDashboardQueryRejected,
    isDashboardQueryStarted,
} from "./general.js";

export type {
    DashboardDateFilterSelectionChanged,
    DashboardDateFilterSelectionChangedPayload,
    DashboardAttributeFilterSelectionChangedPayload,
    DashboardFilterContextChanged,
    DashboardFilterContextChangedPayload,
    IDashboardAttributeFilterParentChanged,
    IDashboardAttributeFilterParentChangedPayload,
    IDashboardAttributeFilterRemoved,
    IDashboardAttributeFilterRemovedPayload,
    DashboardAttributeFilterSelectionChanged,
    IDashboardAttributeTitleChanged,
    IDashboardAttributeTitleChangedPayload,
    IDashboardAttributeSelectionModeChanged,
    IDashboardAttributeSelectionModeChangedPayload,
    IDashboardAttributeFilterMoved,
    IDashboardAttributeFilterMovedPayload,
    IDashboardAttributeFilterAdded,
    IDashboardAttributeFilterAddedPayload,
    IDashboardAttributeFilterConfigModeChanged,
    IDashboardAttributeFilterConfigModeChangedPayload,
    IDashboardAttributeFilterConfigLimitingItemsChanged,
    IDashboardAttributeFilterConfigLimitingItemsChangedPayload,
    IDashboardFilterViewCreationSucceeded,
    IDashboardFilterViewCreationSucceededPayload,
    IDashboardFilterViewCreationFailed,
    IDashboardFilterViewDeletionSucceeded,
    IDashboardFilterViewDeletionSucceededPayload,
    IDashboardFilterViewDeletionFailed,
    IDashboardFilterViewApplicationSucceeded,
    IDashboardFilterViewApplicationSucceededPayload,
    IDashboardFilterViewApplicationFailed,
    IDashboardFilterViewDefaultStatusChangeSucceeded,
    IDashboardFilterViewDefaultStatusChangeSucceededPayload,
    IDashboardFilterViewDefaultStatusChangeFailed,
    IDashboardFilterViewDefaultStatusChangeFailedPayload,
    IDashboardFilterContextSelectionReset,
} from "./filters.js";
export {
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
} from "./filters.js";

export type {
    IDashboardLayoutSectionAdded,
    IDashboardLayoutSectionAddedPayload,
    IDashboardLayoutSectionMoved,
    IDashboardLayoutSectionMovedPayload,
    IDashboardLayoutSectionRemoved,
    IDashboardLayoutSectionRemovedPayload,
    IDashboardLayoutSectionHeaderChanged,
    IDashboardLayoutSectionHeaderChangedPayload,
    IDashboardLayoutSectionItemsAdded,
    IDashboardLayoutSectionItemsAddedPayload,
    IDashboardLayoutSectionItemReplaced,
    IDashboardLayoutSectionItemReplacedPayload,
    IDashboardLayoutSectionItemMoved,
    IDashboardLayoutSectionItemMovedPayload,
    IDashboardLayoutSectionItemRemoved,
    IDashboardLayoutSectionItemRemovedPayload,
    IDashboardLayoutSectionItemMovedToNewSection,
    IDashboardLayoutSectionItemMovedToNewSectionPayload,
    IDashboardLayoutChanged,
    IDashboardLayoutChangedPayload,
    ILayoutSectionHeadersToggled,
    ILayoutSectionHeadersToggledPayload,
    IScreenSizeChanged,
    IScreenSizeChangedPayload,
    ILayoutDirectionChanged,
    ILayoutDirectionChangedPayload,
} from "./layout.js";
export {
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
} from "./layout.js";

export type {
    IDashboardKpiWidgetHeaderChanged,
    IDashboardKpiWidgetHeaderChangedPayload,
    IDashboardKpiWidgetDescriptionChanged,
    IDashboardKpiWidgetDescriptionChangedPayload,
    IDashboardKpiWidgetConfigurationChanged,
    IDashboardKpiWidgetConfigurationChangedPayload,
    IDashboardKpiWidgetMeasureChanged,
    IDashboardKpiWidgetMeasureChangedPayload,
    IDashboardKpiWidgetFilterSettingsChanged,
    IDashboardKpiWidgetFilterSettingsChangedPayload,
    IDashboardKpiWidgetComparisonChanged,
    IDashboardKpiWidgetComparisonChangedPayload,
    IDashboardKpiWidgetDrillRemoved,
    IDashboardKpiWidgetDrillRemovedPayload,
    IDashboardKpiWidgetDrillSet,
    IDashboardKpiWidgetDrillSetPayload,
    IDashboardKpiWidgetChanged,
    IDashboardKpiWidgetChangedPayload,
} from "./kpi.js";
export {
    isDashboardKpiWidgetChanged,
    isDashboardKpiWidgetComparisonChanged,
    isDashboardKpiWidgetFilterSettingsChanged,
    isDashboardKpiWidgetHeaderChanged,
    isDashboardKpiWidgetDescriptionChanged,
    isDashboardKpiWidgetConfigurationChanged,
    isDashboardKpiWidgetMeasureChanged,
    isDashboardKpiWidgetDrillRemoved,
    isDashboardKpiWidgetDrillSet,
} from "./kpi.js";

export type {
    IDashboardInsightWidgetHeaderChanged,
    IDashboardInsightWidgetHeaderChangedPayload,
    IDashboardInsightWidgetDescriptionChanged,
    IDashboardInsightWidgetDescriptionChangedPayload,
    IDashboardInsightWidgetFilterSettingsChanged,
    IDashboardInsightWidgetFilterSettingsChangedPayload,
    IDashboardInsightWidgetVisPropertiesChanged,
    IDashboardInsightWidgetVisPropertiesChangedPayload,
    IDashboardInsightWidgetVisConfigurationChanged,
    IDashboardInsightWidgetVisConfigurationChangedPayload,
    IDashboardInsightWidgetInsightSwitched,
    IDashboardInsightWidgetInsightSwitchedPayload,
    IDashboardInsightWidgetDrillsModified,
    IDashboardInsightWidgetDrillsModifiedPayload,
    IDashboardInsightWidgetDrillsRemoved,
    IDashboardInsightWidgetDrillsRemovedPayload,
    IDashboardInsightWidgetChanged,
    IDashboardInsightWidgetChangedPayload,
    IDashboardInsightWidgetExportRequested,
    IDashboardInsightWidgetExportRequestedPayload,
    IDashboardInsightWidgetExportResolved,
    IDashboardInsightWidgetExportResolvedPayload,
    IDashboardInsightWidgetRefreshed,
    IDashboardInsightWidgetRefreshedPayload,
} from "./insight.js";
export {
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
} from "./insight.js";

export type {
    IDashboardRichTextWidgetContentChanged,
    IDashboardRichTextWidgetContentChangedPayload,
    IDashboardRichTextWidgetFilterSettingsChanged,
    IDashboardRichTextWidgetFilterSettingsChangedPayload,
} from "./richText.js";
export {
    isDashboardRichTextWidgetContentChanged,
    richTextWidgetContentChanged,
    isDashboardRichTextWidgetFilterSettingsChanged,
    richTextWidgetFilterSettingsChanged,
} from "./richText.js";

export type {
    IDashboardVisualizationSwitcherWidgetVisualizationAdded,
    IDashboardVisualizationSwitcherWidgetVisualizationAddedPayload,
    IDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    IDashboardVisualizationSwitcherWidgetVisualizationsUpdatedPayload,
} from "./visualizationSwitcher.js";

export {
    isDashboardVisualizationSwitcherWidgetVisualizationAdded,
    visualizationSwitcherWidgetVisualizationAdded,
    isDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    visualizationSwitcherWidgetVisualizationsUpdated,
} from "./visualizationSwitcher.js";

export type {
    IDashboardWidgetExecutionStarted,
    IDashboardWidgetExecutionStartedPayload,
    IDashboardWidgetExecutionSucceeded,
    IDashboardWidgetExecutionSucceededPayload,
    IDashboardWidgetExecutionFailed,
    IDashboardWidgetExecutionFailedPayload,
} from "./widget.js";
export {
    isDashboardWidgetExecutionStarted,
    isDashboardWidgetExecutionSucceeded,
    isDashboardWidgetExecutionFailed,
} from "./widget.js";

export type {
    IDashboardAlertCreated,
    IDashboardAlertCreatedPayload,
    IDashboardAlertSaved,
    IDashboardAlertSavedPayload,
} from "./alerts.js";
export { isDashboardAlertCreated, isDashboardAlertSaved } from "./alerts.js";

export type {
    IDashboardScheduledEmailCreated,
    IDashboardScheduledEmailCreatedPayload,
    IDashboardScheduledEmailSaved,
    IDashboardAutomationsRefreshed,
} from "./scheduledEmail.js";
export {
    isDashboardScheduledEmailCreated,
    isDashboardScheduledEmailSaved,
    isDashboardAutomationsRefreshed,
} from "./scheduledEmail.js";

export type {
    IDashboardDrillRequested,
    IDashboardDrillRequestedPayload,
    IDashboardDrillResolved,
    IDashboardDrillResolvedPayload,
    IDashboardDrillDownRequested,
    IDashboardDrillDownRequestedPayload,
    IDashboardDrillDownResolved,
    IDashboardDrillDownResolvedPayload,
    IDashboardDrillToAttributeUrlRequested,
    IDashboardDrillToAttributeUrlRequestedPayload,
    IDashboardDrillToAttributeUrlResolved,
    IDashboardDrillToAttributeUrlResolvedPayload,
    IDashboardDrillToCustomUrlRequested,
    IDashboardDrillToCustomUrlRequestedPayload,
    IDashboardDrillToCustomUrlResolved,
    IDashboardDrillToCustomUrlResolvedPayload,
    IDashboardDrillToInsightRequested,
    IDashboardDrillToInsightRequestedPayload,
    IDashboardDrillToInsightResolved,
    IDashboardDrillToInsightResolvedPayload,
    IDashboardDrillToDashboardRequested,
    IDashboardDrillToDashboardRequestedPayload,
    IDashboardDrillToDashboardResolved,
    IDashboardDrillToDashboardResolvedPayload,
    IDashboardDrillToLegacyDashboardRequested,
    IDashboardDrillToLegacyDashboardRequestedPayload,
    IDashboardDrillToLegacyDashboardResolved,
    IDashboardDrillToLegacyDashboardResolvedPayload,
    IDashboardDrillableItemsChanged,
    IDashboardDrillableItemsChangedPayload,
    IDashboardCrossFilteringRequested,
    IDashboardCrossFilteringRequestedPayload,
    IDashboardCrossFilteringResolved,
    IDashboardCrossFilteringResolvedPayload,
    IDashboardKeyDriverAnalysisResolved,
    IDashboardKeyDriverAnalysisResolvedPayload,
    IDashboardKeyDriverAnalysisRequested,
    IDashboardKeyDriverAnalysisRequestedPayload,
    IDashboardKeyDriverCombinationItem,
} from "./drill.js";
export {
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
} from "./drill.js";

export type { IDrillTargetsAdded, IDrillTargetsAddedPayload } from "./drillTargets.js";
export { drillTargetsAdded, isDrillTargetsAdded } from "./drillTargets.js";

export * from "./userInteraction.js";

export type { IShowWidgetAsTableSet, IShowWidgetAsTableSetPayload } from "./showWidgetAsTable.js";
export { isShowWidgetAsTableSet, showWidgetAsTableSet } from "./showWidgetAsTable.js";

export type {
    DashboardRenderRequested,
    DashboardAsyncRenderRequestedPayload,
    DashboardAsyncRenderRequested,
    DashboardAsyncRenderResolved,
    DashboardAsyncRenderResolvedPayload,
    DashboardRenderResolved,
} from "./render.js";
export {
    isDashboardAsyncRenderRequested,
    isDashboardAsyncRenderResolved,
    isDashboardRenderRequested,
    isDashboardRenderResolved,
} from "./render.js";

export type { IDashboardRenderModeChanged, IDashboardRenderModeChangedPayload } from "./renderMode.js";
export { isDashboardRenderModeChanged } from "./renderMode.js";

export type { ICreateInsightRequested } from "./lab.js";
export { createInsightRequested, isCreateInsightRequested } from "./lab.js";

export type {
    ICreateAttributeHierarchyRequested,
    IDeleteAttributeHierarchyRequested,
} from "./attributeHierarchies.js";
export {
    createAttributeHierarchyRequested,
    isCreateAttributeHierarchyRequested,
    deleteAttributeHierarchyRequested,
    isDeleteAttributeHierarchyRequested,
} from "./attributeHierarchies.js";

/**
 * Union type that contains all available built-in dashboard events.
 *
 * @remarks
 * Note: while this type is marked as public most of the events are currently an alpha-level API that
 * we reserve to change in the following releases. If you use those events now, upgrading to the next
 * version of `@gooddata/sdk-ui-dashboard` will likely result in breakage.
 *
 * @public
 */
export type DashboardEvents =
    //public
    | DashboardInitialized
    | DashboardDeinitialized
    | DateFilterValidationFailed
    | DashboardSaved
    | DashboardCopySaved
    | DashboardRenderRequested
    | DashboardAsyncRenderRequested
    | DashboardAsyncRenderResolved
    | DashboardRenderResolved
    | DashboardSharingChanged
    //beta
    | IDashboardRenderModeChanged
    | IDashboardCommandStarted<any>
    | IDashboardCommandFailed<any>
    | IDashboardCommandRejected
    | IDashboardQueryFailed
    | IDashboardQueryRejected
    | IDashboardQueryStarted
    | IDashboardQueryCompleted<any, any>
    | IDashboardRenamed
    | IDashboardWasReset
    | IDashboardExportToPdfRequested
    | IDashboardExportToPdfResolved
    | IDashboardExportToExcelRequested
    | IDashboardExportToExcelResolved
    | IDashboardExportToPdfPresentationRequested
    | IDashboardExportToPdfPresentationResolved
    | IDashboardExportToPptPresentationResolved
    | IDashboardExportToPptPresentationRequested
    | IDashboardExportToImageRequested
    | IDashboardExportToImageResolved
    | IDashboardUserInteractionTriggered
    | DashboardDateFilterSelectionChanged
    | IDashboardAttributeFilterAdded
    | IDashboardAttributeFilterRemoved
    | IDashboardAttributeFilterMoved
    | DashboardAttributeFilterSelectionChanged
    | IDashboardAttributeTitleChanged
    | IDashboardAttributeSelectionModeChanged
    | IDashboardAttributeFilterParentChanged
    | DashboardFilterContextChanged
    | IDashboardLayoutSectionAdded
    | IDashboardLayoutSectionMoved
    | IDashboardLayoutSectionRemoved
    | IDashboardLayoutSectionHeaderChanged
    | IDashboardLayoutSectionItemsAdded
    | IDashboardLayoutSectionItemReplaced
    | IDashboardLayoutSectionItemMoved
    | IDashboardLayoutSectionItemRemoved
    | IDashboardLayoutSectionItemMovedToNewSection
    | IDashboardLayoutChanged
    | IDashboardKpiWidgetHeaderChanged
    | IDashboardKpiWidgetDescriptionChanged
    | IDashboardKpiWidgetConfigurationChanged
    | IDashboardKpiWidgetMeasureChanged
    | IDashboardKpiWidgetFilterSettingsChanged
    | IDashboardKpiWidgetComparisonChanged
    | IDashboardKpiWidgetDrillRemoved
    | IDashboardKpiWidgetDrillSet
    | IDashboardKpiWidgetChanged
    | IDashboardInsightWidgetHeaderChanged
    | IDashboardInsightWidgetDescriptionChanged
    | IDashboardInsightWidgetFilterSettingsChanged
    | IDashboardInsightWidgetVisPropertiesChanged
    | IDashboardInsightWidgetVisConfigurationChanged
    | IDashboardInsightWidgetInsightSwitched
    | IDashboardInsightWidgetDrillsModified
    | IDashboardInsightWidgetDrillsRemoved
    | IDashboardInsightWidgetChanged
    | IDashboardInsightWidgetExportRequested
    | IDashboardInsightWidgetExportResolved
    | IDashboardInsightWidgetRefreshed
    | IDashboardRichTextWidgetContentChanged
    | IDashboardRichTextWidgetFilterSettingsChanged
    | IDashboardVisualizationSwitcherWidgetVisualizationAdded
    | IDashboardVisualizationSwitcherWidgetVisualizationsUpdated
    | IDashboardWidgetExecutionStarted
    | IDashboardWidgetExecutionSucceeded
    | IDashboardWidgetExecutionFailed
    | IDashboardAlertCreated
    | IDashboardAlertSaved
    | IDashboardScheduledEmailCreated
    | IDashboardScheduledEmailSaved
    | IDashboardAutomationsRefreshed
    | IShowWidgetAsTableSet
    //alpha
    | IDashboardDrillDownResolved
    | IDashboardDrillToAttributeUrlResolved
    | IDashboardDrillToCustomUrlResolved
    | IDashboardDrillToDashboardResolved
    | IDashboardDrillToInsightResolved
    | IDashboardDrillToLegacyDashboardResolved
    | IDashboardKeyDriverAnalysisResolved
    | IDashboardKeyDriverAnalysisRequested
    | IDashboardDrillResolved
    | IDashboardDrillDownRequested
    | IDashboardDrillToAttributeUrlRequested
    | IDashboardDrillToCustomUrlRequested
    | IDashboardDrillToDashboardRequested
    | IDashboardDrillToInsightRequested
    | IDashboardDrillToLegacyDashboardRequested
    | IDashboardDrillRequested
    | IDashboardDrillableItemsChanged
    | IDashboardIgnoreExecutionTimestampChanged
    | IDashboardTabSwitched
    | IDashboardTabConvertedFromDefault
    | IDashboardTabCreated
    | IDashboardTabDeleted
    | IDashboardTabRenamingStarted
    | IDashboardTabRenamingCanceled
    | IDashboardTabRenamed
    // internal
    | ICreateInsightRequested
    | ICreateAttributeHierarchyRequested
    | IDeleteAttributeHierarchyRequested;

/**
 * Creates DashboardEvent predicate that test whether the provided event matches it.
 *
 * @alpha
 * @param eventType - dashboard event type
 * @param pred - predicate to test
 * @returns boolean - matches?
 */
export function newDashboardEventPredicate<T extends DashboardEvents["type"]>(
    eventType: T,
    pred?: (event: DashboardEvents & { type: T }) => boolean,
) {
    return (event: Action): boolean => {
        if (event?.type !== eventType) {
            return false;
        }
        return pred?.(event as DashboardEvents & { type: T }) ?? true;
    };
}
