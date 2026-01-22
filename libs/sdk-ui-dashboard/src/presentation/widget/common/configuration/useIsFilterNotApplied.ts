// (C) 2022-2026 GoodData Corporation

import {
    type IWidget,
    type ObjRef,
    areObjRefsEqual,
    isObjRef,
    isRichTextWidget,
    widgetRef,
} from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectExecutionResultByRef } from "../../../../model/store/executionResults/executionResultsSelectors.js";
import { selectAttributeFilterDisplayFormsMap } from "../../../../model/store/tabs/filterContext/filterContextSelectors.js";

const WARNING_FILTER_NOT_APPLIED = "gdc.aqe.not_applied_filter.report";

export function useIsFilterNotApplied(widget: IWidget, displayFormRef: ObjRef): boolean {
    // Call hooks unconditionally (React Hooks rules)
    const execResult = useDashboardSelector(selectExecutionResultByRef(widgetRef(widget)));
    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);

    // Rich Text widgets don't have execution results, but their embedded metrics
    // can still be filtered. Skip validation for Rich Text widgets.
    if (isRichTextWidget(widget)) {
        return false;
    }

    const allWarnings = execResult?.warnings;
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
