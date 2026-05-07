// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import {
    type IDashboardMeasureValueFilter,
    areObjRefsEqual,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { type IAddMeasureValueFilter } from "../../../commands/filters.js";
import { measureValueFilterAdded } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectBackendCapabilities } from "../../../store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectAllCatalogMeasuresMap } from "../../../store/catalog/catalogSelectors.js";
import {
    selectCanAddMoreFilters,
    selectFilterContextFilters,
    selectFilterContextMeasureValueFilters,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* addMeasureValueFilterHandler(
    ctx: DashboardContext,
    cmd: IAddMeasureValueFilter,
): SagaIterator<void> {
    const { index, measure, mode, localIdentifier, title } = cmd.payload;

    const isUnderFilterCountLimit: ReturnType<typeof selectCanAddMoreFilters> =
        yield select(selectCanAddMoreFilters);

    if (!isUnderFilterCountLimit) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add filter, even though the limit on the count of filters has been reached.`,
        );
    }

    const measures: ReturnType<typeof selectAllCatalogMeasuresMap> =
        yield select(selectAllCatalogMeasuresMap);
    const usedMeasure = measures.get(measure);

    if (!usedMeasure) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add measure value filter for a non-existing measure ${objRefToString(measure)}.`,
        );
    }

    const allFilters: ReturnType<typeof selectFilterContextMeasureValueFilters> = yield select(
        selectFilterContextMeasureValueFilters,
    );

    if (localIdentifier) {
        const existingFilters: ReturnType<typeof selectFilterContextFilters> =
            yield select(selectFilterContextFilters);
        const usedLocalIdentifier = existingFilters.some(
            (filter) => dashboardFilterLocalIdentifier(filter) === localIdentifier,
        );

        if (usedLocalIdentifier) {
            throw invalidArgumentsProvided(
                ctx,
                cmd,
                `Filter with localIdentifier ${localIdentifier} already exists in the filter context.`,
            );
        }
    }

    const usedFilter = allFilters.find((filter) => areObjRefsEqual(dashboardFilterObjRef(filter), measure));

    if (usedFilter) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Measure value filter for measure ${objRefToString(measure)} already exists in the filter context.`,
        );
    }

    yield put(
        tabsActions.addMeasureValueFilter({
            index,
            measure,
            localIdentifier,
            title,
        }),
    );

    const updatedFilters: ReturnType<typeof selectFilterContextMeasureValueFilters> = yield select(
        selectFilterContextMeasureValueFilters,
    );
    const addedFilter: IDashboardMeasureValueFilter | undefined = localIdentifier
        ? updatedFilters.find((filter) => dashboardFilterLocalIdentifier(filter) === localIdentifier)
        : updatedFilters.find((filter) => areObjRefsEqual(dashboardFilterObjRef(filter), measure));

    invariant(addedFilter, "Inconsistent state in addMeasureValueFilterHandler");

    const capabilities: ReturnType<typeof selectBackendCapabilities> =
        yield select(selectBackendCapabilities);
    if (capabilities.supportsHiddenAndLockedFiltersOnUI && mode) {
        yield put(
            tabsActions.changeMeasureValueFilterConfigMode({
                localIdentifier: dashboardFilterLocalIdentifier(addedFilter)!,
                mode,
            }),
        );
    }

    yield dispatchDashboardEvent(measureValueFilterAdded(ctx, addedFilter, index, cmd.correlationId));

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
