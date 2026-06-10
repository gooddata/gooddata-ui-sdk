// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import {
    selectExecutionResultByRef,
    selectExecutionResultLimitBreaksByRef,
} from "../../../../model/store/executionResults/executionResultsSelectors.js";

export const useInsightWarning = (ref: ObjRef) => {
    const executionResult = useDashboardSelector(selectExecutionResultByRef(ref));
    const limitBreaks = useDashboardSelector(selectExecutionResultLimitBreaksByRef(ref));

    return {
        limitBreaks,
        executionResult,
    };
};
