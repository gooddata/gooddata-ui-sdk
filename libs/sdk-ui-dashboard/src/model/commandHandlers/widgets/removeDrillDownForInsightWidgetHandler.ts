// (C) 2023-2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { type IRemoveDrillDownForInsightWidget } from "../../commands/index.js";
import {
    type IDashboardInsightWidgetDrillDownRemoved,
    insightWidgetDrillDownRemoved,
} from "../../events/insight.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* removeDrillDownForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: IRemoveDrillDownForInsightWidget,
): SagaIterator<IDashboardInsightWidgetDrillDownRemoved> {
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
        tabsActions.replaceWidgetBlacklistHierarchies({
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
        tabsActions.replaceWidgetDrillDownIntersectionIgnoredAttributes({
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
