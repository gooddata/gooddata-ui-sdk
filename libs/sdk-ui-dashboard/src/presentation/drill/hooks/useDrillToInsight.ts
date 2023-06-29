// (C) 2020-2021 GoodData Corporation

import {
    DashboardDrillToInsightResolved,
    DashboardCommandFailed,
    DrillToInsight,
    drillToInsight,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface UseDrillToInsightProps {
    onSuccess?: (event: DashboardDrillToInsightResolved) => void;
    onError?: (event: DashboardCommandFailed<DrillToInsight>) => void;
    onBeforeRun?: (cmd: DrillToInsight) => void;
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
