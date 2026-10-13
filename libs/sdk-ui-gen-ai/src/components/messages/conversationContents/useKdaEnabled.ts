// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import {
    isKeyDriverAnalysisMountedSelector,
    settingsSelector,
} from "../../../store/chatWindow/chatWindowSelectors.js";
import type { RootState } from "../../../store/types.js";

export function useKdaEnabled(enableKeyDriverAnalysis?: boolean) {
    const isKeyDriverAnalysisMounted = useSelector(isKeyDriverAnalysisMountedSelector);
    const enableChangeAnalysisSetting = useSelector(
        (state: RootState) => settingsSelector(state)?.enableChangeAnalysis,
    );

    return isKeyDriverAnalysisMounted && (enableKeyDriverAnalysis ?? enableChangeAnalysisSetting ?? false);
}
