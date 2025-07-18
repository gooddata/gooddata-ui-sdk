// (C) 2023-2025 GoodData Corporation
import { all, put, call, select } from "redux-saga/effects";
import { IDashboardAttributeFilter, areObjRefsEqual, isDashboardAttributeFilter } from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes.js";
import { selectFilterContextDraggableFilters } from "../../store/filterContext/filterContextSelectors.js";
import { convertIntersectionToAttributeFilters } from "./common/intersectionUtils.js";
import {
    addAttributeFilter,
    changeAttributeFilterSelection,
    removeAttributeFilters,
    resetFilterContextWorkingSelection,
} from "../../commands/filters.js";
import { CrossFiltering } from "../../commands/drill.js";
import { crossFilteringRequested, crossFilteringResolved } from "../../events/drill.js";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors.js";
import { drillActions } from "../../store/drill/index.js";
import { v4 as uuid } from "uuid";
import { addAttributeFilterHandler } from "../filterContext/attributeFilter/addAttributeFilterHandler.js";
import {
    selectCrossFilteringItemByWidgetRef,
    selectCrossFilteringFiltersLocalIdentifiers,
} from "../../store/drill/drillSelectors.js";
import { changeAttributeFilterSelectionHandler } from "../filterContext/attributeFilter/changeAttributeFilterSelectionHandler.js";
import { removeAttributeFiltersHandler } from "../filterContext/attributeFilter/removeAttributeFiltersHandler.js";
import isEmpty from "lodash/isEmpty.js";
import {
    selectEnableCrossFilteringAliasTitles,
    selectEnableDuplicatedLabelValuesInAttributeFilter,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
} from "../../store/config/configSelectors.js";
import { selectAttributeFilterConfigsDisplayAsLabelMap } from "../../store/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { generateFilterLocalIdentifier } from "../../store/_infra/generators.js";

export function* crossFilteringHandler(ctx: DashboardContext, cmd: CrossFiltering) {
    yield put(
        crossFilteringRequested(ctx, cmd.payload.drillDefinition, cmd.payload.drillEvent, cmd.correlationId),
    );

    const enableDuplicatedLabelValuesInAttributeFilter: ReturnType<
        typeof selectEnableDuplicatedLabelValuesInAttributeFilter
    > = yield select(selectEnableDuplicatedLabelValuesInAttributeFilter);
    const enableCrossFilteringAliasTitles: ReturnType<typeof selectEnableCrossFilteringAliasTitles> =
        yield select(selectEnableCrossFilteringAliasTitles);

    const backendSupportsElementUris = !!ctx.backend.capabilities.supportsElementUris;
    const widgetRef = cmd.payload.drillEvent.widgetRef!;
    const currentFilters: ReturnType<typeof selectFilterContextDraggableFilters> = yield select(
        selectFilterContextDraggableFilters,
    );
    const dateAttributes: ReturnType<typeof selectCatalogDateAttributes> =
        yield select(selectCatalogDateAttributes);
    const dateDataSetsAttributesRefs = dateAttributes.map((dateAttribute) => dateAttribute.attribute.ref);

    let currentVirtualFiltersLocalIdentifiers: ReturnType<
        typeof selectCrossFilteringFiltersLocalIdentifiers
    > = yield select(selectCrossFilteringFiltersLocalIdentifiers);
    const currentVirtualFilters = currentVirtualFiltersLocalIdentifiers.map((localIdentifier) => {
        return currentFilters
            .filter(isDashboardAttributeFilter)
            .find((filter) => filter.attributeFilter.localIdentifier === localIdentifier)!;
    });
    const crossFilteringItemByWidget: ReturnType<ReturnType<typeof selectCrossFilteringItemByWidgetRef>> =
        yield select(selectCrossFilteringItemByWidgetRef(widgetRef));

    //default date filter is not included in currentFilters so we need to add 1 to the length
    const filtersCount = currentFilters.length + 1;
    const drillIntersectionFilters = convertIntersectionToAttributeFilters(
        cmd.payload.drillEvent.drillContext.intersection ?? [],
        dateDataSetsAttributesRefs,
        backendSupportsElementUris,
        enableDuplicatedLabelValuesInAttributeFilter,
        enableCrossFilteringAliasTitles,
        filtersCount,
    );

    const attributeFilterDisplayAsLabelMap: ReturnType<typeof selectAttributeFilterConfigsDisplayAsLabelMap> =
        yield select(selectAttributeFilterConfigsDisplayAsLabelMap);

    const shouldUpdateExistingCrossFiltering =
        !isEmpty(crossFilteringItemByWidget) &&
        /**
         * Intersection may have multiple lengths in pivot table so we need to make sure that when we are updating existing
         * cross-filtering, the intersection length has to be larger or the same than the current virtual filters length.
         * Otherwise we would want the cross-filtering to be reset together with all virtual filters.
         */
        crossFilteringItemByWidget?.filterLocalIdentifiers.length <= drillIntersectionFilters.length;

    const virtualFilters = drillIntersectionFilters.map(({ attributeFilter, primaryLabel }, i) => {
        const { displayForm, attributeElements, negativeSelection, title } = attributeFilter.attributeFilter;

        const existingVirtualFilter = shouldUpdateExistingCrossFiltering
            ? currentVirtualFilters.find((vf) => {
                  if (enableDuplicatedLabelValuesInAttributeFilter) {
                      const vfDisplayAsLabel = attributeFilterDisplayAsLabelMap.get(
                          vf.attributeFilter.localIdentifier!,
                      );
                      const useDisplayAsLabel =
                          displayForm && primaryLabel && !areObjRefsEqual(displayForm, primaryLabel);
                      // strict checking of both primary and secondary label means that cross filtering is able to create two filters using same primary label but different display as label. It was possible even before.
                      return (
                          areObjRefsEqual(vf.attributeFilter.displayForm, primaryLabel) &&
                          (vfDisplayAsLabel || useDisplayAsLabel
                              ? areObjRefsEqual(vfDisplayAsLabel, displayForm)
                              : true)
                      );
                  }
                  return areObjRefsEqual(vf.attributeFilter.displayForm, displayForm);
              })
            : undefined;

        const dashboardFilter: IDashboardAttributeFilter = {
            attributeFilter: {
                displayForm,
                attributeElements,
                negativeSelection,
                localIdentifier:
                    existingVirtualFilter?.attributeFilter.localIdentifier ??
                    generateFilterLocalIdentifier(displayForm, filtersCount + i),
                selectionMode: "multi",
                title,
            },
        };

        return dashboardFilter;
    });

    const correlation = `crossFiltering_${uuid()}`;

    const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
        yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    // Reset working selection if apply modes are enabled
    if (isApplyAllAtOnceEnabledAndSet) {
        yield put(resetFilterContextWorkingSelection());
    }

    // Cleanup of previous cross-filtering state
    if (!shouldUpdateExistingCrossFiltering) {
        yield call(
            removeAttributeFiltersHandler,
            ctx,
            removeAttributeFilters(currentVirtualFiltersLocalIdentifiers),
        );
        // Reset virtual filters local identifiers because we are removing all virtual filters
        // in the previous call
        currentVirtualFiltersLocalIdentifiers = [];
    }

    // Handle new cross-filtering state
    const effectiveFiltersLength = currentFilters.length - currentVirtualFiltersLocalIdentifiers.length;
    yield put(
        drillActions.crossFilterByWidget({
            widgetRef,
            filterLocalIdentifiers: virtualFilters.map((vf) => vf.attributeFilter.localIdentifier!),
            selectedPoints: cmd.payload.drillEvent.drillContext.intersection
                ? [cmd.payload.drillEvent.drillContext.intersection]
                : undefined,
        }),
    );
    yield all(
        virtualFilters.map((vf, index) => {
            const isExistingVirtualFilter = currentVirtualFiltersLocalIdentifiers.includes(
                vf.attributeFilter.localIdentifier!,
            );

            return !isExistingVirtualFilter
                ? call(
                      addAttributeFilterHandler,
                      ctx,
                      addAttributeFilter(
                          vf.attributeFilter.displayForm,
                          effectiveFiltersLength + index,
                          correlation,
                          "multi",
                          "readonly",
                          vf.attributeFilter.attributeElements,
                          vf.attributeFilter.negativeSelection,
                          vf.attributeFilter.localIdentifier,
                          drillIntersectionFilters[index].primaryLabel,
                          vf.attributeFilter.title,
                      ),
                      "crossfilter",
                  )
                : call(
                      changeAttributeFilterSelectionHandler,
                      ctx,
                      changeAttributeFilterSelection(
                          vf.attributeFilter.localIdentifier!,
                          vf.attributeFilter.attributeElements,
                          vf.attributeFilter.negativeSelection ? "NOT_IN" : "IN",
                          correlation,
                      ),
                  );
        }),
    );

    return crossFilteringResolved(
        ctx,
        virtualFilters,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
