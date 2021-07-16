// (C) 2020-2021 GoodData Corporation

import {
    DashboardDrillToCustomUrlTriggered,
    DashboardCommandFailed,
    drillToCustomUrl,
    useDashboardCommandProcessing,
} from "../../../model";

/**
 * @internal
 */
export interface UseDrillToCustomUrlProps {
    onSuccess?: (event: DashboardDrillToCustomUrlTriggered) => void;
    onError?: (event: DashboardCommandFailed) => void;
    onBeforeRun?: () => void;
}

/**
 * @internal
 */
export const useDrillToCustomUrl = ({ onSuccess, onError, onBeforeRun }: UseDrillToCustomUrlProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToCustomUrl,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.TRIGGERED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
