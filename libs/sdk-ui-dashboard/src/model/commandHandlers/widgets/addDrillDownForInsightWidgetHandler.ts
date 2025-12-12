// (C) 2023-2025 GoodData Corporation

import { isEqual } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { getHierarchyRef } from "@gooddata/sdk-model";

import { hierarchyToDrillDownReference } from "./common/drillDown.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { type AddDrillDownForInsightWidget } from "../../commands/index.js";
import {
    type DashboardInsightWidgetDrillDownAdded,
    insightWidgetDrillDownAdded,
} from "../../events/insight.js";
import { selectAllCatalogAttributeHierarchies } from "../../store/catalog/catalogSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { existBlacklistHierarchyPredicate } from "../../utils/attributeHierarchyUtils.js";

export function* addDrillDownForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: AddDrillDownForInsightWidget,
): SagaIterator<DashboardInsightWidgetDrillDownAdded> {
    const {
        payload: {
            attributeIdentifier,
            drillDownIdentifier,
            drillDownAttributeHierarchyRef,
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
        return hierarchyRef === drillDownAttributeHierarchyRef;
    });

    const updatedInsightDrills = insightWidget.drills.filter(
        (drill) => drill.localIdentifier !== drillDownIdentifier,
    );

    yield put(
        tabsActions.replaceWidgetDrills({
            ref: insightWidget.ref,
            drillDefinitions: updatedInsightDrills,
            undo: {
                cmd,
            },
        }),
    );

    const newBlacklistHierarchies =
        currentBlacklistHierarchies && hierarchy
            ? currentBlacklistHierarchies.filter(
                  (ref) => !existBlacklistHierarchyPredicate(ref, hierarchy, attributeIdentifier),
              )
            : [];

    yield put(
        tabsActions.replaceWidgetBlacklistHierarchies({
            ref: widgetRef,
            blacklistHierarchies: newBlacklistHierarchies,
            undo: {
                cmd,
            },
        }),
    );

    if (hierarchy && intersectionIgnoredAttributes) {
        const drillDownReference = hierarchyToDrillDownReference(hierarchy, attributeIdentifier);
        const existingIgnoredAttributesWithoutChangedItem =
            currentDrillDownIntersectionIgnoredAttributes?.filter((item) =>
                isEqual(item.drillDownReference, drillDownReference),
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

    return insightWidgetDrillDownAdded(
        ctx,
        widgetRef,
        drillDownAttributeHierarchyRef,
        attributeIdentifier,
        correlationId,
    );
}
