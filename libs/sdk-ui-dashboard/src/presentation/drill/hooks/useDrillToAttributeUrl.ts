// (C) 2020-2025 GoodData Corporation

import {
    DashboardCommandFailed,
    DashboardDrillToAttributeUrlResolved,
    DrillToAttributeUrl,
    drillToAttributeUrl,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface UseDrillToAttributeUrlProps {
    onSuccess?: (event: DashboardDrillToAttributeUrlResolved) => void;
    onError?: (event: DashboardCommandFailed<DrillToAttributeUrl>) => void;
    onBeforeRun?: (cmd: DrillToAttributeUrl) => void;
}

/**
 * @internal
 */
export const useDrillToAttributeUrl = ({
    onSuccess,
    onError,
    onBeforeRun,
}: UseDrillToAttributeUrlProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToAttributeUrl,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
