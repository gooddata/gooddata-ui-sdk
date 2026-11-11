// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import { isKeyDriverAnalysisMountedSelector } from "../../../store/chatWindow/chatWindowSelectors.js";

export function useKdaEnabled(enableKeyDriverAnalysis?: boolean) {
    const isKeyDriverAnalysisMounted = useSelector(isKeyDriverAnalysisMountedSelector);

    return isKeyDriverAnalysisMounted && (enableKeyDriverAnalysis ?? true);
}
