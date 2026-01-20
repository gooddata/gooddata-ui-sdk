// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, all, call, put, select } from "redux-saga/effects";

import { getDrillToUrlFiltersWithResolvedValues } from "./getDrillToUrlFilters.js";
import { resolveDrillToAttributeUrl } from "./resolveDrillToAttributeUrl.js";
import { isDrillConfigured } from "../../../_staging/drills/drillingUtils.js";
import { type IDrillToAttributeUrl } from "../../commands/drill.js";
import {
    type IDashboardDrillToAttributeUrlResolved,
    drillToAttributeUrlRequested,
    drillToAttributeUrlResolved,
} from "../../events/drill.js";
import { selectWidgetDrills } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* drillToAttributeUrlHandler(
    ctx: DashboardContext,
    cmd: IDrillToAttributeUrl,
): SagaIterator<IDashboardDrillToAttributeUrlResolved> {
    yield put(
        drillToAttributeUrlRequested(
            ctx,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent,
            cmd.correlationId,
        ),
    );

    const [resolvedUrl, filtersInfo]: [
        SagaReturnType<typeof resolveDrillToAttributeUrl>,
        SagaReturnType<typeof getDrillToUrlFiltersWithResolvedValues>,
    ] = yield all([
        call(resolveDrillToAttributeUrl, cmd.payload.drillDefinition, cmd.payload.drillEvent, ctx),
        call(getDrillToUrlFiltersWithResolvedValues, ctx, cmd.payload.drillEvent.widgetRef!),
    ]);

    const { widgetRef } = cmd.payload.drillEvent;
    const widgetConfiguredDrills = yield select(selectWidgetDrills(widgetRef));

    const isImplicit = !isDrillConfigured(cmd.payload.drillDefinition, widgetConfiguredDrills);

    return drillToAttributeUrlResolved(
        ctx,
        resolvedUrl!,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        filtersInfo,
        isImplicit,
        cmd.correlationId,
    );
}
