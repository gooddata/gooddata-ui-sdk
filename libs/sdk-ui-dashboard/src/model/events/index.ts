// (C) 2021-2022 GoodData Corporation
import {
    DashboardInitialized,
    DashboardDeinitialized,
    DashboardSaved,
    DashboardCopySaved,
    DateFilterValidationFailed,
    DashboardRenamed,
    DashboardWasReset,
    DashboardExportToPdfResolved,
    DashboardExportToPdfRequested,
    DashboardSharingChanged,
} from "./dashboard";
import {
    DashboardCommandFailed,
    DashboardCommandRejected,
    DashboardCommandStarted,
    DashboardQueryCompleted,
    DashboardQueryFailed,
    DashboardQueryRejected,
    DashboardQueryStarted,
} from "./general";
import {
    DashboardAttributeFilterAdded,
    DashboardAttributeFilterMoved,
    DashboardAttributeFilterParentChanged,
    DashboardAttributeFilterRemoved,
    DashboardAttributeFilterSelectionChanged,
    DashboardDateFilterSelectionChanged,
    DashboardFilterContextChanged,
} from "./filters";
import {
    DashboardLayoutChanged,
    DashboardLayoutSectionAdded,
    DashboardLayoutSectionHeaderChanged,
    DashboardLayoutSectionItemMoved,
    DashboardLayoutSectionItemRemoved,
    DashboardLayoutSectionItemReplaced,
    DashboardLayoutSectionItemsAdded,
    DashboardLayoutSectionMoved,
    DashboardLayoutSectionRemoved,
} from "./layout";
import {
    DashboardKpiWidgetChanged,
    DashboardKpiWidgetComparisonChanged,
    DashboardKpiWidgetFilterSettingsChanged,
    DashboardKpiWidgetHeaderChanged,
    DashboardKpiWidgetMeasureChanged,
} from "./kpi";
import {
    DashboardInsightWidgetChanged,
    DashboardInsightWidgetDrillsModified,
    DashboardInsightWidgetDrillsRemoved,
    DashboardInsightWidgetFilterSettingsChanged,
    DashboardInsightWidgetHeaderChanged,
    DashboardInsightWidgetInsightSwitched,
    DashboardInsightWidgetVisPropertiesChanged,
    DashboardInsightWidgetExportRequested,
    DashboardInsightWidgetExportResolved,
} from "./insight";
import {
    DashboardWidgetExecutionStarted,
    DashboardWidgetExecutionSucceeded,
    DashboardWidgetExecutionFailed,
} from "./widget";
import { DashboardAlertCreated, DashboardAlertUpdated, DashboardAlertsRemoved } from "./alerts";
import { DashboardScheduledEmailCreated, DashboardScheduledEmailSaved } from "./scheduledEmail";
import { DashboardUserInteractionTriggered } from "./userInteraction";
import { Action } from "@reduxjs/toolkit";
import {
    DashboardRenderRequested,
    DashboardAsyncRenderRequested,
    DashboardAsyncRenderResolved,
    DashboardRenderResolved,
} from "./render";
import {
    DashboardDrillRequested,
    DashboardDrillResolved,
    DashboardDrillDownRequested,
    DashboardDrillDownResolved,
    DashboardDrillToAttributeUrlRequested,
    DashboardDrillToAttributeUrlResolved,
    DashboardDrillToCustomUrlRequested,
    DashboardDrillToCustomUrlResolved,
    DashboardDrillToInsightRequested,
    DashboardDrillToInsightResolved,
    DashboardDrillToDashboardRequested,
    DashboardDrillToDashboardResolved,
    DashboardDrillToLegacyDashboardRequested,
    DashboardDrillToLegacyDashboardResolved,
    DashboardDrillableItemsChanged,
} from "./drill";
import { DashboardRenderModeChanged } from "./ui";

export {
    IDashboardEvent,
    DashboardEventType,
    isDashboardEvent,
    ICustomDashboardEvent,
    isCustomDashboardEvent,
    isDashboardEventOrCustomDashboardEvent,
    DashboardEventBody,
} from "./base";

export {
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
} from "./dashboard";

export {
    DashboardCommandStarted,
    DashboardCommandStartedPayload,
    DashboardCommandRejected,
    DashboardCommandFailed,
    DashboardCommandFailedPayload,
    ActionFailedErrorReason,
    isDashboardCommandStarted,
    isDashboardCommandFailed,
    DashboardQueryRejected,
    DashboardQueryFailed,
    DashboardQueryFailedPayload,
    DashboardQueryStarted,
    DashboardQueryStartedPayload,
    DashboardQueryCompleted,
    DashboardQueryCompletedPayload,
    isDashboardQueryFailed,
    isDashboardCommandRejected,
    isDashboardQueryCompleted,
    isDashboardQueryRejected,
    isDashboardQueryStarted,
} from "./general";

export {
    DashboardDateFilterSelectionChanged,
    DashboardAttributeFilterSelectionChangedPayload,
    DashboardFilterContextChanged,
    DashboardFilterContextChangedPayload,
    DashboardAttributeFilterParentChanged,
    DashboardAttributeFilterParentChangedPayload,
    DashboardAttributeFilterRemoved,
    DashboardAttributeFilterRemovedPayload,
    DashboardAttributeFilterSelectionChanged,
    DashboardDateFilterSelectionChangedPayload,
    DashboardAttributeFilterMoved,
    DashboardAttributeFilterMovedPayload,
    DashboardAttributeFilterAdded,
    DashboardAttributeFilterAddedPayload,
    isDashboardAttributeFilterAdded,
    isDashboardAttributeFilterMoved,
    isDashboardAttributeFilterParentChanged,
    isDashboardAttributeFilterRemoved,
    isDashboardAttributeFilterSelectionChanged,
    isDashboardDateFilterSelectionChanged,
    isDashboardFilterContextChanged,
} from "./filters";

export {
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
    DashboardLayoutChanged,
    DashboardLayoutChangedPayload,
    isDashboardLayoutChanged,
    isDashboardLayoutSectionAdded,
    isDashboardLayoutSectionHeaderChanged,
    isDashboardLayoutSectionItemMoved,
    isDashboardLayoutSectionItemRemoved,
    isDashboardLayoutSectionItemReplaced,
    isDashboardLayoutSectionItemsAdded,
    isDashboardLayoutSectionMoved,
    isDashboardLayoutSectionRemoved,
} from "./layout";

export {
    DashboardKpiWidgetHeaderChanged,
    DashboardKpiWidgetHeaderChangedPayload,
    DashboardKpiWidgetMeasureChanged,
    DashboardKpiWidgetMeasureChangedPayload,
    DashboardKpiWidgetFilterSettingsChanged,
    DashboardKpiWidgetFilterSettingsChangedPayload,
    DashboardKpiWidgetComparisonChanged,
    DashboardKpiWidgetComparisonChangedPayload,
    DashboardKpiWidgetChanged,
    DashboardKpiWidgetChangedPayload,
    isDashboardKpiWidgetChanged,
    isDashboardKpiWidgetComparisonChanged,
    isDashboardKpiWidgetFilterSettingsChanged,
    isDashboardKpiWidgetHeaderChanged,
    isDashboardKpiWidgetMeasureChanged,
} from "./kpi";

export {
    DashboardInsightWidgetHeaderChanged,
    DashboardInsightWidgetHeaderChangedPayload,
    DashboardInsightWidgetFilterSettingsChanged,
    DashboardInsightWidgetFilterSettingsChangedPayload,
    DashboardInsightWidgetVisPropertiesChanged,
    DashboardInsightWidgetVisPropertiesChangedPayload,
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
    isDashboardInsightWidgetChanged,
    isDashboardInsightWidgetDrillsModified,
    isDashboardInsightWidgetDrillsRemoved,
    isDashboardInsightWidgetFilterSettingsChanged,
    isDashboardInsightWidgetHeaderChanged,
    isDashboardInsightWidgetInsightSwitched,
    isDashboardInsightWidgetVisPropertiesChanged,
    isDashboardInsightWidgetExportRequested,
    isDashboardInsightWidgetExportResolved,
} from "./insight";

export {
    DashboardWidgetExecutionStarted,
    DashboardWidgetExecutionStartedPayload,
    DashboardWidgetExecutionSucceeded,
    DashboardWidgetExecutionSucceededPayload,
    DashboardWidgetExecutionFailed,
    DashboardWidgetExecutionFailedPayload,
    isDashboardWidgetExecutionStarted,
    isDashboardWidgetExecutionSucceeded,
    isDashboardWidgetExecutionFailed,
} from "./widget";

export {
    DashboardAlertCreated,
    DashboardAlertCreatedPayload,
    DashboardAlertsRemoved,
    DashboardAlertsRemovedPayload,
    DashboardAlertUpdated,
    DashboardAlertUpdatedPayload,
    isDashboardAlertCreated,
    isDashboardAlertsRemoved,
    isDashboardAlertUpdated,
} from "./alerts";

export {
    DashboardScheduledEmailCreated,
    DashboardScheduledEmailCreatedPayload,
    isDashboardScheduledEmailCreated,
    DashboardScheduledEmailSaved,
    isDashboardScheduledEmailSaved,
} from "./scheduledEmail";

export {
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
} from "./drill";

export {
    DrillTargetsAdded,
    DrillTargetsAddedPayload,
    drillTargetsAdded,
    isDrillTargetsAdded,
} from "./drillTargets";

export * from "./userInteraction";

export {
    DashboardRenderRequested,
    DashboardAsyncRenderRequestedPayload,
    DashboardAsyncRenderRequested,
    DashboardAsyncRenderResolved,
    DashboardAsyncRenderResolvedPayload,
    DashboardRenderResolved,
    isDashboardAsyncRenderRequested,
    isDashboardAsyncRenderResolved,
    isDashboardRenderRequested,
    isDashboardRenderResolved,
} from "./render";

export {
    DashboardRenderModeChanged,
    DashboardRenderModeChangedPayload,
    isDashboardRenderModeChanged,
} from "./ui";

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
    | DashboardInitialized
    | DashboardDeinitialized
    | DateFilterValidationFailed
    | DashboardCommandStarted<any>
    | DashboardCommandFailed<any>
    | DashboardCommandRejected
    | DashboardQueryFailed
    | DashboardQueryRejected
    | DashboardQueryStarted
    | DashboardQueryCompleted<any, any>
    | DashboardSaved
    | DashboardCopySaved
    | DashboardRenamed
    | DashboardWasReset
    | DashboardRenderModeChanged
    | DashboardExportToPdfRequested
    | DashboardExportToPdfResolved
    | DashboardRenderRequested
    | DashboardAsyncRenderRequested
    | DashboardAsyncRenderResolved
    | DashboardRenderResolved
    | DashboardUserInteractionTriggered
    | DashboardDateFilterSelectionChanged
    | DashboardAttributeFilterAdded
    | DashboardAttributeFilterRemoved
    | DashboardAttributeFilterMoved
    | DashboardAttributeFilterSelectionChanged
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
    | DashboardLayoutChanged
    | DashboardKpiWidgetHeaderChanged
    | DashboardKpiWidgetMeasureChanged
    | DashboardKpiWidgetFilterSettingsChanged
    | DashboardKpiWidgetComparisonChanged
    | DashboardKpiWidgetChanged
    | DashboardInsightWidgetHeaderChanged
    | DashboardInsightWidgetFilterSettingsChanged
    | DashboardInsightWidgetVisPropertiesChanged
    | DashboardInsightWidgetInsightSwitched
    | DashboardInsightWidgetDrillsModified
    | DashboardInsightWidgetDrillsRemoved
    | DashboardInsightWidgetChanged
    | DashboardInsightWidgetExportRequested
    | DashboardInsightWidgetExportResolved
    | DashboardWidgetExecutionStarted
    | DashboardWidgetExecutionSucceeded
    | DashboardWidgetExecutionFailed
    | DashboardAlertCreated
    | DashboardAlertsRemoved
    | DashboardAlertUpdated
    | DashboardScheduledEmailCreated
    | DashboardScheduledEmailSaved
    | DashboardDrillDownResolved
    | DashboardDrillToAttributeUrlResolved
    | DashboardDrillToCustomUrlResolved
    | DashboardDrillToDashboardResolved
    | DashboardDrillToInsightResolved
    | DashboardDrillToLegacyDashboardResolved
    | DashboardDrillResolved
    | DashboardDrillDownRequested
    | DashboardDrillToAttributeUrlRequested
    | DashboardDrillToCustomUrlRequested
    | DashboardDrillToDashboardRequested
    | DashboardDrillToInsightRequested
    | DashboardDrillToLegacyDashboardRequested
    | DashboardDrillRequested
    | DashboardDrillableItemsChanged
    | DashboardSharingChanged;

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
