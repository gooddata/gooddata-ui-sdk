// (C) 2024 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";
import { selectExecutionResultByRef, useDashboardSelector } from "../../../../model/index.js";

export const useInsightWarning = (ref: ObjRef) => {
    const executionResult = useDashboardSelector(selectExecutionResultByRef(ref));
    const partialResultWarning =
        executionResult?.warnings?.filter((warning) => warning.warningCode === "gdc.pixtab.partial") ?? [];

    return {
        partialResultWarning,
        executionResult,
    };
};
