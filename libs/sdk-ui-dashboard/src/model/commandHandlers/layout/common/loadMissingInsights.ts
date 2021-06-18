// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../../types/commonTypes";
import { IInsight, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { ExtendedDashboardItem } from "../../../types/layoutTypes";
import { isInsightWidget } from "@gooddata/sdk-backend-spi";
import differenceBy from "lodash/differenceBy";
import isEmpty from "lodash/isEmpty";

function getInsightRefsFromItems(items: ReadonlyArray<ExtendedDashboardItem>): ObjRef[] {
    const result: ObjRef[] = [];

    items.forEach((item) => {
        if (isInsightWidget(item.widget)) {
            result.push(item.widget.insight);
        }
    });

    return result;
}

export function loadInsightsForDashboardItems(
    ctx: DashboardContext,
    availableInsights: ObjRef[],
    items: ReadonlyArray<ExtendedDashboardItem>,
): Promise<IInsight[]> {
    const usedInsightRefs = getInsightRefsFromItems(items);
    const missingInsightRefs = differenceBy(usedInsightRefs, availableInsights, serializeObjRef);

    if (isEmpty(missingInsightRefs)) {
        return Promise.resolve([]);
    }

    const { backend, workspace } = ctx;

    return Promise.all(
        missingInsightRefs.map((ref) => backend.workspace(workspace).insights().getInsight(ref)),
    );
}
