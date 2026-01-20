// (C) 2023-2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { getHierarchyRef } from "@gooddata/sdk-model";

import { hierarchyToDrillDownReference } from "./common/drillDown.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { type IModifyDrillDownForInsightWidget } from "../../commands/index.js";
import {
    type IDashboardInsightWidgetDrillDownModified,
    insightWidgetDrillDownModified,
} from "../../events/insight.js";
import { selectAllCatalogAttributeHierarchies } from "../../store/catalog/catalogSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { existBlacklistHierarchyPredicate } from "../../utils/attributeHierarchyUtils.js";

export function* modifyDrillDownForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: IModifyDrillDownForInsightWidget,
): SagaIterator<IDashboardInsightWidgetDrillDownModified> {
    const {
        payload: {
            attributeIdentifier,
            attributeHierarchyRef,
            blacklistHierarchies,
            intersectionIgnoredAttributes,
        },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const {
        ref: widgetRef,
        ignoredDrillDownHierarchies: currentBlacklistHierarchies,
        drillDownIntersectionIgnoredAttributes: currentDrillDownIntersectionIgnoredAttributes,
    } = insightWidget;

    const hierarchies: ReturnType<typeof selectAllCatalogAttributeHierarchies> = yield select(
        selectAllCatalogAttributeHierarchies,
    );

    const hierarchy = hierarchies.find((hierarchy) => {
        const hierarchyRef = getHierarchyRef(hierarchy);
        return hierarchyRef === attributeHierarchyRef;
    });

    const newBlacklistHierarchies =
        currentBlacklistHierarchies && hierarchy
            ? currentBlacklistHierarchies.filter(
                  (ref) => !existBlacklistHierarchyPredicate(ref, hierarchy, attributeIdentifier),
              )
            : [];

    const mergedBlacklistHierarchies = [...newBlacklistHierarchies, ...blacklistHierarchies];

    yield put(
        tabsActions.replaceWidgetBlacklistHierarchies({
            ref: widgetRef,
            blacklistHierarchies: mergedBlacklistHierarchies,
            undo: {
                cmd,
            },
        }),
    );

    if (hierarchy && intersectionIgnoredAttributes) {
        const drillDownReference = hierarchyToDrillDownReference(hierarchy, attributeIdentifier);
        const existingIgnoredAttributesWithoutChangedItem =
            currentDrillDownIntersectionIgnoredAttributes?.filter(
                (item) => !isEqual(item.drillDownReference, drillDownReference),
            ) ?? [];

        yield put(
            tabsActions.replaceWidgetDrillDownIntersectionIgnoredAttributes({
                ref: widgetRef,
                ignoredDrillDownIntersectionIgnoredAttributes: [
                    ...existingIgnoredAttributesWithoutChangedItem,
                    {
                        ignoredAttributes: intersectionIgnoredAttributes,
                        drillDownReference,
                    },
                ],
                undo: {
                    cmd,
                },
            }),
        );
    }

    return insightWidgetDrillDownModified(ctx, widgetRef, blacklistHierarchies, correlationId);
}
