// (C) 2023-2025 GoodData Corporation

import {
    DashboardCommandFailed,
    KeyDriverAnalysis,
    keyDriverAnalysis,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface UseKeyDriverAnalysisProps {
    onSuccess?: (event: any) => void;
    onError?: (event: DashboardCommandFailed<KeyDriverAnalysis>) => void;
    onBeforeRun?: (cmd: KeyDriverAnalysis) => void;
}

/**
 * @internal
 */
export const useKeyDriverAnalysis = ({ onSuccess, onError, onBeforeRun }: UseKeyDriverAnalysisProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: keyDriverAnalysis,
        successEvent: "GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
