// (C) 2024 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import {
    selectExecutionResultByRef,
    selectIsPartialResultWarningOpen,
    useDashboardSelector,
} from "../../../../model/index.js";

export const useInsightWarning = (ref: ObjRef) => {
    const executionResult = useDashboardSelector(selectExecutionResultByRef(ref));
    const fingerprint = executionResult?.executionResult?.fingerprint();
    const partialResultWarning =
        executionResult?.warnings?.filter((warning) => warning.warningCode === "gdc.pixtab.partial") ?? [];
    const isOverlayOpen = useDashboardSelector(selectIsPartialResultWarningOpen(fingerprint!));

    return {
        partialResultWarning,
        executionResult,
        fingerprint,
        isOverlayOpen,
    };
};
