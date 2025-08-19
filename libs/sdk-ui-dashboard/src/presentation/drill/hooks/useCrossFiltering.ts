// (C) 2023-2025 GoodData Corporation

import {
    CrossFiltering,
    DashboardCommandFailed,
    DashboardCrossFilteringResolved,
    crossFiltering,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface UseCrossFilteringProps {
    onSuccess?: (event: DashboardCrossFilteringResolved) => void;
    onError?: (event: DashboardCommandFailed<CrossFiltering>) => void;
    onBeforeRun?: (cmd: CrossFiltering) => void;
}

/**
 * @internal
 */
export const useCrossFiltering = ({ onSuccess, onError, onBeforeRun }: UseCrossFilteringProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: crossFiltering,
        successEvent: "GDC.DASH/EVT.DRILL.CROSS_FILTERING.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
