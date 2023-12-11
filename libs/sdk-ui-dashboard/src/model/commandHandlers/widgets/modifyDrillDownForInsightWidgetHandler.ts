// (C) 2023 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { DashboardContext } from "../../types/commonTypes.js";
import { ModifyDrillDownForInsightWidget } from "../../commands/index.js";
import {
    DashboardInsightWidgetDrillDownModified,
    insightWidgetDrillDownModified,
} from "../../events/insight.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { existBlacklistHierarchyPredicate } from "../../utils/attributeHierarchyUtils.js";

export function* modifyDrillDownForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: ModifyDrillDownForInsightWidget,
): SagaIterator<DashboardInsightWidgetDrillDownModified> {
    const {
        payload: { attributeIdentifier, attributeHierarchyRef, blacklistHierarchies },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const { ref: widgetRef, ignoredDrillDownHierarchies: currentBlacklistHierarchies } = insightWidget;

    const newBlacklistHierarchies = currentBlacklistHierarchies
        ? currentBlacklistHierarchies.filter(
              (ref) => !existBlacklistHierarchyPredicate(ref, attributeHierarchyRef, attributeIdentifier),
          )
        : [];

    const mergedBlacklistHierarchies = [...newBlacklistHierarchies, ...blacklistHierarchies];

    yield put(
        layoutActions.replaceWidgetBlacklistHierarchies({
            ref: widgetRef,
            blacklistHierarchies: mergedBlacklistHierarchies,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetDrillDownModified(ctx, widgetRef, blacklistHierarchies, correlationId);
}
