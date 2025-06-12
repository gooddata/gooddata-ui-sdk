// (C) 2021-2022 GoodData Corporation

import { DashboardContext } from "../types/commonTypes.js";
import { IInsight, isInsight, isObjRef, ObjRef } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { selectInsightsMap } from "../store/insights/insightsSelectors.js";
import { newInsightMap, ObjRefMap } from "../../_staging/metadata/objRefMap.js";
import { PromiseFnReturnType } from "../types/sagas.js";

async function loadInsightsFromBackend(
    ctx: DashboardContext,
    insightRefs: ObjRef[],
): Promise<{ loaded: IInsight[]; missing: ObjRef[] }> {
    const { backend, workspace } = ctx;

    const result = await Promise.all(
        insightRefs.map((ref) =>
            backend
                .workspace(workspace)
                .insights()
                .getInsight(ref)
                .catch((_) => ref),
        ),
    );

    return {
        loaded: result.filter(isInsight),
        missing: result.filter(isObjRef),
    };
}

export interface InsightResolutionResult {
    /**
     * Map containing all resolved insights.
     */
    resolved: ObjRefMap<IInsight>;

    /**
     * List of those insights that had to be loaded from the server.
     */
    loaded: IInsight[];

    /**
     * List of ObjRefs that could not be resolved.
     */
    missing: ObjRef[];
}

/**
 * Given a list of insight ObjRefs, this generator will resolve those refs to actual IInsight objects. The resolution
 * is done from two sources: first the insights already stored in the lazily-populated insight slice, second, as a fallback
 * the actual analytical backend.
 *
 * @param ctx - dashboard context in which the resolution is done
 * @param insightRefs - refs of insights to resolve to IInsight
 */
export function* resolveInsights(
    ctx: DashboardContext,
    insightRefs: ObjRef[],
): SagaIterator<InsightResolutionResult> {
    const alreadyLoadedInsights: ReturnType<typeof selectInsightsMap> = yield select(selectInsightsMap);
    const foundInsights: IInsight[] = [];
    const missingInsightRefs: ObjRef[] = [];

    insightRefs.forEach((ref) => {
        const insight = alreadyLoadedInsights.get(ref);

        if (insight) {
            foundInsights.push(insight);
        } else {
            missingInsightRefs.push(ref);
        }
    });

    const loadResult: PromiseFnReturnType<typeof loadInsightsFromBackend> = yield call(
        loadInsightsFromBackend,
        ctx,
        missingInsightRefs,
    );

    return {
        resolved: newInsightMap([...foundInsights, ...loadResult.loaded]),
        loaded: loadResult.loaded,
        missing: loadResult.missing,
    };
}
