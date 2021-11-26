// (C) 2021 GoodData Corporation
import {
    DashboardInitialized,
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
import { DashboardScheduledEmailCreated } from "./scheduledEmail";
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
    DateFilterValidationResult,
    DashboardInitialized,
    DashboardSaved,
    DashboardCopySaved,
    DashboardRenamed,
    DashboardWasReset,
    DashboardDeleted,
    DashboardExportToPdfRequested,
    DashboardExportToPdfResolved,
    DashboardSharingChanged,
    isDashboardSaved,
    isDashboardCopySaved,
    isDashboardInitialized,
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
    DashboardCommandRejected,
    DashboardCommandFailed,
    ActionFailedErrorReason,
    isDashboardCommandStarted,
    isDashboardCommandFailed,
    DashboardQueryRejected,
    DashboardQueryFailed,
    DashboardQueryStarted,
    DashboardQueryCompleted,
    isDashboardQueryFailed,
    isDashboardCommandRejected,
    isDashboardQueryCompleted,
    isDashboardQueryRejected,
    isDashboardQueryStarted,
} from "./general";

export {
    DashboardDateFilterSelectionChanged,
    DashboardFilterContextChanged,
    DashboardAttributeFilterParentChanged,
    DashboardAttributeFilterRemoved,
    DashboardAttributeFilterSelectionChanged,
    DashboardAttributeFilterMoved,
    DashboardAttributeFilterAdded,
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
    DashboardLayoutSectionMoved,
    DashboardLayoutSectionRemoved,
    DashboardLayoutSectionHeaderChanged,
    DashboardLayoutSectionItemsAdded,
    DashboardLayoutSectionItemReplaced,
    DashboardLayoutSectionItemMoved,
    DashboardLayoutSectionItemRemoved,
    DashboardLayoutChanged,
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
    DashboardKpiWidgetMeasureChanged,
    DashboardKpiWidgetFilterSettingsChanged,
    DashboardKpiWidgetComparisonChanged,
    DashboardKpiWidgetChanged,
    isDashboardKpiWidgetChanged,
    isDashboardKpiWidgetComparisonChanged,
    isDashboardKpiWidgetFilterSettingsChanged,
    isDashboardKpiWidgetHeaderChanged,
    isDashboardKpiWidgetMeasureChanged,
} from "./kpi";

export {
    DashboardInsightWidgetHeaderChanged,
    DashboardInsightWidgetFilterSettingsChanged,
    DashboardInsightWidgetVisPropertiesChanged,
    DashboardInsightWidgetInsightSwitched,
    DashboardInsightWidgetDrillsModified,
    DashboardInsightWidgetDrillsRemoved,
    DashboardInsightWidgetChanged,
    DashboardInsightWidgetExportRequested,
    DashboardInsightWidgetExportResolved,
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
    DashboardWidgetExecutionSucceeded,
    DashboardWidgetExecutionFailed,
    isDashboardWidgetExecutionStarted,
    isDashboardWidgetExecutionSucceeded,
    isDashboardWidgetExecutionFailed,
} from "./widget";
export {
    DashboardAlertCreated,
    DashboardAlertsRemoved,
    DashboardAlertUpdated,
    isDashboardAlertCreated,
    isDashboardAlertsRemoved,
    isDashboardAlertUpdated,
} from "./alerts";
export { DashboardScheduledEmailCreated, isDashboardScheduledEmailCreated } from "./scheduledEmail";
export {
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

export { DrillTargetsAdded, drillTargetsAdded, isDrillTargetsAdded } from "./drillTargets";

export * from "./userInteraction";
export {
    DashboardRenderRequested,
    DashboardAsyncRenderRequested,
    DashboardAsyncRenderResolved,
    DashboardRenderResolved,
    isDashboardAsyncRenderRequested,
    isDashboardAsyncRenderResolved,
    isDashboardRenderRequested,
    isDashboardRenderResolved,
} from "./render";

/**
 * Union type that contains all available built-in dashboard events.
 *
 * Note: while this type is marked as public most of the events are currently an alpha-level API that
 * we reserve to change in the following releases. If you use those events now, upgrading to the next
 * version of `@gooddata/sdk-ui-dashboard` will likely result in breakage.
 *
 * @public
 */
export type DashboardEvents =
    | DashboardInitialized
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
