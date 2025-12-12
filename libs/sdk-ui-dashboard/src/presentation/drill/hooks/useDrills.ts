// (C) 2020-2025 GoodData Corporation

import { useCrossFiltering } from "./useCrossFiltering.js";
import { useDrill } from "./useDrill.js";
import { useDrillDown } from "./useDrillDown.js";
import { useDrillToAttributeUrl } from "./useDrillToAttributeUrl.js";
import { useDrillToCustomUrl } from "./useDrillToCustomUrl.js";
import { useDrillToDashboard } from "./useDrillToDashboard.js";
import { useDrillToInsight } from "./useDrillToInsight.js";
import { useDrillToLegacyDashboard } from "./useDrillToLegacyDashboard.js";
import {
    type OnCrossFiltering,
    type OnCrossFilteringError,
    type OnCrossFilteringSuccess,
    type OnDashboardDrill,
    type OnDashboardDrillError,
    type OnDashboardDrillSuccess,
    type OnDrillDown,
    type OnDrillDownSuccess,
    type OnDrillToAttributeUrl,
    type OnDrillToAttributeUrlSuccess,
    type OnDrillToCustomUrl,
    type OnDrillToCustomUrlSuccess,
    type OnDrillToDashboard,
    type OnDrillToDashboardSuccess,
    type OnDrillToInsight,
    type OnDrillToInsightSuccess,
    type OnDrillToLegacyDashboard,
    type OnDrillToLegacyDashboardSuccess,
    type OnKeyDriverAnalysis,
    type OnKeyDriverAnalysisError,
    type OnKeyDriverAnalysisSuccess,
} from "../types.js";
import { useKeyDriverAnalysis } from "./useKeyDriverAnalysis.js";

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
    //
    onCrossFiltering?: OnCrossFiltering;
    onCrossFilteringSuccess?: OnCrossFilteringSuccess;
    onCrossFilteringError?: OnCrossFilteringError;
    //
    onKeyDriverAnalysis?: OnKeyDriverAnalysis;
    onKeyDriverAnalysisSuccess?: OnKeyDriverAnalysisSuccess;
    onKeyDriverAnalysisError?: OnKeyDriverAnalysisError;
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
    onCrossFiltering,
    onCrossFilteringSuccess,
    onCrossFilteringError,
    //
    onKeyDriverAnalysis,
    onKeyDriverAnalysisSuccess,
    onKeyDriverAnalysisError,
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

    const crossFiltering = useCrossFiltering({
        onBeforeRun: onCrossFiltering,
        onSuccess: onCrossFilteringSuccess,
        onError: onCrossFilteringError ?? onError,
    });

    const keyDriverAnalysis = useKeyDriverAnalysis({
        onBeforeRun: onKeyDriverAnalysis,
        onSuccess: onKeyDriverAnalysisSuccess,
        onError: onKeyDriverAnalysisError ?? onError,
    });

    return {
        drill,
        drillDown,
        drillToInsight,
        drillToDashboard,
        drillToAttributeUrl,
        drillToCustomUrl,
        drillToLegacyDashboard,
        crossFiltering,
        keyDriverAnalysis,
    };
}
