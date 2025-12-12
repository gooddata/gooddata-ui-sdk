// (C) 2023-2025 GoodData Corporation

import { isEmpty } from "lodash-es";
import { all, call, put, select } from "redux-saga/effects";
import { v4 as uuid } from "uuid";

import {
    type IDashboardAttributeFilter,
    type ObjRef,
    areObjRefsEqual,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";

import { convertIntersectionToAttributeFilters } from "./common/intersectionUtils.js";
import { type CrossFiltering } from "../../commands/drill.js";
import {
    addAttributeFilter,
    changeAttributeFilterSelection,
    removeAttributeFilters,
    resetFilterContextWorkingSelection,
} from "../../commands/filters.js";
import { crossFilteringRequested, crossFilteringResolved } from "../../events/drill.js";
import { generateFilterLocalIdentifier } from "../../store/_infra/generators.js";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors.js";
import {
    selectEnableCrossFilteringAliasTitles,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
} from "../../store/config/configSelectors.js";
import {
    selectCrossFilteringFiltersLocalIdentifiers,
    selectCrossFilteringItemByWidgetRef,
} from "../../store/drill/drillSelectors.js";
import { drillActions } from "../../store/drill/index.js";
import { selectAttributeFilterConfigsDisplayAsLabelMap } from "../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectFilterContextDraggableFilters } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { addAttributeFilterHandler } from "../filterContext/attributeFilter/addAttributeFilterHandler.js";
import { changeAttributeFilterSelectionHandler } from "../filterContext/attributeFilter/changeAttributeFilterSelectionHandler.js";
import { removeAttributeFiltersHandler } from "../filterContext/attributeFilter/removeAttributeFiltersHandler.js";

function findMatchingVirtualFilter(
    currentVirtualFilters: IDashboardAttributeFilter[],
    attributeFilterDisplayAsLabelMap: Map<string, ObjRef>,
    displayForm: ObjRef,
    primaryLabel: ObjRef | undefined,
): IDashboardAttributeFilter | undefined {
    return currentVirtualFilters.find((vf) => {
        const vfDisplayAsLabel = attributeFilterDisplayAsLabelMap.get(vf.attributeFilter.localIdentifier!);
        const useDisplayAsLabel = displayForm && primaryLabel && !areObjRefsEqual(displayForm, primaryLabel);
        const displayFormMatches =
            // strict checking of both primary and secondary label means that cross filtering is able to create two filters using same primary label but different display as label. It was possible even before.
            vfDisplayAsLabel || useDisplayAsLabel ? areObjRefsEqual(vfDisplayAsLabel, displayForm) : true;

        return areObjRefsEqual(vf.attributeFilter.displayForm, primaryLabel) && displayFormMatches;
    });
}

function shouldUpdateExistingFiltering(
    crossFilteringItemByWidget: { filterLocalIdentifiers: string[] } | undefined,
    drillIntersectionFiltersLength: number,
): boolean {
    /**
     * Intersection may have multiple lengths in pivot table so we need to make sure that when we are updating existing
     * cross-filtering, the intersection length has to be larger or the same than the current virtual filters length.
     * Otherwise we would want the cross-filtering to be reset together with all virtual filters.
     */
    return (
        !isEmpty(crossFilteringItemByWidget) &&
        crossFilteringItemByWidget!.filterLocalIdentifiers.length <= drillIntersectionFiltersLength
    );
}

function createVirtualFilter(
    drillFilterData: ReturnType<typeof convertIntersectionToAttributeFilters>[number],
    existingLocalIdentifier: string | undefined,
    filtersCount: number,
    index: number,
): IDashboardAttributeFilter {
    const { displayForm, attributeElements, negativeSelection, title } =
        drillFilterData.attributeFilter.attributeFilter;

    return {
        attributeFilter: {
            displayForm,
            attributeElements,
            negativeSelection,
            localIdentifier:
                existingLocalIdentifier ?? generateFilterLocalIdentifier(displayForm, filtersCount + index),
            selectionMode: "multi",
            title,
        },
    };
}

export function* crossFilteringHandler(ctx: DashboardContext, cmd: CrossFiltering) {
    yield put(
        crossFilteringRequested(ctx, cmd.payload.drillDefinition, cmd.payload.drillEvent, cmd.correlationId),
    );

    const enableCrossFilteringAliasTitles: ReturnType<typeof selectEnableCrossFilteringAliasTitles> =
        yield select(selectEnableCrossFilteringAliasTitles);

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
        enableCrossFilteringAliasTitles,
        filtersCount,
    );

    const attributeFilterDisplayAsLabelMap: ReturnType<typeof selectAttributeFilterConfigsDisplayAsLabelMap> =
        yield select(selectAttributeFilterConfigsDisplayAsLabelMap);

    const shouldUpdateExisting = shouldUpdateExistingFiltering(
        crossFilteringItemByWidget,
        drillIntersectionFilters.length,
    );

    const virtualFilters = drillIntersectionFilters.map((drillFilterData, i) => {
        const { displayForm } = drillFilterData.attributeFilter.attributeFilter;
        const { primaryLabel } = drillFilterData;

        const existingVirtualFilter = shouldUpdateExisting
            ? findMatchingVirtualFilter(
                  currentVirtualFilters,
                  attributeFilterDisplayAsLabelMap,
                  displayForm,
                  primaryLabel,
              )
            : undefined;

        return createVirtualFilter(
            drillFilterData,
            existingVirtualFilter?.attributeFilter.localIdentifier,
            filtersCount,
            i,
        );
    });

    const correlation = `crossFiltering_${uuid()}`;

    const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
        yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    // Reset working selection if apply modes are enabled
    if (isApplyAllAtOnceEnabledAndSet) {
        yield put(resetFilterContextWorkingSelection());
    }

    // Cleanup of previous cross-filtering state
    if (!shouldUpdateExisting) {
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
    const activeTabId: ReturnType<typeof selectActiveOrDefaultTabLocalIdentifier> = yield select(
        selectActiveOrDefaultTabLocalIdentifier,
    );

    const crossFilteringItem = {
        widgetRef,
        filterLocalIdentifiers: virtualFilters.map((vf) => vf.attributeFilter.localIdentifier!),
        selectedPoints: cmd.payload.drillEvent.drillContext.intersection
            ? [cmd.payload.drillEvent.drillContext.intersection]
            : undefined,
    };

    yield put(drillActions.crossFilterByWidget({ item: crossFilteringItem, tabId: activeTabId }));
    yield all(
        virtualFilters.map((vf, index) => {
            const isExistingVirtualFilter = currentVirtualFiltersLocalIdentifiers.includes(
                vf.attributeFilter.localIdentifier!,
            );

            return isExistingVirtualFilter
                ? call(
                      changeAttributeFilterSelectionHandler,
                      ctx,
                      changeAttributeFilterSelection(
                          vf.attributeFilter.localIdentifier!,
                          vf.attributeFilter.attributeElements,
                          vf.attributeFilter.negativeSelection ? "NOT_IN" : "IN",
                          correlation,
                      ),
                  )
                : call(
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
