// (C) 2020-2026 GoodData Corporation

import {
    type IDashboardCommandFailed,
    type IDashboardDrillToLegacyDashboardResolved,
    type IDrillToLegacyDashboard,
    drillToLegacyDashboard,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface IUseDrillToLegacyDashboardProps {
    onSuccess?: (event: IDashboardDrillToLegacyDashboardResolved) => void;
    onError?: (event: IDashboardCommandFailed<IDrillToLegacyDashboard>) => void;
    onBeforeRun?: (cmd: IDrillToLegacyDashboard) => void;
}

/**
 * @internal
 */
export const useDrillToLegacyDashboard = ({
    onSuccess,
    onError,
    onBeforeRun,
}: IUseDrillToLegacyDashboardProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToLegacyDashboard,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
