// (C) 2021 GoodData Corporation
import { select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { IDashboardAttributeFilter } from "@gooddata/sdk-backend-spi";
import { selectFilterContextAttributeFilters } from "../../../state/filterContext/filterContextSelectors";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";

export function* getAttributeFilterById(
    filterLocalId: string,
): SagaIterator<IDashboardAttributeFilter | undefined> {
    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    return allFilters.find((filter) => filter.attributeFilter.localIdentifier === filterLocalId);
}

export function* getAttributeFilterIndexById(filterLocalId: string): SagaIterator<number> {
    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    return allFilters.findIndex((filter) => filter.attributeFilter.localIdentifier === filterLocalId);
}

export function* getAttributeFilterByDisplayForm(
    displayForm: ObjRef,
): SagaIterator<IDashboardAttributeFilter | undefined> {
    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    return allFilters.find((filter) => areObjRefsEqual(filter.attributeFilter.displayForm, displayForm));
}
