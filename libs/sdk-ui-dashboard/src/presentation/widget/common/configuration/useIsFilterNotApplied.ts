// (C) 2022 GoodData Corporation
import { areObjRefsEqual, isObjRef, IWidget, ObjRef, widgetRef } from "@gooddata/sdk-model";
import {
    selectAttributeFilterDisplayFormsMap,
    selectExecutionResultByRef,
    useDashboardSelector,
} from "../../../../model/index.js";

const WARNING_FILTER_NOT_APPLIED = "gdc.aqe.not_applied_filter.report";

export function useIsFilterNotApplied(widget: IWidget, displayFormRef: ObjRef): boolean {
    const execResult = useDashboardSelector(selectExecutionResultByRef(widgetRef(widget)));
    const allWarnings = execResult?.warnings;

    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const df = dfMap.get(displayFormRef);

    if (!df) {
        return true;
    }

    if (!allWarnings?.length) {
        return false;
    }

    return allWarnings
        .filter((warning) => warning.warningCode === WARNING_FILTER_NOT_APPLIED)
        .some((warning) =>
            warning.parameters?.some((param) => isObjRef(param) && areObjRefsEqual(param, df.attribute)),
        );
}
