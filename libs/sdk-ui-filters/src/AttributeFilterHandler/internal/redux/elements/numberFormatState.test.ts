// (C) 2026 GoodData Corporation

import { type AnyAction } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type ILoadElementsResult } from "../../../types/elementsLoader.js";
import { INIT_SELECTION_PREFIX } from "../constants.js";
import { actions, sliceReducer } from "../store/slice.js";
import { type IAttributeFilterState, initialState } from "../store/state.js";

import { selectLoadElementsOptions, selectSearch } from "./elementsSelectors.js";
import { InMemoryPaging } from "./InMemoryPaging.js";

const state = (numberFormat?: string): IAttributeFilterState =>
    ({
        ...initialState,
        displayFormRef: idRef("amount", "computedAttribute"),
        elementsForm: "uris",
        initialization: { status: "loading" },
        elements: { ...initialState.elements, numberFormat },
    }) as IAttributeFilterState;

// the slice reducer is typed as a case reducer, which may return nothing; it always returns the state
const reduce = (current: IAttributeFilterState, action: AnyAction) =>
    sliceReducer(current, action) as IAttributeFilterState;

const result = (numberFormat: string | undefined, withElements: boolean): ILoadElementsResult => ({
    elements: [{ title: "1234.5", uri: "1234.5" }],
    totalCount: 1,
    options: withElements ? { elements: { uris: ["1234.5"] } } : {},
    ...(numberFormat === undefined ? {} : { numberFormat }),
});

describe("number format of the filter elements", () => {
    it("is taken from the load that resolves the selected elements at init", () => {
        const next = reduce(
            state(),
            actions.loadCustomElementsSuccess({
                ...result("#,##0.0", true),
                correlation: `${INIT_SELECTION_PREFIX}1`,
            }),
        );

        expect(next.elements.numberFormat).toBe("#,##0.0");
    });

    it("is taken from other custom loads", () => {
        const next = reduce(state(), actions.loadCustomElementsSuccess(result("#,##0.0", false)));

        expect(next.elements.numberFormat).toBe("#,##0.0");
    });

    it("is kept when a later load comes without one", () => {
        const afterCustom = reduce(
            state("#,##0.0"),
            actions.loadCustomElementsSuccess(result(undefined, true)),
        );
        const afterInitialPage = reduce(
            state("#,##0.0"),
            actions.loadInitialElementsPageSuccess({ ...result(undefined, false), correlation: "c" }),
        );

        expect(afterCustom.elements.numberFormat).toBe("#,##0.0");
        expect(afterInitialPage.elements.numberFormat).toBe("#,##0.0");
    });
});

describe("InMemoryPaging", () => {
    const items = Array.from({ length: 157 }, (_, i) => ({ title: `${i}`, uri: `${i}` }));

    it("goes to a page by the page size, also from a partial last page", async () => {
        const lastPage = new InMemoryPaging(items, 50, 150, "#,##0");
        expect(lastPage.items).toHaveLength(7);

        const page = await lastPage.goTo(3);

        expect(page.offset).toBe(150);
        expect(page.numberFormat).toBe("#,##0");
        expect((await lastPage.goTo(1)).items[0].title).toBe("50");
    });
});

describe("search of number-formatted elements", () => {
    const searching = (search: string, numberFormat?: string): IAttributeFilterState => {
        const current = state(numberFormat);
        return {
            ...current,
            config: { ...current.config, separators: { thousand: " ", decimal: "," } },
            elements: { ...current.elements, currentOptions: { ...current.elements.currentOptions, search } },
        };
    };

    it("loads the elements by the raw value of a number typed with the display separators", () => {
        const current = searching("1 234,5", "#,##0.0");

        expect(selectLoadElementsOptions(current).search).toBe("1234.5");
        // the search shown to the user stays as typed
        expect(selectSearch(current)).toBe("1 234,5");
    });

    it("loads the elements by the search as typed otherwise", () => {
        expect(selectLoadElementsOptions(searching("1 234,5")).search).toBe("1 234,5");
        expect(selectLoadElementsOptions(searching("1.2 K", "#,##0")).search).toBe("1.2 K");
    });
});
