// (C) 2021 GoodData Corporation
import {
    DashboardLoaded,
    DashboardSaved,
    DateFilterValidationFailed,
    DashboardCopySaved,
    DashboardRenamed,
    DashboardWasReset,
} from "./dashboard";
import {
    DashboardCommandFailed,
    DashboardCommandRejected,
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
    DashboardKpiWidgetExecutionFailed,
} from "./kpi";
import {
    DashboardInsightWidgetChanged,
    DashboardInsightWidgetDrillsModified,
    DashboardInsightWidgetDrillsRemoved,
    DashboardInsightWidgetFilterSettingsChanged,
    DashboardInsightWidgetHeaderChanged,
    DashboardInsightWidgetInsightSwitched,
    DashboardInsightWidgetVisPropertiesChanged,
    DashboardInsightWidgetExecutionFailed,
} from "./insight";
import { DashboardAlertCreated, DashboardAlertUpdated, DashboardAlertRemoved } from "./alerts";
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
    DashboardDrillDownResolved,
    DashboardDrillToAttributeUrlResolved,
    DashboardDrillToCustomUrlResolved,
    DashboardDrillToDashboardResolved,
    DashboardDrillToInsightResolved,
    DashboardDrillToLegacyDashboardResolved,
    DashboardDrillResolved,
    DashboardDrillDownRequested,
    DashboardDrillToAttributeUrlRequested,
    DashboardDrillToCustomUrlRequested,
    DashboardDrillToDashboardRequested,
    DashboardDrillToInsightRequested,
    DashboardDrillToLegacyDashboardRequested,
    DashboardDrillRequested,
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
    DashboardLoaded,
    DashboardSaved,
    DashboardCopySaved,
    DashboardRenamed,
    DashboardWasReset,
} from "./dashboard";
export {
    DashboardCommandRejected,
    DashboardCommandFailed,
    ActionFailedErrorReason,
    isDashboardCommandFailed,
    DashboardQueryRejected,
    DashboardQueryFailed,
    DashboardQueryStarted,
    DashboardQueryCompleted,
    isDashboardQueryFailed,
} from "./general";

export {
    DashboardDateFilterSelectionChanged,
    DashboardFilterContextChanged,
    DashboardAttributeFilterParentChanged,
    DashboardAttributeFilterRemoved,
    DashboardAttributeFilterSelectionChanged,
    DashboardAttributeFilterMoved,
    DashboardAttributeFilterAdded,
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
} from "./layout";

export {
    DashboardKpiWidgetHeaderChanged,
    DashboardKpiWidgetMeasureChanged,
    DashboardKpiWidgetFilterSettingsChanged,
    DashboardKpiWidgetComparisonChanged,
    DashboardKpiWidgetChanged,
    DashboardKpiWidgetExecutionFailed,
    kpiWidgetExecutionFailed,
} from "./kpi";

export {
    DashboardInsightWidgetHeaderChanged,
    DashboardInsightWidgetFilterSettingsChanged,
    DashboardInsightWidgetVisPropertiesChanged,
    DashboardInsightWidgetInsightSwitched,
    DashboardInsightWidgetDrillsModified,
    DashboardInsightWidgetDrillsRemoved,
    DashboardInsightWidgetChanged,
    DashboardInsightWidgetExecutionFailed,
    insightWidgetExecutionFailed,
} from "./insight";
export { DashboardAlertCreated, DashboardAlertRemoved, DashboardAlertUpdated } from "./alerts";
export { DashboardScheduledEmailCreated } from "./scheduledEmail";
export {
    DashboardDrillDownRequested,
    DashboardDrillToAttributeUrlRequested,
    DashboardDrillToCustomUrlRequested,
    DashboardDrillToDashboardRequested,
    DashboardDrillToInsightRequested,
    DashboardDrillToLegacyDashboardRequested,
    DashboardDrillRequested,
    drillDownRequested,
    drillToAttributeUrlRequested,
    drillToCustomUrlRequested,
    drillToDashboardRequested,
    drillToInsightRequested,
    drillToLegacyDashboardRequested,
    drillRequested,
    DashboardDrillResolved,
    drillResolved,
    DashboardDrillDownResolved,
    DashboardDrillToAttributeUrlResolved,
    DashboardDrillToCustomUrlResolved,
    DashboardDrillToDashboardResolved,
    DashboardDrillToInsightResolved,
    DashboardDrillToLegacyDashboardResolved,
    drillDownResolved,
    drillToAttributeUrlResolved,
    drillToCustomUrlResolved,
    drillToDashboardResolved,
    drillToInsightResolved,
    drillToLegacyDashboardResolved,
} from "./drill";

export { DrillTargetsAdded, drillTargetsAdded } from "./drillTargets";

export * from "./userInteraction";
export {
    DashboardRenderRequested,
    DashboardAsyncRenderRequested,
    DashboardAsyncRenderResolved,
    DashboardRenderResolved,
    asyncRenderRequested,
    asyncRenderResolved,
    renderRequested,
    renderResolved,
} from "./render";
/**
 * @alpha
 */
export type DashboardEvents =
    | DashboardLoaded
    | DateFilterValidationFailed
    | DashboardCommandFailed
    | DashboardCommandRejected
    | DashboardQueryFailed
    | DashboardQueryRejected
    | DashboardQueryStarted
    | DashboardQueryCompleted<any, any>
    | DashboardSaved
    | DashboardCopySaved
    | DashboardRenamed
    | DashboardWasReset
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
    | DashboardKpiWidgetExecutionFailed
    | DashboardInsightWidgetHeaderChanged
    | DashboardInsightWidgetFilterSettingsChanged
    | DashboardInsightWidgetVisPropertiesChanged
    | DashboardInsightWidgetInsightSwitched
    | DashboardInsightWidgetDrillsModified
    | DashboardInsightWidgetDrillsRemoved
    | DashboardInsightWidgetChanged
    | DashboardInsightWidgetExecutionFailed
    | DashboardAlertCreated
    | DashboardAlertRemoved
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
    | DashboardDrillRequested;

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
