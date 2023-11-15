// (C) 2023 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import {
    areObjRefsEqual,
    IAttributeHierarchyReference,
    isAttributeHierarchyReference,
    objRefToString,
} from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes.js";
import { AddDrillDownForInsightWidget } from "../../commands/index.js";
import { DashboardInsightWidgetDrillDownAdded, insightWidgetDrillDownAdded } from "../../events/insight.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";

export function* addDrillDownForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: AddDrillDownForInsightWidget,
): SagaIterator<DashboardInsightWidgetDrillDownAdded> {
    const {
        payload: { attributeIdentifier, attributeHierarchy },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const { ref: widgetRef, ignoredDrillDownHierarchies: currentBlacklistHierarchies } = insightWidget;

    const newBlacklistHierarchies = currentBlacklistHierarchies
        ? currentBlacklistHierarchies.filter((ref) => {
              if (isAttributeHierarchyReference(ref)) {
                  return !(
                      areObjRefsEqual(ref.attributeHierarchy, attributeHierarchy) &&
                      objRefToString(ref.label) === objRefToString(attributeIdentifier)
                  );
              } else {
                  return !(
                      areObjRefsEqual(ref.dateHierarchyTemplate, attributeHierarchy) &&
                      objRefToString(ref.dateDatasetAttribute) === objRefToString(attributeIdentifier)
                  );
              }
          })
        : [];

    yield put(
        layoutActions.replaceWidgetBlacklistHierarchies({
            ref: widgetRef,
            blacklistHierarchies: newBlacklistHierarchies,
            undo: {
                cmd,
            },
        }),
    );

    const added: IAttributeHierarchyReference = {
        type: "attributeHierarchyReference",
        attributeHierarchy: attributeHierarchy,
        label: attributeIdentifier,
    };
    return insightWidgetDrillDownAdded(ctx, widgetRef, [added], correlationId);
}
