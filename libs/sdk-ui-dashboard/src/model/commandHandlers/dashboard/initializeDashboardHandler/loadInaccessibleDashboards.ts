// (C) 2023-2025 GoodData Corporation

import compact from "lodash/compact.js";
import flatMap from "lodash/flatMap.js";
import { call, put, select } from "redux-saga/effects";

import { IWidget, ObjRef, isDrillToDashboard, isInsightWidget } from "@gooddata/sdk-model";

import { selectAccessibleDashboardsMap } from "../../../store/accessibleDashboards/accessibleDashboardsSelectors.js";
import { inaccessibleDashboardsActions } from "../../../store/inaccessibleDashboards/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { IInaccessibleDashboard } from "../../../types/inaccessibleDashboardTypes.js";
import { PromiseFnReturnType } from "../../../types/sagas.js";

export function* loadInaccessibleDashboards(ctx: DashboardContext, widgets: IWidget[]) {
    const accessibleDashboardsMap: ReturnType<typeof selectAccessibleDashboardsMap> = yield select(
        selectAccessibleDashboardsMap,
    );
    const dashboardDrillTargets = flatMap(
        widgets.filter(isInsightWidget).map(({ drills }) => drills.filter(isDrillToDashboard)),
    );
    const dashboardDrillTargetRefs = compact(dashboardDrillTargets.map(({ target }) => target));
    const unknownDashboardDrillTargetRefs = dashboardDrillTargetRefs.filter(
        (ref) => !accessibleDashboardsMap.get(ref),
    );
    const existingDashboards: PromiseFnReturnType<typeof getExistingDashboards> = yield call(
        getExistingDashboards,
        ctx,
        unknownDashboardDrillTargetRefs,
    );
    const inaccessibleDashboards: IInaccessibleDashboard[] = existingDashboards.map((dashboard) => {
        return {
            ...dashboard,
            title: dashboard.title ?? "",
            accessibilityLimitation: dashboard.title === undefined ? "forbidden" : "notShared",
        };
    });

    yield put(inaccessibleDashboardsActions.addInaccessibleDashboards(inaccessibleDashboards));
}

async function getExistingDashboards(ctx: DashboardContext, dashboardRefs: ObjRef[]) {
    if (dashboardRefs.length === 0) {
        return [];
    }
    try {
        return await ctx.backend
            .workspace(ctx.workspace)
            .dashboards()
            .validateDashboardsExistence(dashboardRefs);
    } catch {
        // when the call fails, we have no way to check whether the unknown dashboards exist
        return [];
    }
}
