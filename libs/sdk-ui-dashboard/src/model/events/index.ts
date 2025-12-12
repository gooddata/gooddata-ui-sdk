// (C) 2021-2025 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";

import { type DashboardAlertCreated, type DashboardAlertSaved } from "./alerts.js";
import {
    type CreateAttributeHierarchyRequested,
    type DeleteAttributeHierarchyRequested,
} from "./attributeHierarchies.js";
import {
    type DashboardCopySaved,
    type DashboardDeinitialized,
    type DashboardExportToExcelRequested,
    type DashboardExportToExcelResolved,
    type DashboardExportToImageRequested,
    type DashboardExportToImageResolved,
    type DashboardExportToPdfPresentationRequested,
    type DashboardExportToPdfPresentationResolved,
    type DashboardExportToPdfRequested,
    type DashboardExportToPdfResolved,
    type DashboardExportToPptPresentationRequested,
    type DashboardExportToPptPresentationResolved,
    type DashboardIgnoreExecutionTimestampChanged,
    type DashboardInitialized,
    type DashboardRenamed,
    type DashboardSaved,
    type DashboardSharingChanged,
    type DashboardWasReset,
    type DateFilterValidationFailed,
} from "./dashboard.js";
import {
    type DashboardDrillDownRequested,
    type DashboardDrillDownResolved,
    type DashboardDrillRequested,
    type DashboardDrillResolved,
    type DashboardDrillToAttributeUrlRequested,
    type DashboardDrillToAttributeUrlResolved,
    type DashboardDrillToCustomUrlRequested,
    type DashboardDrillToCustomUrlResolved,
    type DashboardDrillToDashboardRequested,
    type DashboardDrillToDashboardResolved,
    type DashboardDrillToInsightRequested,
    type DashboardDrillToInsightResolved,
    type DashboardDrillToLegacyDashboardRequested,
    type DashboardDrillToLegacyDashboardResolved,
    type DashboardDrillableItemsChanged,
    type DashboardKeyDriverAnalysisRequested,
    type DashboardKeyDriverAnalysisResolved,
} from "./drill.js";
import {
    type DashboardAttributeFilterAdded,
    type DashboardAttributeFilterMoved,
    type DashboardAttributeFilterParentChanged,
    type DashboardAttributeFilterRemoved,
    type DashboardAttributeFilterSelectionChanged,
    type DashboardAttributeSelectionModeChanged,
    type DashboardAttributeTitleChanged,
    type DashboardDateFilterSelectionChanged,
    type DashboardFilterContextChanged,
} from "./filters.js";
import {
    type DashboardCommandFailed,
    type DashboardCommandRejected,
    type DashboardCommandStarted,
    type DashboardQueryCompleted,
    type DashboardQueryFailed,
    type DashboardQueryRejected,
    type DashboardQueryStarted,
} from "./general.js";
import {
    type DashboardInsightWidgetChanged,
    type DashboardInsightWidgetDescriptionChanged,
    type DashboardInsightWidgetDrillsModified,
    type DashboardInsightWidgetDrillsRemoved,
    type DashboardInsightWidgetExportRequested,
    type DashboardInsightWidgetExportResolved,
    type DashboardInsightWidgetFilterSettingsChanged,
    type DashboardInsightWidgetHeaderChanged,
    type DashboardInsightWidgetInsightSwitched,
    type DashboardInsightWidgetRefreshed,
    type DashboardInsightWidgetVisConfigurationChanged,
    type DashboardInsightWidgetVisPropertiesChanged,
} from "./insight.js";
import {
    type DashboardKpiWidgetChanged,
    type DashboardKpiWidgetComparisonChanged,
    type DashboardKpiWidgetConfigurationChanged,
    type DashboardKpiWidgetDescriptionChanged,
    type DashboardKpiWidgetDrillRemoved,
    type DashboardKpiWidgetDrillSet,
    type DashboardKpiWidgetFilterSettingsChanged,
    type DashboardKpiWidgetHeaderChanged,
    type DashboardKpiWidgetMeasureChanged,
} from "./kpi.js";
import { type CreateInsightRequested } from "./lab.js";
import {
    type DashboardLayoutChanged,
    type DashboardLayoutSectionAdded,
    type DashboardLayoutSectionHeaderChanged,
    type DashboardLayoutSectionItemMoved,
    type DashboardLayoutSectionItemMovedToNewSection,
    type DashboardLayoutSectionItemRemoved,
    type DashboardLayoutSectionItemReplaced,
    type DashboardLayoutSectionItemsAdded,
    type DashboardLayoutSectionMoved,
    type DashboardLayoutSectionRemoved,
} from "./layout.js";
import {
    type DashboardAsyncRenderRequested,
    type DashboardAsyncRenderResolved,
    type DashboardRenderRequested,
    type DashboardRenderResolved,
} from "./render.js";
import { type DashboardRenderModeChanged } from "./renderMode.js";
import {
    type DashboardRichTextWidgetContentChanged,
    type DashboardRichTextWidgetFilterSettingsChanged,
} from "./richText.js";
import {
    type DashboardAutomationsRefreshed,
    type DashboardScheduledEmailCreated,
    type DashboardScheduledEmailSaved,
} from "./scheduledEmail.js";
import type { ShowWidgetAsTableSet } from "./showWidgetAsTable.js";
import {
    type DashboardTabConvertedFromDefault,
    type DashboardTabCreated,
    type DashboardTabDeleted,
    type DashboardTabRenamed,
    type DashboardTabRenamingCanceled,
    type DashboardTabRenamingStarted,
    type DashboardTabSwitched,
} from "./tabs.js";
import { type DashboardUserInteractionTriggered } from "./userInteraction.js";
import {
    type DashboardVisualizationSwitcherWidgetVisualizationAdded,
    type DashboardVisualizationSwitcherWidgetVisualizationsUpdated,
} from "./visualizationSwitcher.js";
import {
    type DashboardWidgetExecutionFailed,
    type DashboardWidgetExecutionStarted,
    type DashboardWidgetExecutionSucceeded,
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
    DashboardRenamed,
    DashboardRenamedPayload,
    DashboardWasReset,
    DashboardWasResetPayload,
    DashboardDeleted,
    DashboardDeletedPayload,
    DashboardExportToPdfRequested,
    DashboardExportToPdfResolved,
    DashboardExportToPdfResolvedPayload,
    DashboardSharingChanged,
    DashboardSharingChangedPayload,
    DashboardExportToExcelRequested,
    DashboardExportToExcelResolved,
    DashboardExportToPdfPresentationRequested,
    DashboardExportToPdfPresentationResolved,
    DashboardExportToPptPresentationRequested,
    DashboardExportToPptPresentationResolved,
    DashboardExportToExcelResolvedPayload,
    DashboardExportToPdfPresentationResolvedPayload,
    DashboardExportToPptPresentationResolvedPayload,
    DashboardIgnoreExecutionTimestampChanged,
    DashboardIgnoreExecutionTimestampChangedPayload,
    DashboardExportToImageRequested,
    DashboardExportToImageResolved,
    DashboardExportToImageResolvedPayload,
} from "./dashboard.js";
export type {
    DashboardTabSwitched,
    DashboardTabSwitchedPayload,
    DashboardTabCreated,
    DashboardTabCreatedPayload,
    DashboardTabConvertedFromDefault,
    DashboardTabConvertedFromDefaultPayload,
    DashboardTabDeleted,
    DashboardTabDeletedPayload,
    DashboardTabRenamingStarted,
    DashboardTabRenamingStartedPayload,
    DashboardTabRenamingCanceled,
    DashboardTabRenamingCanceledPayload,
    DashboardTabRenamed,
    DashboardTabRenamedPayload,
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
    DashboardCommandStarted,
    DashboardCommandStartedPayload,
    DashboardCommandRejected,
    DashboardCommandFailed,
    DashboardCommandFailedPayload,
    ActionFailedErrorReason,
    DashboardQueryRejected,
    DashboardQueryFailed,
    DashboardQueryFailedPayload,
    DashboardQueryStarted,
    DashboardQueryStartedPayload,
    DashboardQueryCompleted,
    DashboardQueryCompletedPayload,
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
    DashboardAttributeFilterParentChanged,
    DashboardAttributeFilterParentChangedPayload,
    DashboardAttributeFilterRemoved,
    DashboardAttributeFilterRemovedPayload,
    DashboardAttributeFilterSelectionChanged,
    DashboardAttributeTitleChanged,
    DashboardAttributeTitleChangedPayload,
    DashboardAttributeSelectionModeChanged,
    DashboardAttributeSelectionModeChangedPayload,
    DashboardAttributeFilterMoved,
    DashboardAttributeFilterMovedPayload,
    DashboardAttributeFilterAdded,
    DashboardAttributeFilterAddedPayload,
    DashboardAttributeFilterConfigModeChanged,
    DashboardAttributeFilterConfigModeChangedPayload,
    DashboardAttributeFilterConfigLimitingItemsChanged,
    DashboardAttributeFilterConfigLimitingItemsChangedPayload,
    DashboardFilterViewCreationSucceeded,
    DashboardFilterViewCreationSucceededPayload,
    DashboardFilterViewCreationFailed,
    DashboardFilterViewDeletionSucceeded,
    DashboardFilterViewDeletionSucceededPayload,
    DashboardFilterViewDeletionFailed,
    DashboardFilterViewApplicationSucceeded,
    DashboardFilterViewApplicationSucceededPayload,
    DashboardFilterViewApplicationFailed,
    DashboardFilterViewDefaultStatusChangeSucceeded,
    DashboardFilterViewDefaultStatusChangeSucceededPayload,
    DashboardFilterViewDefaultStatusChangeFailed,
    DashboardFilterViewDefaultStatusChangeFailedPayload,
    DashboardFilterContextSelectionReseted,
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
    isDashboardFilterContextSelectionReseted,
    filterContextSelectionReseted,
} from "./filters.js";

export type {
    DashboardLayoutSectionAdded,
    DashboardLayoutSectionAddedPayload,
    DashboardLayoutSectionMoved,
    DashboardLayoutSectionMovedPayload,
    DashboardLayoutSectionRemoved,
    DashboardLayoutSectionRemovedPayload,
    DashboardLayoutSectionHeaderChanged,
    DashboardLayoutSectionHeaderChangedPayload,
    DashboardLayoutSectionItemsAdded,
    DashboardLayoutSectionItemsAddedPayload,
    DashboardLayoutSectionItemReplaced,
    DashboardLayoutSectionItemReplacedPayload,
    DashboardLayoutSectionItemMoved,
    DashboardLayoutSectionItemMovedPayload,
    DashboardLayoutSectionItemRemoved,
    DashboardLayoutSectionItemRemovedPayload,
    DashboardLayoutSectionItemMovedToNewSection,
    DashboardLayoutSectionItemMovedToNewSectionPayload,
    DashboardLayoutChanged,
    DashboardLayoutChangedPayload,
    LayoutSectionHeadersToggled,
    LayoutSectionHeadersToggledPayload,
    ScreenSizeChanged,
    ScreenSizeChangedPayload,
    LayoutDirectionChanged,
    LayoutDirectionChangedPayload,
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
    DashboardKpiWidgetHeaderChanged,
    DashboardKpiWidgetHeaderChangedPayload,
    DashboardKpiWidgetDescriptionChanged,
    DashboardKpiWidgetDescriptionChangedPayload,
    DashboardKpiWidgetConfigurationChanged,
    DashboardKpiWidgetConfigurationChangedPayload,
    DashboardKpiWidgetMeasureChanged,
    DashboardKpiWidgetMeasureChangedPayload,
    DashboardKpiWidgetFilterSettingsChanged,
    DashboardKpiWidgetFilterSettingsChangedPayload,
    DashboardKpiWidgetComparisonChanged,
    DashboardKpiWidgetComparisonChangedPayload,
    DashboardKpiWidgetDrillRemoved,
    DashboardKpiWidgetDrillRemovedPayload,
    DashboardKpiWidgetDrillSet,
    DashboardKpiWidgetDrillSetPayload,
    DashboardKpiWidgetChanged,
    DashboardKpiWidgetChangedPayload,
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
    DashboardInsightWidgetHeaderChanged,
    DashboardInsightWidgetHeaderChangedPayload,
    DashboardInsightWidgetDescriptionChanged,
    DashboardInsightWidgetDescriptionChangedPayload,
    DashboardInsightWidgetFilterSettingsChanged,
    DashboardInsightWidgetFilterSettingsChangedPayload,
    DashboardInsightWidgetVisPropertiesChanged,
    DashboardInsightWidgetVisPropertiesChangedPayload,
    DashboardInsightWidgetVisConfigurationChanged,
    DashboardInsightWidgetVisConfigurationChangedPayload,
    DashboardInsightWidgetInsightSwitched,
    DashboardInsightWidgetInsightSwitchedPayload,
    DashboardInsightWidgetDrillsModified,
    DashboardInsightWidgetDrillsModifiedPayload,
    DashboardInsightWidgetDrillsRemoved,
    DashboardInsightWidgetDrillsRemovedPayload,
    DashboardInsightWidgetChanged,
    DashboardInsightWidgetChangedPayload,
    DashboardInsightWidgetExportRequested,
    DashboardInsightWidgetExportRequestedPayload,
    DashboardInsightWidgetExportResolved,
    DashboardInsightWidgetExportResolvedPayload,
    DashboardInsightWidgetRefreshed,
    DashboardInsightWidgetRefreshedPayload,
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
    DashboardRichTextWidgetContentChanged,
    DashboardRichTextWidgetContentChangedPayload,
    DashboardRichTextWidgetFilterSettingsChanged,
    DashboardRichTextWidgetFilterSettingsChangedPayload,
} from "./richText.js";
export {
    isDashboardRichTextWidgetContentChanged,
    richTextWidgetContentChanged,
    isDashboardRichTextWidgetFilterSettingsChanged,
    richTextWidgetFilterSettingsChanged,
} from "./richText.js";

export type {
    DashboardVisualizationSwitcherWidgetVisualizationAdded,
    DashboardVisualizationSwitcherWidgetVisualizationAddedPayload,
    DashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    DashboardVisualizationSwitcherWidgetVisualizationsUpdatedPayload,
} from "./visualizationSwitcher.js";

export {
    isDashboardVisualizationSwitcherWidgetVisualizationAdded,
    visualizationSwitcherWidgetVisualizationAdded,
    isDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    visualizationSwitcherWidgetVisualizationsUpdated,
} from "./visualizationSwitcher.js";

export type {
    DashboardWidgetExecutionStarted,
    DashboardWidgetExecutionStartedPayload,
    DashboardWidgetExecutionSucceeded,
    DashboardWidgetExecutionSucceededPayload,
    DashboardWidgetExecutionFailed,
    DashboardWidgetExecutionFailedPayload,
} from "./widget.js";
export {
    isDashboardWidgetExecutionStarted,
    isDashboardWidgetExecutionSucceeded,
    isDashboardWidgetExecutionFailed,
} from "./widget.js";

export type {
    DashboardAlertCreated,
    DashboardAlertCreatedPayload,
    DashboardAlertSaved,
    DashboardAlertSavedPayload,
} from "./alerts.js";
export { isDashboardAlertCreated, isDashboardAlertSaved } from "./alerts.js";

export type {
    DashboardScheduledEmailCreated,
    DashboardScheduledEmailCreatedPayload,
    DashboardScheduledEmailSaved,
    DashboardAutomationsRefreshed,
} from "./scheduledEmail.js";
export {
    isDashboardScheduledEmailCreated,
    isDashboardScheduledEmailSaved,
    isDashboardAutomationsRefreshed,
} from "./scheduledEmail.js";

export type {
    DashboardDrillRequested,
    DashboardDrillRequestedPayload,
    DashboardDrillResolved,
    DashboardDrillResolvedPayload,
    DashboardDrillDownRequested,
    DashboardDrillDownRequestedPayload,
    DashboardDrillDownResolved,
    DashboardDrillDownResolvedPayload,
    DashboardDrillToAttributeUrlRequested,
    DashboardDrillToAttributeUrlRequestedPayload,
    DashboardDrillToAttributeUrlResolved,
    DashboardDrillToAttributeUrlResolvedPayload,
    DashboardDrillToCustomUrlRequested,
    DashboardDrillToCustomUrlRequestedPayload,
    DashboardDrillToCustomUrlResolved,
    DashboardDrillToCustomUrlResolvedPayload,
    DashboardDrillToInsightRequested,
    DashboardDrillToInsightRequestedPayload,
    DashboardDrillToInsightResolved,
    DashboardDrillToInsightResolvedPayload,
    DashboardDrillToDashboardRequested,
    DashboardDrillToDashboardRequestedPayload,
    DashboardDrillToDashboardResolved,
    DashboardDrillToDashboardResolvedPayload,
    DashboardDrillToLegacyDashboardRequested,
    DashboardDrillToLegacyDashboardRequestedPayload,
    DashboardDrillToLegacyDashboardResolved,
    DashboardDrillToLegacyDashboardResolvedPayload,
    DashboardDrillableItemsChanged,
    DashboardDrillableItemsChangedPayload,
    DashboardCrossFilteringRequested,
    DashboardCrossFilteringRequestedPayload,
    DashboardCrossFilteringResolved,
    DashboardCrossFilteringResolvedPayload,
    DashboardKeyDriverAnalysisResolved,
    DashboardKeyDriverAnalysisResolvedPayload,
    DashboardKeyDriverAnalysisRequested,
    DashboardKeyDriverAnalysisRequestedPayload,
    DashboardKeyDriverCombinationItem,
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

export type { DrillTargetsAdded, DrillTargetsAddedPayload } from "./drillTargets.js";
export { drillTargetsAdded, isDrillTargetsAdded } from "./drillTargets.js";

export * from "./userInteraction.js";

export type { ShowWidgetAsTableSet, ShowWidgetAsTableSetPayload } from "./showWidgetAsTable.js";
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

export type { DashboardRenderModeChanged, DashboardRenderModeChangedPayload } from "./renderMode.js";
export { isDashboardRenderModeChanged } from "./renderMode.js";

export type { CreateInsightRequested } from "./lab.js";
export { createInsightRequested, isCreateInsightRequested } from "./lab.js";

export type {
    CreateAttributeHierarchyRequested,
    DeleteAttributeHierarchyRequested,
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
    | DashboardRenderModeChanged
    | DashboardCommandStarted<any>
    | DashboardCommandFailed<any>
    | DashboardCommandRejected
    | DashboardQueryFailed
    | DashboardQueryRejected
    | DashboardQueryStarted
    | DashboardQueryCompleted<any, any>
    | DashboardRenamed
    | DashboardWasReset
    | DashboardExportToPdfRequested
    | DashboardExportToPdfResolved
    | DashboardExportToExcelRequested
    | DashboardExportToExcelResolved
    | DashboardExportToPdfPresentationRequested
    | DashboardExportToPdfPresentationResolved
    | DashboardExportToPptPresentationResolved
    | DashboardExportToPptPresentationRequested
    | DashboardExportToImageRequested
    | DashboardExportToImageResolved
    | DashboardUserInteractionTriggered
    | DashboardDateFilterSelectionChanged
    | DashboardAttributeFilterAdded
    | DashboardAttributeFilterRemoved
    | DashboardAttributeFilterMoved
    | DashboardAttributeFilterSelectionChanged
    | DashboardAttributeTitleChanged
    | DashboardAttributeSelectionModeChanged
    | DashboardAttributeFilterParentChanged
    | DashboardFilterContextChanged
    | DashboardLayoutSectionAdded
    | DashboardLayoutSectionMoved
    | DashboardLayoutSectionRemoved
    | DashboardLayoutSectionHeaderChanged
    | DashboardLayoutSectionItemsAdded
    | DashboardLayoutSectionItemReplaced
    | DashboardLayoutSectionItemMoved
    | DashboardLayoutSectionItemRemoved
    | DashboardLayoutSectionItemMovedToNewSection
    | DashboardLayoutChanged
    | DashboardKpiWidgetHeaderChanged
    | DashboardKpiWidgetDescriptionChanged
    | DashboardKpiWidgetConfigurationChanged
    | DashboardKpiWidgetMeasureChanged
    | DashboardKpiWidgetFilterSettingsChanged
    | DashboardKpiWidgetComparisonChanged
    | DashboardKpiWidgetDrillRemoved
    | DashboardKpiWidgetDrillSet
    | DashboardKpiWidgetChanged
    | DashboardInsightWidgetHeaderChanged
    | DashboardInsightWidgetDescriptionChanged
    | DashboardInsightWidgetFilterSettingsChanged
    | DashboardInsightWidgetVisPropertiesChanged
    | DashboardInsightWidgetVisConfigurationChanged
    | DashboardInsightWidgetInsightSwitched
    | DashboardInsightWidgetDrillsModified
    | DashboardInsightWidgetDrillsRemoved
    | DashboardInsightWidgetChanged
    | DashboardInsightWidgetExportRequested
    | DashboardInsightWidgetExportResolved
    | DashboardInsightWidgetRefreshed
    | DashboardRichTextWidgetContentChanged
    | DashboardRichTextWidgetFilterSettingsChanged
    | DashboardVisualizationSwitcherWidgetVisualizationAdded
    | DashboardVisualizationSwitcherWidgetVisualizationsUpdated
    | DashboardWidgetExecutionStarted
    | DashboardWidgetExecutionSucceeded
    | DashboardWidgetExecutionFailed
    | DashboardAlertCreated
    | DashboardAlertSaved
    | DashboardScheduledEmailCreated
    | DashboardScheduledEmailSaved
    | DashboardAutomationsRefreshed
    | ShowWidgetAsTableSet
    //alpha
    | DashboardDrillDownResolved
    | DashboardDrillToAttributeUrlResolved
    | DashboardDrillToCustomUrlResolved
    | DashboardDrillToDashboardResolved
    | DashboardDrillToInsightResolved
    | DashboardDrillToLegacyDashboardResolved
    | DashboardKeyDriverAnalysisResolved
    | DashboardKeyDriverAnalysisRequested
    | DashboardDrillResolved
    | DashboardDrillDownRequested
    | DashboardDrillToAttributeUrlRequested
    | DashboardDrillToCustomUrlRequested
    | DashboardDrillToDashboardRequested
    | DashboardDrillToInsightRequested
    | DashboardDrillToLegacyDashboardRequested
    | DashboardDrillRequested
    | DashboardDrillableItemsChanged
    | DashboardIgnoreExecutionTimestampChanged
    | DashboardTabSwitched
    | DashboardTabConvertedFromDefault
    | DashboardTabCreated
    | DashboardTabDeleted
    | DashboardTabRenamingStarted
    | DashboardTabRenamingCanceled
    | DashboardTabRenamed
    // internal
    | CreateInsightRequested
    | CreateAttributeHierarchyRequested
    | DeleteAttributeHierarchyRequested;

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
