// (C) 2020-2021 GoodData Corporation

import {
    DashboardDrillToCustomUrlResolved,
    DashboardCommandFailed,
    DrillToCustomUrl,
    drillToCustomUrl,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface UseDrillToCustomUrlProps {
    onSuccess?: (event: DashboardDrillToCustomUrlResolved) => void;
    onError?: (event: DashboardCommandFailed<DrillToCustomUrl>) => void;
    onBeforeRun?: (cmd: DrillToCustomUrl) => void;
}

/**
 * @internal
 */
export const useDrillToCustomUrl = ({ onSuccess, onError, onBeforeRun }: UseDrillToCustomUrlProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToCustomUrl,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
