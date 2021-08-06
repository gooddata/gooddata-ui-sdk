// (C) 2021 GoodData Corporation
import { ExtendedDashboardItem } from "../../../types/layoutTypes";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap";
import { IInsight, insightRef, objRefToString } from "@gooddata/sdk-model";
import { isInsightWidget } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import { InsightResolutionResult, resolveInsights } from "../../../utils/insightResolver";
import { DashboardContext } from "../../../types/commonTypes";
import { SagaIterator } from "redux-saga";
import { call, SagaReturnType } from "redux-saga/effects";
import isEmpty from "lodash/isEmpty";
import { invalidArgumentsProvided } from "../../../events/general";
import { extractInsightRefsFromItems } from "../../../utils/dashboardItemUtils";
import { IDashboardCommand } from "../../../commands";

function normalizeItems(
    items: ExtendedDashboardItem[],
    insights: ObjRefMap<IInsight>,
): ExtendedDashboardItem[] {
    return items.map((item) => {
        if (isInsightWidget(item.widget)) {
            const existingInsight = insights.get(item.widget.insight);

            invariant(existingInsight);

            return {
                ...item,
                widget: {
                    ...item.widget,
                    insight: insightRef(existingInsight),
                },
            };
        }

        return item;
    });
}

type ItemValidationResult = {
    normalizedItems: ExtendedDashboardItem[];
    resolvedInsights: InsightResolutionResult;
};

export function* validateAndNormalizeItems(
    ctx: DashboardContext,
    item: ExtendedDashboardItem[],
    cmd: IDashboardCommand,
): SagaIterator<ItemValidationResult> {
    const insightRefs = extractInsightRefsFromItems(item);
    const resolvedInsights: SagaReturnType<typeof resolveInsights> = yield call(
        resolveInsights,
        ctx,
        insightRefs,
    );

    if (!isEmpty(resolvedInsights.missing)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add dashboard items that reference missing insights: ${resolvedInsights.missing
                .map(objRefToString)
                .join(", ")}`,
        );
    }

    return {
        normalizedItems: normalizeItems(item, resolvedInsights.resolved),
        resolvedInsights,
    };
}
