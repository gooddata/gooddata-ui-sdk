// (C) 2023-2024 GoodData Corporation
import { all, put, call, select } from "redux-saga/effects";
import {
    IDashboardAttributeFilter,
    areObjRefsEqual,
    filterAttributeElements,
    filterObjRef,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes.js";
import { selectFilterContextAttributeFilters } from "../../store/filterContext/filterContextSelectors.js";
import { convertIntersectionToAttributeFilters } from "./common/intersectionUtils.js";
import {
    addAttributeFilter,
    changeAttributeFilterSelection,
    removeAttributeFilters,
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

export function* crossFilteringHandler(ctx: DashboardContext, cmd: CrossFiltering) {
    yield put(
        crossFilteringRequested(ctx, cmd.payload.drillDefinition, cmd.payload.drillEvent, cmd.correlationId),
    );

    const backendSupportsElementUris = !!ctx.backend.capabilities.supportsElementUris;
    const widgetRef = cmd.payload.drillEvent.widgetRef!;
    const currentFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );
    const dateAttributes: ReturnType<typeof selectCatalogDateAttributes> = yield select(
        selectCatalogDateAttributes,
    );
    const dateDataSetsAttributesRefs = dateAttributes.map((dateAttribute) => dateAttribute.attribute.ref);

    const currentVirtualFiltersLocalIdentifiers: ReturnType<
        typeof selectCrossFilteringFiltersLocalIdentifiers
    > = yield select(selectCrossFilteringFiltersLocalIdentifiers);
    const currentVirtualFilters = currentVirtualFiltersLocalIdentifiers.map((localIdentifier) => {
        return currentFilters.find((filter) => filter.attributeFilter.localIdentifier === localIdentifier)!;
    });
    const crossFilteringItemByWidget: ReturnType<ReturnType<typeof selectCrossFilteringItemByWidgetRef>> =
        yield select(selectCrossFilteringItemByWidgetRef(widgetRef));

    const drillIntersectionFilters = convertIntersectionToAttributeFilters(
        cmd.payload.drillEvent.drillContext.intersection ?? [],
        dateDataSetsAttributesRefs,
        backendSupportsElementUris,
    );

    const shouldUpdateExistingCrossFiltering =
        !isEmpty(crossFilteringItemByWidget) &&
        /**
         * Intersection may have multiple lengths in pivot table so we need to make sure that when we are updating existing
         * cross-filtering, the intersection length has to be larger or the same than the current virtual filters length.
         * Otherwise we would want the cross-filtering to be reset together with all virtual filters.
         */
        crossFilteringItemByWidget?.filterLocalIdentifiers.length <= drillIntersectionFilters.length;

    const virtualFilters = drillIntersectionFilters.map((filter) => {
        const displayForm = filterObjRef(filter);
        const attributeElements = filterAttributeElements(filter);
        const negativeSelection = isNegativeAttributeFilter(filter);
        const existingVirtualFilter = shouldUpdateExistingCrossFiltering
            ? currentVirtualFilters.find((vf) => {
                  return areObjRefsEqual(vf.attributeFilter.displayForm, displayForm);
              })
            : undefined;

        const dashboardFilter: IDashboardAttributeFilter = {
            attributeFilter: {
                displayForm,
                attributeElements,
                negativeSelection,
                localIdentifier: existingVirtualFilter?.attributeFilter.localIdentifier ?? uuid(),
                selectionMode: "multi",
            },
        };

        return dashboardFilter;
    });

    const correlation = `crossFiltering_${uuid()}`;

    // Cleanup of previous cross-filtering state
    if (!shouldUpdateExistingCrossFiltering) {
        yield call(
            removeAttributeFiltersHandler,
            ctx,
            removeAttributeFilters(currentVirtualFiltersLocalIdentifiers),
        );
    }

    // Handle new cross-filtering state
    const effectiveFiltersLength = currentFilters.length - currentVirtualFiltersLocalIdentifiers.length;
    yield put(
        drillActions.crossFilterByWidget({
            widgetRef,
            filterLocalIdentifiers: virtualFilters.map((vf) => vf.attributeFilter.localIdentifier!),
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
                      ),
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
