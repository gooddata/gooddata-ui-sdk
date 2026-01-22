// (C) 2021-2026 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";

import {
    type IDashboardAlertCreated,
    type IDashboardAlertCreatedPayload,
    type IDashboardAlertSaved,
    type IDashboardAlertSavedPayload,
    isDashboardAlertCreated,
    isDashboardAlertSaved,
} from "./alerts.js";
import {
    type ICreateAttributeHierarchyRequested,
    type IDeleteAttributeHierarchyRequested,
    createAttributeHierarchyRequested,
    deleteAttributeHierarchyRequested,
    isCreateAttributeHierarchyRequested,
    isDeleteAttributeHierarchyRequested,
} from "./attributeHierarchies.js";
import {
    type DashboardCopySaved,
    type DashboardCopySavedPayload,
    type DashboardDeinitialized,
    type DashboardDeinitializedPayload,
    type DashboardInitialized,
    type DashboardInitializedPayload,
    type DashboardSaved,
    type DashboardSavedPayload,
    type DashboardSharingChanged,
    type DashboardSharingChangedPayload,
    type DateFilterValidationFailed,
    type DateFilterValidationFailedPayload,
    type IDashboardDeleted,
    type IDashboardDeletedPayload,
    type IDashboardExportToExcelRequested,
    type IDashboardExportToExcelResolved,
    type IDashboardExportToExcelResolvedPayload,
    type IDashboardExportToImageRequested,
    type IDashboardExportToImageResolved,
    type IDashboardExportToImageResolvedPayload,
    type IDashboardExportToPdfPresentationRequested,
    type IDashboardExportToPdfPresentationResolved,
    type IDashboardExportToPdfPresentationResolvedPayload,
    type IDashboardExportToPdfRequested,
    type IDashboardExportToPdfResolved,
    type IDashboardExportToPdfResolvedPayload,
    type IDashboardExportToPptPresentationRequested,
    type IDashboardExportToPptPresentationResolved,
    type IDashboardExportToPptPresentationResolvedPayload,
    type IDashboardIgnoreExecutionTimestampChanged,
    type IDashboardIgnoreExecutionTimestampChangedPayload,
    type IDashboardRenamed,
    type IDashboardRenamedPayload,
    type IDashboardWasReset,
    type IDashboardWasResetPayload,
    isDashboardCopySaved,
    isDashboardDeinitialized,
    isDashboardDeleted,
    isDashboardExportToExcelRequested,
    isDashboardExportToExcelResolved,
    isDashboardExportToImageRequested,
    isDashboardExportToImageResolved,
    isDashboardExportToPdfPresentationRequested,
    isDashboardExportToPdfPresentationResolved,
    isDashboardExportToPdfRequested,
    isDashboardExportToPdfResolved,
    isDashboardExportToPptPresentationRequested,
    isDashboardExportToPptPresentationResolved,
    isDashboardIgnoreExecutionTimestampChanged,
    isDashboardInitialized,
    isDashboardRenamed,
    isDashboardSaved,
    isDashboardSharingChanged,
    isDashboardWasReset,
    isDateFilterValidationFailed,
} from "./dashboard.js";
import {
    type IDashboardCrossFilteringRequested,
    type IDashboardCrossFilteringRequestedPayload,
    type IDashboardCrossFilteringResolved,
    type IDashboardCrossFilteringResolvedPayload,
    type IDashboardDrillDownRequested,
    type IDashboardDrillDownRequestedPayload,
    type IDashboardDrillDownResolved,
    type IDashboardDrillDownResolvedPayload,
    type IDashboardDrillRequested,
    type IDashboardDrillRequestedPayload,
    type IDashboardDrillResolved,
    type IDashboardDrillResolvedPayload,
    type IDashboardDrillToAttributeUrlRequested,
    type IDashboardDrillToAttributeUrlRequestedPayload,
    type IDashboardDrillToAttributeUrlResolved,
    type IDashboardDrillToAttributeUrlResolvedPayload,
    type IDashboardDrillToCustomUrlRequested,
    type IDashboardDrillToCustomUrlRequestedPayload,
    type IDashboardDrillToCustomUrlResolved,
    type IDashboardDrillToCustomUrlResolvedPayload,
    type IDashboardDrillToDashboardRequested,
    type IDashboardDrillToDashboardRequestedPayload,
    type IDashboardDrillToDashboardResolved,
    type IDashboardDrillToDashboardResolvedPayload,
    type IDashboardDrillToInsightRequested,
    type IDashboardDrillToInsightRequestedPayload,
    type IDashboardDrillToInsightResolved,
    type IDashboardDrillToInsightResolvedPayload,
    type IDashboardDrillToLegacyDashboardRequested,
    type IDashboardDrillToLegacyDashboardRequestedPayload,
    type IDashboardDrillToLegacyDashboardResolved,
    type IDashboardDrillToLegacyDashboardResolvedPayload,
    type IDashboardDrillableItemsChanged,
    type IDashboardDrillableItemsChangedPayload,
    type IDashboardKeyDriverAnalysisRequested,
    type IDashboardKeyDriverAnalysisRequestedPayload,
    type IDashboardKeyDriverAnalysisResolved,
    type IDashboardKeyDriverAnalysisResolvedPayload,
    type IDashboardKeyDriverCombinationItem,
    isDashboardCrossFilteringRequested,
    isDashboardCrossFilteringResolved,
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
    isDashboardKeyDriverAnalysisRequested,
    isDashboardKeyDriverAnalysisResolved,
} from "./drill.js";
import {
    type DashboardAttributeFilterSelectionChanged,
    type DashboardAttributeFilterSelectionChangedPayload,
    type DashboardDateFilterSelectionChanged,
    type DashboardDateFilterSelectionChangedPayload,
    type DashboardFilterContextChanged,
    type DashboardFilterContextChangedPayload,
    type IDashboardAttributeFilterAdded,
    type IDashboardAttributeFilterAddedPayload,
    type IDashboardAttributeFilterConfigLimitingItemsChanged,
    type IDashboardAttributeFilterConfigLimitingItemsChangedPayload,
    type IDashboardAttributeFilterConfigModeChanged,
    type IDashboardAttributeFilterConfigModeChangedPayload,
    type IDashboardAttributeFilterMoved,
    type IDashboardAttributeFilterMovedPayload,
    type IDashboardAttributeFilterParentChanged,
    type IDashboardAttributeFilterParentChangedPayload,
    type IDashboardAttributeFilterRemoved,
    type IDashboardAttributeFilterRemovedPayload,
    type IDashboardAttributeSelectionModeChanged,
    type IDashboardAttributeSelectionModeChangedPayload,
    type IDashboardAttributeTitleChanged,
    type IDashboardAttributeTitleChangedPayload,
    type IDashboardFilterContextSelectionReset,
    type IDashboardFilterViewApplicationFailed,
    type IDashboardFilterViewApplicationSucceeded,
    type IDashboardFilterViewApplicationSucceededPayload,
    type IDashboardFilterViewCreationFailed,
    type IDashboardFilterViewCreationSucceeded,
    type IDashboardFilterViewCreationSucceededPayload,
    type IDashboardFilterViewDefaultStatusChangeFailed,
    type IDashboardFilterViewDefaultStatusChangeFailedPayload,
    type IDashboardFilterViewDefaultStatusChangeSucceeded,
    type IDashboardFilterViewDefaultStatusChangeSucceededPayload,
    type IDashboardFilterViewDeletionFailed,
    type IDashboardFilterViewDeletionSucceeded,
    type IDashboardFilterViewDeletionSucceededPayload,
    filterContextSelectionReset,
    isDashboardAttributeFilterAdded,
    isDashboardAttributeFilterConfigLimitingItemsChanged,
    isDashboardAttributeFilterConfigModeChanged,
    isDashboardAttributeFilterMoved,
    isDashboardAttributeFilterParentChanged,
    isDashboardAttributeFilterRemoved,
    isDashboardAttributeFilterSelectionChanged,
    isDashboardAttributeFilterSelectionModeChanged,
    isDashboardAttributeFilterTitleChanged,
    isDashboardDateFilterSelectionChanged,
    isDashboardFilterContextChanged,
    isDashboardFilterContextSelectionReset,
    isDashboardFilterViewApplicationFailed,
    isDashboardFilterViewApplicationSucceeded,
    isDashboardFilterViewCreationFailed,
    isDashboardFilterViewCreationSucceeded,
    isDashboardFilterViewDefaultStatusChangeFailed,
    isDashboardFilterViewDefaultStatusChangeSucceeded,
    isDashboardFilterViewDeletionFailed,
    isDashboardFilterViewDeletionSucceeded,
} from "./filters.js";
import {
    type ActionFailedErrorReason,
    type IDashboardCommandFailed,
    type IDashboardCommandFailedPayload,
    type IDashboardCommandRejected,
    type IDashboardCommandStarted,
    type IDashboardCommandStartedPayload,
    type IDashboardQueryCompleted,
    type IDashboardQueryCompletedPayload,
    type IDashboardQueryFailed,
    type IDashboardQueryFailedPayload,
    type IDashboardQueryRejected,
    type IDashboardQueryStarted,
    type IDashboardQueryStartedPayload,
    isDashboardCommandFailed,
    isDashboardCommandRejected,
    isDashboardCommandStarted,
    isDashboardQueryCompleted,
    isDashboardQueryFailed,
    isDashboardQueryRejected,
    isDashboardQueryStarted,
} from "./general.js";
import {
    type IDashboardInsightWidgetChanged,
    type IDashboardInsightWidgetChangedPayload,
    type IDashboardInsightWidgetDescriptionChanged,
    type IDashboardInsightWidgetDescriptionChangedPayload,
    type IDashboardInsightWidgetDrillsModified,
    type IDashboardInsightWidgetDrillsModifiedPayload,
    type IDashboardInsightWidgetDrillsRemoved,
    type IDashboardInsightWidgetDrillsRemovedPayload,
    type IDashboardInsightWidgetExportRequested,
    type IDashboardInsightWidgetExportRequestedPayload,
    type IDashboardInsightWidgetExportResolved,
    type IDashboardInsightWidgetExportResolvedPayload,
    type IDashboardInsightWidgetFilterSettingsChanged,
    type IDashboardInsightWidgetFilterSettingsChangedPayload,
    type IDashboardInsightWidgetHeaderChanged,
    type IDashboardInsightWidgetHeaderChangedPayload,
    type IDashboardInsightWidgetInsightSwitched,
    type IDashboardInsightWidgetInsightSwitchedPayload,
    type IDashboardInsightWidgetRefreshed,
    type IDashboardInsightWidgetRefreshedPayload,
    type IDashboardInsightWidgetVisConfigurationChanged,
    type IDashboardInsightWidgetVisConfigurationChangedPayload,
    type IDashboardInsightWidgetVisPropertiesChanged,
    type IDashboardInsightWidgetVisPropertiesChangedPayload,
    isDashboardInsightWidgetChanged,
    isDashboardInsightWidgetDescriptionChanged,
    isDashboardInsightWidgetDrillsModified,
    isDashboardInsightWidgetDrillsRemoved,
    isDashboardInsightWidgetExportRequested,
    isDashboardInsightWidgetExportResolved,
    isDashboardInsightWidgetFilterSettingsChanged,
    isDashboardInsightWidgetHeaderChanged,
    isDashboardInsightWidgetInsightSwitched,
    isDashboardInsightWidgetRefreshed,
    isDashboardInsightWidgetVisConfigurationChanged,
    isDashboardInsightWidgetVisPropertiesChanged,
} from "./insight.js";
import {
    type IDashboardKpiWidgetChanged,
    type IDashboardKpiWidgetChangedPayload,
    type IDashboardKpiWidgetComparisonChanged,
    type IDashboardKpiWidgetComparisonChangedPayload,
    type IDashboardKpiWidgetConfigurationChanged,
    type IDashboardKpiWidgetConfigurationChangedPayload,
    type IDashboardKpiWidgetDescriptionChanged,
    type IDashboardKpiWidgetDescriptionChangedPayload,
    type IDashboardKpiWidgetDrillRemoved,
    type IDashboardKpiWidgetDrillRemovedPayload,
    type IDashboardKpiWidgetDrillSet,
    type IDashboardKpiWidgetDrillSetPayload,
    type IDashboardKpiWidgetFilterSettingsChanged,
    type IDashboardKpiWidgetFilterSettingsChangedPayload,
    type IDashboardKpiWidgetHeaderChanged,
    type IDashboardKpiWidgetHeaderChangedPayload,
    type IDashboardKpiWidgetMeasureChanged,
    type IDashboardKpiWidgetMeasureChangedPayload,
    isDashboardKpiWidgetChanged,
    isDashboardKpiWidgetComparisonChanged,
    isDashboardKpiWidgetConfigurationChanged,
    isDashboardKpiWidgetDescriptionChanged,
    isDashboardKpiWidgetDrillRemoved,
    isDashboardKpiWidgetDrillSet,
    isDashboardKpiWidgetFilterSettingsChanged,
    isDashboardKpiWidgetHeaderChanged,
    isDashboardKpiWidgetMeasureChanged,
} from "./kpi.js";
import { type ICreateInsightRequested, createInsightRequested, isCreateInsightRequested } from "./lab.js";
import {
    type IDashboardLayoutChanged,
    type IDashboardLayoutChangedPayload,
    type IDashboardLayoutSectionAdded,
    type IDashboardLayoutSectionAddedPayload,
    type IDashboardLayoutSectionHeaderChanged,
    type IDashboardLayoutSectionHeaderChangedPayload,
    type IDashboardLayoutSectionItemMoved,
    type IDashboardLayoutSectionItemMovedPayload,
    type IDashboardLayoutSectionItemMovedToNewSection,
    type IDashboardLayoutSectionItemMovedToNewSectionPayload,
    type IDashboardLayoutSectionItemRemoved,
    type IDashboardLayoutSectionItemRemovedPayload,
    type IDashboardLayoutSectionItemReplaced,
    type IDashboardLayoutSectionItemReplacedPayload,
    type IDashboardLayoutSectionItemsAdded,
    type IDashboardLayoutSectionItemsAddedPayload,
    type IDashboardLayoutSectionMoved,
    type IDashboardLayoutSectionMovedPayload,
    type IDashboardLayoutSectionRemoved,
    type IDashboardLayoutSectionRemovedPayload,
    type ILayoutDirectionChanged,
    type ILayoutDirectionChangedPayload,
    type ILayoutSectionHeadersToggled,
    type ILayoutSectionHeadersToggledPayload,
    type IScreenSizeChanged,
    type IScreenSizeChangedPayload,
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
    isLayoutDirectionChanged,
    isLayoutSectionHeadersToggled,
    isScreenSizeChanged,
} from "./layout.js";
import {
    type DashboardAsyncRenderRequested,
    type DashboardAsyncRenderRequestedPayload,
    type DashboardAsyncRenderResolved,
    type DashboardAsyncRenderResolvedPayload,
    type DashboardRenderRequested,
    type DashboardRenderResolved,
    isDashboardAsyncRenderRequested,
    isDashboardAsyncRenderResolved,
    isDashboardRenderRequested,
    isDashboardRenderResolved,
} from "./render.js";
import {
    type IDashboardRenderModeChanged,
    type IDashboardRenderModeChangedPayload,
    isDashboardRenderModeChanged,
} from "./renderMode.js";
import {
    type IDashboardRichTextWidgetContentChanged,
    type IDashboardRichTextWidgetContentChangedPayload,
    type IDashboardRichTextWidgetFilterSettingsChanged,
    type IDashboardRichTextWidgetFilterSettingsChangedPayload,
    isDashboardRichTextWidgetContentChanged,
    isDashboardRichTextWidgetFilterSettingsChanged,
    richTextWidgetContentChanged,
    richTextWidgetFilterSettingsChanged,
} from "./richText.js";
import {
    type IDashboardAutomationsRefreshed,
    type IDashboardScheduledEmailCreated,
    type IDashboardScheduledEmailCreatedPayload,
    type IDashboardScheduledEmailSaved,
    isDashboardAutomationsRefreshed,
    isDashboardScheduledEmailCreated,
    isDashboardScheduledEmailSaved,
} from "./scheduledEmail.js";
import {
    type IShowWidgetAsTableSet,
    type IShowWidgetAsTableSetPayload,
    isShowWidgetAsTableSet,
    showWidgetAsTableSet,
} from "./showWidgetAsTable.js";
import {
    type IDashboardTabConvertedFromDefault,
    type IDashboardTabConvertedFromDefaultPayload,
    type IDashboardTabCreated,
    type IDashboardTabCreatedPayload,
    type IDashboardTabDeleted,
    type IDashboardTabDeletedPayload,
    type IDashboardTabRenamed,
    type IDashboardTabRenamedPayload,
    type IDashboardTabRenamingCanceled,
    type IDashboardTabRenamingCanceledPayload,
    type IDashboardTabRenamingStarted,
    type IDashboardTabRenamingStartedPayload,
    type IDashboardTabSwitched,
    type IDashboardTabSwitchedPayload,
    dashboardTabConvertedFromDefault,
    dashboardTabCreated,
    dashboardTabDeleted,
    dashboardTabRenamed,
    dashboardTabRenamingCanceled,
    dashboardTabRenamingStarted,
    dashboardTabSwitched,
    isDashboardTabConvertedFromDefault,
    isDashboardTabCreated,
    isDashboardTabDeleted,
    isDashboardTabRenamed,
    isDashboardTabRenamingCanceled,
    isDashboardTabRenamingStarted,
    isDashboardTabSwitched,
} from "./tabs.js";
import { type IDashboardUserInteractionTriggered } from "./userInteraction.js";
import {
    type IDashboardVisualizationSwitcherWidgetVisualizationAdded,
    type IDashboardVisualizationSwitcherWidgetVisualizationAddedPayload,
    type IDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    type IDashboardVisualizationSwitcherWidgetVisualizationsUpdatedPayload,
    isDashboardVisualizationSwitcherWidgetVisualizationAdded,
    isDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    visualizationSwitcherWidgetVisualizationAdded,
    visualizationSwitcherWidgetVisualizationsUpdated,
} from "./visualizationSwitcher.js";
import {
    type IDashboardWidgetExecutionFailed,
    type IDashboardWidgetExecutionFailedPayload,
    type IDashboardWidgetExecutionStarted,
    type IDashboardWidgetExecutionStartedPayload,
    type IDashboardWidgetExecutionSucceeded,
    type IDashboardWidgetExecutionSucceededPayload,
    isDashboardWidgetExecutionFailed,
    isDashboardWidgetExecutionStarted,
    isDashboardWidgetExecutionSucceeded,
} from "./widget.js";

export {
    type IDashboardEvent,
    type DashboardEventType,
    type ICustomDashboardEvent,
    type DashboardEventBody,
    isDashboardEvent,
    isCustomDashboardEvent,
    isDashboardEventOrCustomDashboardEvent,
} from "./base.js";

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
};

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
};

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
};

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
};

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
};

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
};

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
};

export {
    type IDashboardRichTextWidgetContentChanged,
    type IDashboardRichTextWidgetContentChangedPayload,
    type IDashboardRichTextWidgetFilterSettingsChanged,
    type IDashboardRichTextWidgetFilterSettingsChangedPayload,
    isDashboardRichTextWidgetContentChanged,
    richTextWidgetContentChanged,
    isDashboardRichTextWidgetFilterSettingsChanged,
    richTextWidgetFilterSettingsChanged,
};

export {
    type IDashboardVisualizationSwitcherWidgetVisualizationAdded,
    type IDashboardVisualizationSwitcherWidgetVisualizationAddedPayload,
    type IDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    type IDashboardVisualizationSwitcherWidgetVisualizationsUpdatedPayload,
    isDashboardVisualizationSwitcherWidgetVisualizationAdded,
    visualizationSwitcherWidgetVisualizationAdded,
    isDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    visualizationSwitcherWidgetVisualizationsUpdated,
};

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
};

export {
    type IDashboardAlertCreated,
    type IDashboardAlertCreatedPayload,
    type IDashboardAlertSaved,
    type IDashboardAlertSavedPayload,
    isDashboardAlertCreated,
    isDashboardAlertSaved,
};

export {
    type IDashboardScheduledEmailCreated,
    type IDashboardScheduledEmailCreatedPayload,
    type IDashboardScheduledEmailSaved,
    type IDashboardAutomationsRefreshed,
    isDashboardScheduledEmailCreated,
    isDashboardScheduledEmailSaved,
    isDashboardAutomationsRefreshed,
};

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
};

export {
    type IDrillTargetsAdded,
    type IDrillTargetsAddedPayload,
    drillTargetsAdded,
    isDrillTargetsAdded,
} from "./drillTargets.js";

export * from "./userInteraction.js";

export {
    type IShowWidgetAsTableSet,
    type IShowWidgetAsTableSetPayload,
    isShowWidgetAsTableSet,
    showWidgetAsTableSet,
};

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
};

export {
    type IDashboardRenderModeChanged,
    type IDashboardRenderModeChangedPayload,
    isDashboardRenderModeChanged,
};

export { type ICreateInsightRequested, createInsightRequested, isCreateInsightRequested };

export {
    type ICreateAttributeHierarchyRequested,
    type IDeleteAttributeHierarchyRequested,
    createAttributeHierarchyRequested,
    isCreateAttributeHierarchyRequested,
    deleteAttributeHierarchyRequested,
    isDeleteAttributeHierarchyRequested,
};

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
