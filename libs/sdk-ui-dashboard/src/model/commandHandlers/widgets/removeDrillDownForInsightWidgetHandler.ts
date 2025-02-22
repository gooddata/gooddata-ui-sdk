// (C) 2023-2024 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { DashboardContext } from "../../types/commonTypes.js";
import { RemoveDrillDownForInsightWidget } from "../../commands/index.js";
import {
    DashboardInsightWidgetDrillDownRemoved,
    insightWidgetDrillDownRemoved,
} from "../../events/insight.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import isEqual from "lodash/isEqual.js";

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
