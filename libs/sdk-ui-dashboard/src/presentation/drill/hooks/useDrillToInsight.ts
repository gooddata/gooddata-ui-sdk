// (C) 2020-2026 GoodData Corporation

import {
    type IDashboardCommandFailed,
    type IDashboardDrillToInsightResolved,
    type IDrillToInsight,
    drillToInsight,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface IUseDrillToInsightProps {
    onSuccess?: (event: IDashboardDrillToInsightResolved) => void;
    onError?: (event: IDashboardCommandFailed<IDrillToInsight>) => void;
    onBeforeRun?: (cmd: IDrillToInsight) => void;
}

/**
 * @internal
 */
export const useDrillToInsight = ({ onSuccess, onError, onBeforeRun }: IUseDrillToInsightProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToInsight,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
