// (C) 2020-2021 GoodData Corporation

import {
    DashboardDrillDownResolved,
    DashboardCommandFailed,
    drillDown,
    useDashboardCommandProcessing,
} from "../../../model";

/**
 * @internal
 */
export interface UseDrillDownProps {
    onSuccess?: (event: DashboardDrillDownResolved) => void;
    onError?: (event: DashboardCommandFailed) => void;
    onBeforeRun?: () => void;
}

/**
 * @internal
 */
export const useDrillDown = ({ onSuccess, onError, onBeforeRun }: UseDrillDownProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillDown,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_DOWN.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
