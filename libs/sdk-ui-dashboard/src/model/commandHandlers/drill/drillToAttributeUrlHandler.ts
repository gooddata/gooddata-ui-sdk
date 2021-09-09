// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, put, SagaReturnType, select } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { DrillToAttributeUrl } from "../../commands/drill";
import {
    DashboardDrillToAttributeUrlResolved,
    drillToAttributeUrlRequested,
    drillToAttributeUrlResolved,
} from "../../events/drill";
import { resolveDrillToAttributeUrl } from "./resolveDrillToAttributeUrl";
import { getDrillToUrlFiltersWithResolvedValues } from "./getDrillToUrlFilters";
import { selectWidgetDrills } from "../../state/layout/layoutSelectors";
import { isDrillConfigured } from "../../../_staging/drills/drillingUtils";

export function* drillToAttributeUrlHandler(
    ctx: DashboardContext,
    cmd: DrillToAttributeUrl,
): SagaIterator<DashboardDrillToAttributeUrlResolved> {
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
