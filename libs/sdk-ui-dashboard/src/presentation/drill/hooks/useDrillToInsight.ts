// (C) 2020-2021 GoodData Corporation

import {
    DashboardDrillToInsightResolved,
    DashboardCommandFailed,
    drillToInsight,
    useDashboardCommandProcessing,
} from "../../../model";

/**
 * @internal
 */
export interface UseDrillToInsightProps {
    onSuccess?: (event: DashboardDrillToInsightResolved) => void;
    onError?: (event: DashboardCommandFailed) => void;
    onBeforeRun?: () => void;
}

/**
 * @internal
 */
export const useDrillToInsight = ({ onSuccess, onError, onBeforeRun }: UseDrillToInsightProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToInsight,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
