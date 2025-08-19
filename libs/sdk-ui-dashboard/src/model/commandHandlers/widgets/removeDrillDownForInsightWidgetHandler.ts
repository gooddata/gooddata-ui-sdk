// (C) 2023-2025 GoodData Corporation

import isEqual from "lodash/isEqual.js";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { RemoveDrillDownForInsightWidget } from "../../commands/index.js";
import {
    DashboardInsightWidgetDrillDownRemoved,
    insightWidgetDrillDownRemoved,
} from "../../events/insight.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* removeDrillDownForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: RemoveDrillDownForInsightWidget,
): SagaIterator<DashboardInsightWidgetDrillDownRemoved> {
    const {
        payload: { blacklistHierarchies },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const {
        ref: widgetRef,
        ignoredDrillDownHierarchies: currentBlacklistHierarchies,
        drillDownIntersectionIgnoredAttributes: currentDrillDownIntersectionIgnoredAttributes,
    } = insightWidget;

    const newBlacklistHierarchies = [...(currentBlacklistHierarchies || []), ...blacklistHierarchies];

    yield put(
        layoutActions.replaceWidgetBlacklistHierarchies({
            ref: widgetRef,
            blacklistHierarchies: newBlacklistHierarchies,
            undo: {
                cmd,
            },
        }),
    );

    const drillIntersectionIgnoredAttributesWithoutBlacklistedHierarchies =
        currentDrillDownIntersectionIgnoredAttributes?.filter(
            (ignoredIntersectionAttributes) =>
                !newBlacklistHierarchies.some((hierarchy) =>
                    isEqual(hierarchy, ignoredIntersectionAttributes.drillDownReference),
                ),
        );

    yield put(
        layoutActions.replaceWidgetDrillDownIntersectionIgnoredAttributes({
            ref: widgetRef,
            ignoredDrillDownIntersectionIgnoredAttributes:
                drillIntersectionIgnoredAttributesWithoutBlacklistedHierarchies ?? [],
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetDrillDownRemoved(ctx, widgetRef, blacklistHierarchies, correlationId);
}
