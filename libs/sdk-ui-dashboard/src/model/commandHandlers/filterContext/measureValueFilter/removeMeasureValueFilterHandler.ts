// (C) 2026 GoodData Corporation

import { difference } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { type ObjRef, dashboardFilterLocalIdentifier, dashboardFilterObjRef } from "@gooddata/sdk-model";

import { type IRemoveMeasureValueFilters } from "../../../commands/filters.js";
import { measureValueFilterRemoved } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectFilterContextMeasureValueFilters } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* removeMeasureValueFilterHandler(
    ctx: DashboardContext,
    cmd: IRemoveMeasureValueFilters,
): SagaIterator<void> {
    const { localIdentifiers } = cmd.payload;

    const allFilters: ReturnType<typeof selectFilterContextMeasureValueFilters> = yield select(
        selectFilterContextMeasureValueFilters,
    );

    const knownLocalIds = allFilters
        .map((filter) => dashboardFilterLocalIdentifier(filter))
        .filter((id): id is string => typeof id === "string");

    const invalidLocalIds = difference(localIdentifiers, knownLocalIds);
    if (invalidLocalIds.length) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Invalid measure value filter localIdentifiers provided. These ids were not found: ${invalidLocalIds.join(
                ", ",
            )}.`,
        );
    }

    const removedFilters = allFilters.filter((filter) => {
        const localId = dashboardFilterLocalIdentifier(filter);
        return typeof localId === "string" && localIdentifiers.includes(localId);
    });

    for (const removedFilter of removedFilters) {
        const localIdentifier = dashboardFilterLocalIdentifier(removedFilter)!;
        const removedMeasureRef: ObjRef | undefined = dashboardFilterObjRef(removedFilter);

        yield put(tabsActions.removeMeasureValueFilter({ localIdentifier }));
        yield put(tabsActions.removeMeasureValueFilterConfig(localIdentifier));
        if (removedMeasureRef) {
            yield put(
                tabsActions.removeIgnoredMeasureValueFilter({
                    measureRefs: [removedMeasureRef],
                }),
            );
        }

        yield dispatchDashboardEvent(measureValueFilterRemoved(ctx, removedFilter, cmd.correlationId));
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
