// (C) 2020-2021 GoodData Corporation

import { useDashboardCommandProcessing } from "../../dashboard/useDashboardCommandProcessing";
import { DashboardDrillToInsightTriggered, DashboardCommandFailed, drillToInsight } from "../../model";

/**
 * @internal
 */
export interface UseDrillToInsightProps {
    onSuccess?: (event: DashboardDrillToInsightTriggered) => void;
    onError?: (event: DashboardCommandFailed) => void;
    onBeforeRun?: () => void;
}

/**
 * @internal
 */
export const useDrillToInsight = ({ onSuccess, onError, onBeforeRun }: UseDrillToInsightProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToInsight,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.TRIGGERED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
