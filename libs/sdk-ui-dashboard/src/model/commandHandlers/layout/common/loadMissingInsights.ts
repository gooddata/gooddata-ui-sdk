// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../../types/commonTypes";
import { IInsight, ObjRef } from "@gooddata/sdk-model";
import { ExtendedDashboardItem } from "../../../types/layoutTypes";
import { isInsightWidget } from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap";

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
    availableInsights: ObjRefMap<IInsight>,
    items: ReadonlyArray<ExtendedDashboardItem>,
): Promise<IInsight[]> {
    const usedInsightRefs = getInsightRefsFromItems(items);
    const missingInsightRefs = usedInsightRefs.filter((ref) => !availableInsights.has(ref));

    if (isEmpty(missingInsightRefs)) {
        return Promise.resolve([]);
    }

    const { backend, workspace } = ctx;

    return Promise.all(
        missingInsightRefs.map((ref) => backend.workspace(workspace).insights().getInsight(ref)),
    );
}
