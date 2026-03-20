// (C) 2021-2026 GoodData Corporation

import { compact, difference, partition } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import {
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemFilterElementsBy,
    dashboardAttributeFilterItemLocalIdentifier,
    isInsightWidget,
} from "@gooddata/sdk-model";

import { type IRemoveAttributeFilters } from "../../../commands/filters.js";
import { attributeFilterRemoved } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectFilterContextAttributeFilterItems } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { selectAllAnalyticalWidgets } from "../../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { validateDrillToCustomUrlParams } from "../../common/validateDrillToCustomUrlParams.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* removeAttributeFiltersHandler(
    ctx: DashboardContext,
    cmd: IRemoveAttributeFilters,
): SagaIterator<void> {
    const { filterLocalIds } = cmd.payload;

    const allFilters: ReturnType<typeof selectFilterContextAttributeFilterItems> = yield select(
        selectFilterContextAttributeFilterItems,
    );

    const [removedFilters, survivingFilters] = partition(allFilters, (item) =>
        filterLocalIds.includes(dashboardAttributeFilterItemLocalIdentifier(item)!),
    );

    const invalidLocalIds = difference(
        filterLocalIds,
        allFilters.map((filter) => dashboardAttributeFilterItemLocalIdentifier(filter)),
    );

    if (invalidLocalIds.length) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Invalid filterLocalIds provided. These ids were not found: ${invalidLocalIds.join(", ")}.`,
        );
    }

    for (const removedFilter of removedFilters) {
        // Standard and arbitrary attribute filters can have parent-child relationships via filterElementsBy
        const affectedChildren = survivingFilters.filter((item) => {
            const filterElementsBy = dashboardAttributeFilterItemFilterElementsBy(item);
            return filterElementsBy?.some((parent) => filterLocalIds.includes(parent.filterLocalIdentifier));
        });

        const removedDisplayForm = dashboardAttributeFilterItemDisplayForm(removedFilter)!;
        const removedLocalId = dashboardAttributeFilterItemLocalIdentifier(removedFilter)!;

        // When cross filtering, duplicate filter may exist in surviving filters. In such cases, we
        // don't want to remove the filter from ignored filters of widget. We match by display form
        // here instead of local identifier as the local identifier is not available in ignored
        // filters state.
        const isFilterDuplicatedInSurvivingFilters = survivingFilters.some((item) =>
            areObjRefsEqual(dashboardAttributeFilterItemDisplayForm(item), removedDisplayForm),
        );
        const removeIgnoredAttributeFilterActionArray = isFilterDuplicatedInSurvivingFilters
            ? []
            : [
                  tabsActions.removeIgnoredAttributeFilter({
                      displayFormRefs: [removedDisplayForm],
                  }),
              ];

        const batch = batchActions(
            compact([
                // remove filter from parents for all affected children (standard and arbitrary filters)
                ...affectedChildren.map((item) =>
                    tabsActions.setAttributeFilterParents({
                        filterLocalId: dashboardAttributeFilterItemLocalIdentifier(item)!,
                        parentFilters: (dashboardAttributeFilterItemFilterElementsBy(item) ?? []).filter(
                            (parent) => parent.filterLocalIdentifier !== removedLocalId,
                        ),
                    }),
                ),
                // remove filter itself
                tabsActions.removeAttributeFilter({
                    filterLocalId: removedLocalId,
                }),
                // remove filter's display form metadata object
                tabsActions.removeAttributeFilterDisplayForms(removedDisplayForm),
                // remove reflect dashboard attribute filter config
                tabsActions.removeAttributeFilterConfig(removedLocalId),
                // house-keeping: ensure the removed attribute filter disappears from widget ignore lists
                ...removeIgnoredAttributeFilterActionArray,
            ]),
        );

        yield put(batch);
        yield dispatchDashboardEvent(
            attributeFilterRemoved(ctx, removedFilter, affectedChildren, cmd.correlationId),
        );
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);

    const widgets: ReturnType<typeof selectAllAnalyticalWidgets> = yield select(selectAllAnalyticalWidgets);
    yield call(validateDrillToCustomUrlParams, widgets.filter(isInsightWidget));
}
