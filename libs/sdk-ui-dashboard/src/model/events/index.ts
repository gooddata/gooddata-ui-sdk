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
import { type IShowWidgetAsTableSet } from "./showWidgetAsTable.js";
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
