// (C) 2023 GoodData Corporation
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
import { addAttributeFilter, changeAttributeFilterSelection } from "../../commands/filters.js";
import { CrossFiltering } from "../../commands/drill.js";
import { crossFilteringRequested, crossFilteringResolved } from "../../events/drill.js";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors.js";
import { drillActions } from "../../store/drill/index.js";
import { v4 as uuid } from "uuid";
import { addAttributeFilterHandler } from "../filterContext/attributeFilter/addAttributeFilterHandler.js";
import { selectCrossFilteringFiltersLocalIdentifiers } from "../../store/drill/drillSelectors.js";
import { changeAttributeFilterSelectionHandler } from "../filterContext/attributeFilter/changeAttributeFilterSelectionHandler.js";

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

    const drillIntersectionFilters = convertIntersectionToAttributeFilters(
        cmd.payload.drillEvent.drillContext.intersection ?? [],
        dateDataSetsAttributesRefs,
        backendSupportsElementUris,
    );

    const virtualFilters = drillIntersectionFilters.map((filter) => {
        const displayForm = filterObjRef(filter);
        const attributeElements = filterAttributeElements(filter);
        const negativeSelection = isNegativeAttributeFilter(filter);
        const existingVirtualFilter = currentVirtualFilters.find((vf) => {
            return areObjRefsEqual(vf.attributeFilter.displayForm, displayForm);
        });

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

    yield put(
        drillActions.crossFilterByWidget({
            widgetRef,
            filterLocalIdentifiers: virtualFilters.map((vf) => vf.attributeFilter.localIdentifier!),
        }),
    );

    yield all(
        virtualFilters.map((vf) => {
            const isExistingVirtualFilter = currentVirtualFiltersLocalIdentifiers.includes(
                vf.attributeFilter.localIdentifier!,
            );

            return !isExistingVirtualFilter
                ? call(
                      addAttributeFilterHandler,
                      ctx,
                      addAttributeFilter(
                          vf.attributeFilter.displayForm,
                          currentFilters.length + 1,
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
