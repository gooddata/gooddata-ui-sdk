// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { isInsightWidget } from "@gooddata/sdk-model";
import { getInsightWithAppliedDrillDown } from "@gooddata/sdk-ui-ext";

import { removeIgnoredValuesFromDrillIntersection } from "./common/intersectionUtils.js";
import { isDrillDownIntersectionIgnoredAttributesForHierarchy } from "../../../_staging/drills/drillingUtils.js";
import { DrillDown } from "../../commands/drill.js";
import { DashboardDrillDownResolved, drillDownRequested, drillDownResolved } from "../../events/drill.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { selectWidgetByRef } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* drillDownHandler(
    ctx: DashboardContext,
    cmd: DrillDown,
): SagaIterator<DashboardDrillDownResolved> {
    const { drillDefinition, drillEvent, insight } = cmd.payload;

    yield put(drillDownRequested(ctx, insight, drillDefinition, drillEvent, cmd.correlationId));

    let effectiveDrillEvent = drillEvent;

    const widget: ReturnType<ReturnType<typeof selectWidgetByRef>> = yield select(
        selectWidgetByRef(drillEvent.widgetRef),
    );

    const drillDownIntersectionIgnoredAttributes = isInsightWidget(widget)
        ? widget.drillDownIntersectionIgnoredAttributes
        : undefined;

    const drillDownIntersectionIgnoredAttributesForCurrentHierarchy =
        drillDownIntersectionIgnoredAttributes?.find((ignored) => {
            return isDrillDownIntersectionIgnoredAttributesForHierarchy(
                ignored,
                drillDefinition.hierarchyRef!,
            );
        });

    const ignoredAttributesLocalIdentifiers =
        drillDownIntersectionIgnoredAttributesForCurrentHierarchy?.ignoredAttributes ?? [];

    if (ignoredAttributesLocalIdentifiers.length > 0) {
        effectiveDrillEvent = {
            ...drillEvent,
            drillContext: {
                ...drillEvent.drillContext,
                intersection: removeIgnoredValuesFromDrillIntersection(
                    drillEvent.drillContext.intersection ?? [],
                    drillDownIntersectionIgnoredAttributesForCurrentHierarchy?.ignoredAttributes ?? [],
                ),
            },
        };
    }

    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);

    const insightWithDrillDownApplied = getInsightWithAppliedDrillDown(
        insight,
        effectiveDrillEvent,
        drillDefinition,
        ctx.backend.capabilities.supportsElementUris ?? true,
        settings,
    );

    return drillDownResolved(
        ctx,
        insightWithDrillDownApplied,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
