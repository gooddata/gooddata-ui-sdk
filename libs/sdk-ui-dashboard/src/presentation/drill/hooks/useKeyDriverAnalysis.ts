// (C) 2023-2026 GoodData Corporation

import {
    type IDashboardCommandFailed,
    type IKeyDriverAnalysis,
    keyDriverAnalysis,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface IUseKeyDriverAnalysisProps {
    onSuccess?: (event: any) => void;
    onError?: (event: IDashboardCommandFailed<IKeyDriverAnalysis>) => void;
    onBeforeRun?: (cmd: IKeyDriverAnalysis) => void;
}

/**
 * @internal
 */
export const useKeyDriverAnalysis = ({
    onSuccess,
    onError,
    onBeforeRun,
}: IUseKeyDriverAnalysisProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: keyDriverAnalysis,
        successEvent: "GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
