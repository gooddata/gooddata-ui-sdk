// (C) 2007-2026 GoodData Corporation

import invariant from "invariant";
import { partial, pick } from "lodash-es";

import { type IInsightDefinition } from "@gooddata/sdk-model";

import { ATTRIBUTE } from "../../constants/bucket.js";
import { getReportSummary } from "../../selectors/report_selector.js";
import { getReportId, getRouteProjectId, getSourceInsightId } from "../../selectors/route_selector.js";
import { hasDescriptionChanged } from "../../selectors/save_report_selector.js";
import { type IAppState } from "../../store/types.js";
import type { ITotal } from "../../typings/state_objects.js";
import { findDifferentTotal, getTotalName, isSubtotalAttribute } from "../../utils/telemetry/tableTotals.js";
import { getBucketByLocalIdentifier } from "../buckets_service.js";

import { getCustomDimensions } from "./custom_dimensions.js";
import { type InsightStats, getInsightStats, getWorkspaceId } from "./custom_variables.js";
import {
    type AbstractAnalyticsTracker,
    AccumulatingTracker,
    HostForwardingTracker,
    type IEventTrackingPayload,
    type IHostTelemetryCallbacks,
    type IPageViewTrackingPayload,
    type ITimingTrackingPayload,
    TelemetryTracker,
} from "./tracker.js";

interface ILogConfig {
    page?: string;
    timing?: boolean;
    event?: boolean;
    action?: string;
    label?: string;
    value?: number | string;
}

const logConfigs: Record<string, ILogConfig> = {
    access: {
        page: "",
        timing: false,
        event: false,
    },
    open: {
        page: "/open",
        action: "visualization open",
        label: "success",
    },
    clear: {
        page: "",
        timing: false,
        action: "analytical designer clear",
        label: "success",
    },
    clearInsight: {
        action: "clears insight",
    },
    openAsReport: {
        action: "visualization open as report",
        label: "success",
    },
    exportResult: {
        action: "report export result",
        label: "success",
    },
    savedAsNew: {
        action: "visualization save as new",
        label: "success",
    },
    savedAsNewFromKD: {
        action: "visualization save as new from KD",
        label: "success",
    },
    updated: {
        action: "visualization update",
        label: "success",
    },
    updatedFromKD: {
        action: "visualization update from KD",
        label: "success",
    },
    firstSave: {
        action: "visualization save",
        label: "success",
    },
    firstSaveFromKD: {
        action: "visualization save from KD",
        label: "success",
    },
    saveAsNewFailed: {
        action: "visualization save as new",
        label: "failed",
    },
    saveAsNewFromKDFailed: {
        action: "visualization save as new from KD",
        label: "failed",
    },
    updateFailed: {
        action: "visualization update",
        label: "failed",
    },
    updateFromKDFailed: {
        action: "visualization update from KD",
        label: "failed",
    },
    firstSaveFailed: {
        action: "visualization save",
        label: "failed",
    },
    firstSaveFromKDFailed: {
        action: "visualization save from KD",
        label: "failed",
    },
    firstExecution: {
        page: "/ad-hoc",
        timing: false,
        event: false,
    },
    executed: {
        action: "visualization execute",
        label: "success",
    },
    executionFailed: {
        action: "visualization execute",
        label: "failed",
    },
    deleted: {
        action: "visualization delete",
        label: "success",
    },
    deleteFailed: {
        action: "visualization delete",
        label: "failed",
    },
    drillableItemsReceived: {
        action: "drillable items received",
        timing: false,
        label: "success",
    },
    positiveAttributeFilterApplied: {
        action: "attribute filter applied",
        timing: false,
        label: "positive filter",
    },
    negativeAttributeFilterApplied: {
        action: "attribute filter applied",
        timing: false,
        label: "negative filter",
    },
    textAttributeFilterApplied: {
        action: "attribute filter applied",
        timing: false,
        label: "text filter",
    },
    logAddTextFilterToInsight: {
        action: "adds filter into insight",
        label: "text filter",
    },
    logPoweredByGDClickedAdmin: {
        action: "freemium company logo clicked",
        label: "admin",
    },
    logPoweredByGDClickedNonAdmin: {
        action: "freemium company logo clicked",
        label: "non-admin",
    },
    logApproximateCountUsed: {
        action: "approximate count used",
        timing: false,
    },
    logDataSamplingEnabled: {
        action: "data sampling enabled",
        timing: false,
    },
    logDataSamplingPercentageChanged: {
        action: "data sampling percentage changed",
        timing: false,
    },
    logDataSamplingDisabled: {
        action: "data sampling disabled",
        timing: false,
    },
    logEmbedDialogCodeByReactCopied: {
        action: "embed dialog generated code copied",
        label: "code by react",
    },
    logEmbedDialogCodeByWebComponentsCopied: {
        action: "embed dialog generated code copied",
        label: "code by web components",
    },
    logEmbedDialogOpen: {
        action: "embed dialog open",
        label: "embed dialog",
    },
    logAdFullyInitialized: {
        action: "analytical designer fully initialized",
        label: "time in milliseconds",
    },
    logEmptyAdFullyInitializedInactiveWindow: {
        action: "analytical designer fully initialized in inactive window",
        label: "time in milliseconds",
    },
    logEmptyAdFullyInitialized: {
        action: "empty analytical designer fully initialized",
        label: "time in milliseconds",
    },
    logAdFullyInitializedInactiveWindow: {
        action: "empty analytical designer fully initialized in inactive window",
        label: "time in milliseconds",
    },
    logDescriptionChanged: {
        action: "insight description changed",
        label: "description length",
    },
    logDescriptionTooltipOpened: {
        action: "description tooltip opened",
        label: "description length",
    },
    logTooManyDataPoints: {
        action: "visualization execute",
        label: "too many data points",
    },
    logTableRowSubtotalAdded: {
        action: "table row subtotal added",
        label: "subtotal type",
    },
    logTableColumnSubtotalAdded: {
        action: "table column subtotal added",
        label: "subtotal type",
    },
    logTableRowAggregationAdded: {
        action: "table row aggregation added",
        label: "total type",
    },
    logTableColumnAggregationAdded: {
        action: "table column aggregation added",
        label: "total type",
    },
    logTableRowSubtotalRemoved: {
        action: "table row subtotal removed",
        label: "subtotal type",
    },
    logTableColumnSubtotalRemoved: {
        action: "table column subtotal removed",
        label: "subtotal type",
    },
    logTableRowAggregationRemoved: {
        action: "table row aggregation removed",
        label: "total type",
    },
    logTableColumnAggregationRemoved: {
        action: "table column aggregation removed",
        label: "total type",
    },
    firstContentfulPaintInMs: {
        action: "first contentful paint in ms",
        label: "time in milliseconds",
    },
    largestContentfulPaintInMs: {
        action: "largest contentful paint in ms",
        label: "time in milliseconds",
    },
    logChooseVisualizationType: {
        action: "choose visualization type",
    },
    logAddFilterToinsight: {
        action: "adds filter into insight",
    },
    logFactOrAttributeAdded: {
        action: "adds fact or attribute to canvas",
    },
    logClickOnCreateMetric: {
        action: "clicks on create metric",
        label: "metric editor",
    },
    logCreateMetric: {
        action: "metric saved and closed",
        label: "metric editor",
    },
    logEditMetric: {
        action: "edits metric",
        label: "metric editor",
    },
    logDeleteMetric: {
        action: "removes metric",
        label: "metric editor",
    },
    logMetricCreated: {
        action: "creates metric",
        label: "metric editor",
    },
    logInviteUser: {
        action: "invites user",
        label: "dialogs",
    },
    logOpenInviteUserDialog: {
        action: "opens invite user dialog",
        label: "dialogs",
    },
    insightCreated: {
        action: "creates insight",
    },
    insightCreatedFailed: {
        action: "fails to create insight",
    },
    editInsight: {
        action: "edits insight",
        label: "insight",
    },
    createInsight: {
        action: "creates insight",
    },
};

function logEvent(
    eventName: string,
    {
        state,
        time,
        insightStats,
        dataSamplingPercentage,
        value,
    }: {
        state: IAppState;
        time?: number;
        insightStats?: InsightStats;
        dataSamplingPercentage?: number;
        value?: number | string;
    },
) {
    const logConfig = logConfigs[eventName];

    invariant(logConfig, `Log config for tracking event '${eventName}' was not found.`);

    const customDimensions = getCustomDimensions(state);

    // fallback to route project id in case we're logging before bootstrap data have arrived
    const workspaceId = getWorkspaceId(state) || getRouteProjectId(state);
    const reportId = getReportId(state);

    if (typeof logConfig.page !== "undefined") {
        const payload: IPageViewTrackingPayload = {
            _type: "page",
            page: logConfig.page,
            workspaceId,
            reportId,
            ...customDimensions,
        };

        telemetryTracker.trackPageView(payload);
    }

    if (logConfig.timing !== false) {
        // Note: timing does not include custom dimensions. Not sure why is it like that however the previous
        // code looked like it had this by design.
        const payload: ITimingTrackingPayload = {
            _type: "timing",
            variable: logConfig.action,
            label: logConfig.label,
            value: time,
        };

        telemetryTracker.trackTiming(payload);
    }

    if (logConfig.event !== false) {
        // every event-enabled config carries `action`; `label` may be absent (pre-existing)
        const payload = {
            _type: "event",
            ...pick(logConfig, "action", "label", "value"),
            ...customDimensions,
            insightStats,
            dataSamplingPercentage,
            workspaceId,
            reportId,
            value,
        } as IEventTrackingPayload;

        telemetryTracker.trackEvent(payload);
    }
}

export const logAccessingAD = partial(logEvent, "access");
export const logVisualizationOpen = partial(logEvent, "open");
export const logADClear = partial(logEvent, "clear");
export const logADClearInsight = partial(logEvent, "clearInsight");
export const logExportResult = partial(logEvent, "exportResult");
export const logOpenAsReport = partial(logEvent, "openAsReport");
export const logPoweredByGDClickedAdmin = partial(logEvent, "logPoweredByGDClickedAdmin");
export const logPoweredByGDClickedNonAdmin = partial(logEvent, "logPoweredByGDClickedNonAdmin");
export const logVisualizationExecuted = partial(logEvent, "executed");
export const logVisualizationExecutionFailed = partial(logEvent, "executionFailed");
export const logVisualizationDeleted = partial(logEvent, "deleted");
export const logVisualizationDeleteFailed = partial(logEvent, "deleteFailed");
export const logDrillableItemsReceived = partial(logEvent, "drillableItemsReceived");
export const logApproximateCountUsed = partial(logEvent, "logApproximateCountUsed");
export const logDataSamplingEnabled = partial(logEvent, "logDataSamplingEnabled");
export const logDataSamplingPercentageChanged = partial(logEvent, "logDataSamplingPercentageChanged");
export const logDataSamplingDisabled = partial(logEvent, "logDataSamplingDisabled");
export const logEmbedDialogCodeByReactCopied = partial(logEvent, "logEmbedDialogCodeByReactCopied");
export const logEmbedDialogCodeByWebComponentsCopied = partial(
    logEvent,
    "logEmbedDialogCodeByWebComponentsCopied",
);
export const logEmbedDialogOpen = partial(logEvent, "logEmbedDialogOpen");
export const logEmptyAdFullyInitialized = partial(logEvent, "logEmptyAdFullyInitialized");
export const logEmptyAdFullyInitializedInactiveWindow = partial(
    logEvent,
    "logEmptyAdFullyInitializedInactiveWindow",
);
export const logAdFullyInitialized = partial(logEvent, "logAdFullyInitialized");
export const logAdFullyInitializedInactiveWindow = partial(logEvent, "logAdFullyInitializedInactiveWindow");

export const logOpenDescriptionTooltip = ({
    state,
    description,
}: {
    state: IAppState;
    description: string;
}) => {
    logEvent("logDescriptionTooltipOpened", { state, value: description.length });
};

export const logChooseVisualizationType = partial(logEvent, "logChooseVisualizationType");

export const logAddFilterToInsight = partial(logEvent, "logAddFilterToinsight");
export const logAddTextFilterToInsight = partial(logEvent, "logAddTextFilterToInsight");

export const logFactOrAttributeAdded = partial(logEvent, "logFactOrAttributeAdded");

export const logClickOnCreateMetric = partial(logEvent, "logClickOnCreateMetric");

export const logDeleteMetric = partial(logEvent, "logDeleteMetric");

export const logMetricCreated = partial(logEvent, "logMetricCreated");

export const logInviteUser = partial(logEvent, "logInviteUser");

export const logOpenInviteUserDialog = partial(logEvent, "logOpenInviteUserDialog");

export const logInsightCreatedFailed = partial(logEvent, "insightCreatedFailed");

export const logInsightCreated = partial(logEvent, "insightCreated");

type FormMode = "new" | "edit";
export function logCreateOrEditMetric({ state, mode }: { state: IAppState; mode: FormMode }) {
    if (mode === "new") {
        logEvent("logCreateMetric", { state });
    } else {
        logEvent("logEditMetric", { state });
    }
}

export function logInsightSavedOrEdited({ state, isUpdate }: { state: IAppState; isUpdate: boolean }) {
    if (isUpdate) {
        logEvent("editInsight", { state });
    } else {
        logEvent("createInsight", { state });
    }
}

export function logVisualizationSaved({
    state,
    time,
    saveAsNew,
    isUpdate,
    editingFromKD,
    insight,
}: {
    state: IAppState;
    time: number;
    saveAsNew: boolean;
    isUpdate: boolean;
    editingFromKD: boolean;
    insight: IInsightDefinition;
}) {
    const sourceInsight = getSourceInsightId(state);
    const insightStats = getInsightStats(insight);

    if (hasDescriptionChanged(state)) {
        logEvent("logDescriptionChanged", {
            state,
            value: getReportSummary(state).length,
        });
    }

    if (saveAsNew || sourceInsight) {
        const saveAsNewAction = editingFromKD || sourceInsight ? "savedAsNewFromKD" : "savedAsNew";

        logEvent(saveAsNewAction, { state, time, insightStats });
    } else {
        const updatedAction = editingFromKD ? "updatedFromKD" : "updated";
        const firstSaveAction = editingFromKD ? "firstSaveFromKD" : "firstSave";

        logEvent(isUpdate ? updatedAction : firstSaveAction, { state, time, insightStats });
    }
}

export function logVisualizationSaveFailed({
    state,
    time,
    saveAsNew,
    isUpdate,
    editingFromKD,
}: {
    state: IAppState;
    time: number;
    saveAsNew: boolean;
    isUpdate: boolean;
    editingFromKD: boolean;
}) {
    const sourceInsight = getSourceInsightId(state);
    if (saveAsNew || sourceInsight) {
        const saveAsNewFailedAction =
            editingFromKD || sourceInsight ? "saveAsNewFromKDFailed" : "saveAsNewFailed";
        logEvent(saveAsNewFailedAction, { state, time });
    } else {
        const updateFailedAction = editingFromKD ? "updateFromKDFailed" : "updateFailed";
        const firstSaveFailedAction = editingFromKD ? "firstSaveFromKDFailed" : "firstSaveFailed";
        logEvent(isUpdate ? updateFailedAction : firstSaveFailedAction, { state, time });
    }
}

export function logAttributeFilterApplied({
    state,
    time,
    isInverted,
}: {
    state: IAppState;
    time: number;
    isInverted: boolean;
}) {
    if (isInverted) {
        logEvent("positiveAttributeFilterApplied", { state, time });
    } else {
        logEvent("negativeAttributeFilterApplied", { state, time });
    }
}

export function logTextAttributeFilterApplied({ state }: { state: IAppState }) {
    logEvent("textAttributeFilterApplied", { state });
}

export function logTooManyDataPointsError(state: IAppState, value: string, insightStats: InsightStats) {
    logEvent("logTooManyDataPoints", { state, value, insightStats });
}

export function logAggregationsTotal(state: IAppState, bucketIdentifier: string, newTotals: ITotal[]) {
    const bucket = getBucketByLocalIdentifier(state, bucketIdentifier);
    if (!bucket) {
        return null;
    }

    const currentTotals: ITotal[] = (bucket?.totals as ITotal[]) ?? [];

    if (newTotals.length > currentTotals.length) {
        return logAddTotal(state, newTotals, currentTotals, bucketIdentifier);
    } else if (newTotals.length < currentTotals.length) {
        return logRemoveTotal(state, newTotals, currentTotals, bucketIdentifier);
    }
    return null;
}

function logAddTotal(
    state: IAppState,
    newTotals: ITotal[],
    currentTotals: ITotal[],
    bucketLocalIdentifier: string,
) {
    const newTotal = findDifferentTotal(newTotals, currentTotals);
    const newTotalType = getTotalName(newTotal.type);

    if (isSubtotalAttribute(state, newTotal.attributeIdentifier, bucketLocalIdentifier)) {
        if (bucketLocalIdentifier === ATTRIBUTE) {
            return logEvent("logTableRowSubtotalAdded", { state, value: newTotalType });
        } else {
            return logEvent("logTableColumnSubtotalAdded", { state, value: newTotalType });
        }
    }

    if (bucketLocalIdentifier === ATTRIBUTE) {
        return logEvent("logTableRowAggregationAdded", { state, value: newTotalType });
    } else {
        return logEvent("logTableColumnAggregationAdded", { state, value: newTotalType });
    }
}

function logRemoveTotal(
    state: IAppState,
    newTotals: ITotal[],
    currentTotals: ITotal[],
    bucketLocalIdentifier: string,
) {
    const oldTotal = findDifferentTotal(currentTotals, newTotals);
    const oldTotalType = getTotalName(oldTotal.type);

    if (isSubtotalAttribute(state, oldTotal.attributeIdentifier, bucketLocalIdentifier)) {
        if (bucketLocalIdentifier === ATTRIBUTE) {
            return logEvent("logTableRowSubtotalRemoved", { state, value: oldTotalType });
        } else {
            return logEvent("logTableColumnSubtotalRemoved", { state, value: oldTotalType });
        }
    }

    if (bucketLocalIdentifier === ATTRIBUTE) {
        return logEvent("logTableRowAggregationRemoved", { state, value: oldTotalType });
    } else {
        return logEvent("logTableColumnAggregationRemoved", { state, value: oldTotalType });
    }
}

export const logFirstContentfulPaint = (state: IAppState, value: number) => {
    logEvent("firstContentfulPaintInMs", { state, value });
};

export const logLargestContentfulPaint = (state: IAppState, value: number) => {
    logEvent("largestContentfulPaintInMs", { state, value });
};

// Initialize TelemetryTracker with default Accumulating
export const telemetryTracker: TelemetryTracker = new TelemetryTracker();
telemetryTracker.registerTracker(new AccumulatingTracker());

export function registerTracker(tracker: AbstractAnalyticsTracker) {
    telemetryTracker.registerTracker(tracker);
}

/**
 * Once all custom tracking tools are initialized will
 * go through all accumulated events and send the approriate event.
 */
export function telemetryInitialized() {
    telemetryTracker.startReportingEvents();
}

// Host shell telemetry callbacks, set by the pluggable module at mount time. The tracker instance is a
// module-level singleton that survives host unmount→remount, so the host-forwarding tracker is registered
// once and its callbacks refreshed on subsequent mounts.
let hostTelemetryCallbacks: IHostTelemetryCallbacks | undefined;
let hostForwardingTracker: HostForwardingTracker | undefined;

/**
 * Provides the host shell telemetry callbacks. Called by the pluggable module before sagas start.
 */
export function setHostTelemetryCallbacks(callbacks: IHostTelemetryCallbacks | undefined) {
    hostTelemetryCallbacks = callbacks;
    hostForwardingTracker?.setCallbacks(callbacks);
}

/**
 * Reverts host shell telemetry forwarding. Called by the pluggable module on unmount so a later mount that
 * does not provide host callbacks won't keep forwarding telemetry to a stale host instance (and instead
 * lets the runtime set up its own providers).
 */
export function clearHostTelemetryCallbacks(callbacks?: IHostTelemetryCallbacks) {
    // No token → this mount installed nothing; non-matching token → a newer mount already re-armed the
    // singleton. Only the mount that owns the current callbacks may detach them.
    if (!callbacks || hostTelemetryCallbacks !== callbacks) {
        return;
    }
    setHostTelemetryCallbacks(undefined);
}

/**
 * Registers the host-forwarding tracker when running as a pluggable application (i.e. host callbacks were
 * provided). Returns `true` when wired, so the telemetry bootstrap can skip its own provider setup.
 */
export function registerHostForwardingTracker(): boolean {
    if (!hostTelemetryCallbacks) {
        return false;
    }
    if (!hostForwardingTracker) {
        hostForwardingTracker = new HostForwardingTracker(hostTelemetryCallbacks);
        telemetryTracker.registerTracker(hostForwardingTracker);
    }
    return true;
}
