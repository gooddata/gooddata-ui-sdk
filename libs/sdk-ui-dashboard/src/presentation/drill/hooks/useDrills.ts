// (C) 2020-2022 GoodData Corporation
import {
    OnDashboardDrill,
    OnDashboardDrillSuccess,
    OnDrillDown,
    OnDrillToAttributeUrl,
    OnDrillToCustomUrl,
    OnDrillToDashboard,
    OnDrillToInsight,
    OnDashboardDrillError,
    OnDrillDownSuccess,
    OnDrillToInsightSuccess,
    OnDrillToDashboardSuccess,
    OnDrillToAttributeUrlSuccess,
    OnDrillToCustomUrlSuccess,
    OnDrillToLegacyDashboard,
    OnDrillToLegacyDashboardSuccess,
} from "../types.js";
import { useDrill } from "./useDrill.js";
import { useDrillDown } from "./useDrillDown.js";
import { useDrillToInsight } from "./useDrillToInsight.js";
import { useDrillToDashboard } from "./useDrillToDashboard.js";
import { useDrillToAttributeUrl } from "./useDrillToAttributeUrl.js";
import { useDrillToCustomUrl } from "./useDrillToCustomUrl.js";
import { useDrillToLegacyDashboard } from "./useDrillToLegacyDashboard.js";

/**
 * @internal
 */
export interface UseDrillsProps {
    onDrill?: OnDashboardDrill;
    onDrillSuccess?: OnDashboardDrillSuccess;
    onDrillError?: OnDashboardDrillError;
    //
    onDrillDown?: OnDrillDown;
    onDrillDownSuccess?: OnDrillDownSuccess;
    onDrillDownError?: OnDashboardDrillError;
    //
    onDrillToInsight?: OnDrillToInsight;
    onDrillToInsightSuccess?: OnDrillToInsightSuccess;
    onDrillToInsightError?: OnDashboardDrillError;
    //
    onDrillToDashboard?: OnDrillToDashboard;
    onDrillToDashboardSuccess?: OnDrillToDashboardSuccess;
    onDrillToDashboardError?: OnDashboardDrillError;
    //
    onDrillToAttributeUrl?: OnDrillToAttributeUrl;
    onDrillToAttributeUrlSuccess?: OnDrillToAttributeUrlSuccess;
    onDrillToAttributeUrlError?: OnDashboardDrillError;
    //
    onDrillToCustomUrl?: OnDrillToCustomUrl;
    onDrillToCustomUrlSuccess?: OnDrillToCustomUrlSuccess;
    onDrillToCustomUrlError?: OnDashboardDrillError;
    //
    onDrillToLegacyDashboard?: OnDrillToLegacyDashboard;
    onDrillToLegacyDashboardSuccess?: OnDrillToLegacyDashboardSuccess;
    onDrillToLegacyDashboardError?: OnDashboardDrillError;
    // Common error handler
    onError?: OnDashboardDrillError;
}

/**
 * @internal
 */
export function useDrills({
    onDrill,
    onDrillSuccess,
    onDrillError,
    //
    onDrillDown,
    onDrillDownSuccess,
    onDrillDownError,
    //
    onDrillToInsight,
    onDrillToInsightSuccess,
    onDrillToInsightError,
    //
    onDrillToDashboard,
    onDrillToDashboardSuccess,
    onDrillToDashboardError,
    //
    onDrillToAttributeUrl,
    onDrillToAttributeUrlSuccess,
    onDrillToAttributeUrlError,
    //
    onDrillToCustomUrl,
    onDrillToCustomUrlSuccess,
    onDrillToCustomUrlError,
    //
    onDrillToLegacyDashboard,
    onDrillToLegacyDashboardSuccess,
    onDrillToLegacyDashboardError,
    //
    onError,
}: UseDrillsProps) {
    const drill = useDrill({
        onBeforeRun: onDrill,
        onSuccess: onDrillSuccess,
        onError: onDrillError ?? onError,
    });

    const drillDown = useDrillDown({
        onBeforeRun: onDrillDown,
        onSuccess: onDrillDownSuccess,
        onError: onDrillDownError ?? onError,
    });

    const drillToInsight = useDrillToInsight({
        onBeforeRun: onDrillToInsight,
        onSuccess: onDrillToInsightSuccess,
        onError: onDrillToInsightError ?? onError,
    });

    const drillToDashboard = useDrillToDashboard({
        onBeforeRun: onDrillToDashboard,
        onSuccess: onDrillToDashboardSuccess,
        onError: onDrillToDashboardError ?? onError,
    });

    const drillToAttributeUrl = useDrillToAttributeUrl({
        onBeforeRun: onDrillToAttributeUrl,
        onSuccess: onDrillToAttributeUrlSuccess,
        onError: onDrillToAttributeUrlError ?? onError,
    });

    const drillToCustomUrl = useDrillToCustomUrl({
        onBeforeRun: onDrillToCustomUrl,
        onSuccess: onDrillToCustomUrlSuccess,
        onError: onDrillToCustomUrlError ?? onError,
    });

    const drillToLegacyDashboard = useDrillToLegacyDashboard({
        onBeforeRun: onDrillToLegacyDashboard,
        onSuccess: onDrillToLegacyDashboardSuccess,
        onError: onDrillToLegacyDashboardError ?? onError,
    });

    return {
        drill,
        drillDown,
        drillToInsight,
        drillToDashboard,
        drillToAttributeUrl,
        drillToCustomUrl,
        drillToLegacyDashboard,
    };
}
