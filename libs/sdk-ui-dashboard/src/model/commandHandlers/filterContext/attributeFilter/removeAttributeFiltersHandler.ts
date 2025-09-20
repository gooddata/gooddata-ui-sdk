// (C) 2021-2025 GoodData Corporation
import { compact, difference, partition } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { areObjRefsEqual, isInsightWidget } from "@gooddata/sdk-model";

import { RemoveAttributeFilters } from "../../../commands/filters.js";
import { attributeFilterRemoved } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { attributeFilterConfigsActions } from "../../../store/attributeFilterConfigs/index.js";
import { selectFilterContextAttributeFilters } from "../../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { layoutActions } from "../../../store/layout/index.js";
import { selectAllAnalyticalWidgets } from "../../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { validateDrillToCustomUrlParams } from "../../common/validateDrillToCustomUrlParams.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* removeAttributeFiltersHandler(
    ctx: DashboardContext,
    cmd: RemoveAttributeFilters,
): SagaIterator<void> {
    const { filterLocalIds } = cmd.payload;

    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    const [removedFilters, survivingFilters] = partition(allFilters, (item) =>
        filterLocalIds.includes(item.attributeFilter.localIdentifier!),
    );

    const invalidLocalIds = difference(
        filterLocalIds,
        allFilters.map((filter) => filter.attributeFilter.localIdentifier),
    );

    if (invalidLocalIds.length) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Invalid filterLocalIds provided. These ids were not found: ${invalidLocalIds.join(", ")}.`,
        );
    }

    for (const removedFilter of removedFilters) {
        const affectedChildren = survivingFilters.filter((item) =>
            item.attributeFilter.filterElementsBy?.some((parent) =>
                filterLocalIds.includes(parent.filterLocalIdentifier),
            ),
        );

        // When cross filtering, duplicate filter may exist in surviving filters. In such cases, we
        // don't want to remove the filter from ignored filters of widget. We match by display form
        // here instead of local identifier as the local identifier is not available in ignored
        // filters state.
        const isFilterDuplicatedInSurvivingFilters = survivingFilters.some((item) =>
            areObjRefsEqual(item.attributeFilter.displayForm, removedFilter.attributeFilter.displayForm),
        );
        const removeIgnoredAttributeFilterActionArray = isFilterDuplicatedInSurvivingFilters
            ? []
            : [
                  layoutActions.removeIgnoredAttributeFilter({
                      displayFormRefs: [removedFilter.attributeFilter.displayForm],
                  }),
              ];

        const batch = batchActions(
            compact([
                // remove filter from parents and keep track of the affected filters
                ...affectedChildren.map(({ attributeFilter }) =>
                    filterContextActions.setAttributeFilterParents({
                        filterLocalId: attributeFilter.localIdentifier!,
                        parentFilters: attributeFilter.filterElementsBy!.filter(
                            (parent) =>
                                parent.filterLocalIdentifier !==
                                removedFilter?.attributeFilter.localIdentifier,
                        ),
                    }),
                ),
                // remove filter itself
                filterContextActions.removeAttributeFilter({
                    filterLocalId: removedFilter.attributeFilter.localIdentifier!,
                }),
                // remove filter's display form metadata object
                filterContextActions.removeAttributeFilterDisplayForms(
                    removedFilter.attributeFilter.displayForm,
                ),
                // remove reflect dashboard attribute filter config
                attributeFilterConfigsActions.removeAttributeFilterConfig(
                    removedFilter.attributeFilter.localIdentifier!,
                ),
                // house-keeping: ensure the removed attribute filter disappears from widget ignore lists
                ...removeIgnoredAttributeFilterActionArray,
            ]),
        );

        yield put(batch);
        yield dispatchDashboardEvent(
            attributeFilterRemoved(ctx, removedFilter!, affectedChildren, cmd.correlationId),
        );
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);

    const widgets: ReturnType<typeof selectAllAnalyticalWidgets> = yield select(selectAllAnalyticalWidgets);
    yield call(validateDrillToCustomUrlParams, widgets.filter(isInsightWidget));
}
