// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { type ObjRef, uriRef } from "@gooddata/sdk-model";

import { ATTRIBUTE_ELEMENTS_INITIAL_STATE, attributeElementsReducer } from "./attribute_elements_reducer.js";
import {
    type IAttributeElementsUpdatedAction,
    attributeElementsUpdate,
    attributeElementsUpdated,
} from "./attribute_elements_store_actions.js";
import { type IAttributeElementsState } from "./attribute_elements_types.js";

describe("Attribute Elements Reducer", () => {
    describe("#ATTRIBUTE_ELEMENTS_UPDATE", () => {
        it("should set loading flag, update query and mark items to be loaded with null", () => {
            const state = ATTRIBUTE_ELEMENTS_INITIAL_STATE;
            const action = attributeElementsUpdate(uriRef("foo"), "", 0, 5);

            const newState = attributeElementsReducer(state, action);

            const expectedState: IAttributeElementsState = {
                query: {
                    attributeDisplayFormRef: uriRef("foo"),
                    searchPhrase: "",
                },
                isLoading: true,
                items: [null, null, null, null, null],
                total: undefined,
                filteredTotal: undefined,
            };
            expect(newState).toEqual(expectedState);
        });

        it("should just mark items to be loaded when only the range changed", () => {
            const state: IAttributeElementsState = {
                query: {
                    attributeDisplayFormRef: uriRef("foo"),
                    searchPhrase: "",
                },
                isLoading: true,
                items: [null, null, null, null, { uri: "uri/1", title: "title1" }],
                total: 10,
                filteredTotal: 0,
            };
            const action = attributeElementsUpdate(uriRef("foo"), "", 3, 8);

            const newState = attributeElementsReducer(state, action);

            const expectedState: IAttributeElementsState = {
                query: {
                    attributeDisplayFormRef: uriRef("foo"),
                    searchPhrase: "",
                },
                isLoading: true,
                items: [null, null, null, null, { uri: "uri/1", title: "title1" }, null, null, null],
                total: 10,
                filteredTotal: 0,
            };
            expect(newState).toEqual(expectedState);
        });

        it("should reset the state but keep total if just the search phrase changed", () => {
            const state: IAttributeElementsState = {
                query: {
                    attributeDisplayFormRef: uriRef("foo"),
                    searchPhrase: "",
                },
                isLoading: false,
                items: [null, null, null, null, { uri: "uri/1", title: "title1" }],
                total: 10,
                filteredTotal: 0,
            };
            const action = attributeElementsUpdate(uriRef("foo"), "search", 0, 5);

            const newState = attributeElementsReducer(state, action);

            const expectedState: IAttributeElementsState = {
                query: {
                    attributeDisplayFormRef: uriRef("foo"),
                    searchPhrase: "search",
                },
                isLoading: true,
                items: [null, null, null, null, null],
                total: 10,
                filteredTotal: undefined,
            };
            expect(newState).toEqual(expectedState);
        });

        it("should reset the state completely when the attribute URI changed", () => {
            const state: IAttributeElementsState = {
                query: {
                    attributeDisplayFormRef: uriRef("foo"),
                    searchPhrase: "",
                },
                isLoading: false,
                items: [null, null, null, null, { uri: "uri/1", title: "title1" }],
                total: 10,
                filteredTotal: 2,
            };
            const action = attributeElementsUpdate(uriRef("bar"), "", 0, 5);

            const newState = attributeElementsReducer(state, action);

            const expectedState: IAttributeElementsState = {
                query: {
                    attributeDisplayFormRef: uriRef("bar"),
                    searchPhrase: "",
                },
                isLoading: true,
                items: [null, null, null, null, null],
                total: undefined,
                filteredTotal: undefined,
            };
            expect(newState).toEqual(expectedState);
        });
    });

    describe("#ATTRIBUTE_ELEMENTS_UPDATED", () => {
        const createAction = (
            dfAttributeRef: ObjRef,
            searchQuery: string,
            start = 0,
            end = 3,
            returnedTotal = 3,
        ): IAttributeElementsUpdatedAction => {
            const items = new Array(end - start).fill(null).map((_el, i) => ({
                title: `title${start + i}`,
                uri: `/uri${start + i}`,
            }));
            return attributeElementsUpdated(dfAttributeRef, searchQuery, start, end, items, returnedTotal);
        };

        const createInitialState = (): IAttributeElementsState => {
            return {
                query: {
                    attributeDisplayFormRef: uriRef("initial/uri"),
                    searchPhrase: "bar",
                },
                items: [null, null, null, null, null, null, null, null, null, null],
                total: 0,
                filteredTotal: 0,
                isLoading: true,
            };
        };

        it("should ignore action if query is not set in state", () => {
            const state = createInitialState();
            const action = createAction(uriRef("new/uri"), "doe");

            const newState = attributeElementsReducer(state, action);

            expect(newState).toEqual(state);
        });

        it("should keep total count if attribute is not changed", () => {
            const state: IAttributeElementsState = {
                query: {
                    attributeDisplayFormRef: uriRef("initial/uri"),
                    searchPhrase: "search phrase",
                },
                isLoading: true,
                items: [null, null, null, null, null],
                total: 100,
                filteredTotal: 0,
            };
            const action = createAction(uriRef("initial/uri"), "bar");

            const newState = attributeElementsReducer(state, action);

            expect(newState.total).toEqual(state.total);
        });

        it("should set loading flag to false, set items and totals", () => {
            const state: IAttributeElementsState = {
                query: {
                    attributeDisplayFormRef: uriRef("initial/uri"),
                    searchPhrase: "search phrase",
                },
                isLoading: true,
                items: [null, null, null, null, null],
                total: 0,
                filteredTotal: 0,
            };
            const action = createAction(uriRef("initial/uri"), "search phrase", 0, 3, 5);

            const newState = attributeElementsReducer(state, action);

            expect(newState).toEqual({
                query: {
                    attributeDisplayFormRef: uriRef("initial/uri"),
                    searchPhrase: "search phrase",
                },
                isLoading: false,
                items: [
                    {
                        title: "title0",
                        uri: "/uri0",
                    },
                    {
                        title: "title1",
                        uri: "/uri1",
                    },
                    {
                        title: "title2",
                        uri: "/uri2",
                    },
                    null,
                    null,
                ],
                total: 5,
                filteredTotal: 5,
            });
        });

        it("should cut rest of the items array if number of returned is less than requested range", () => {
            const state: IAttributeElementsState = {
                query: {
                    attributeDisplayFormRef: uriRef("initial/uri"),
                    searchPhrase: "search phrase",
                },
                isLoading: true,
                items: [
                    {
                        title: "title0",
                        uri: "/uri0",
                    },
                    null,
                    null,
                    null,
                    null,
                ],
                total: 100,
                filteredTotal: 0,
            };
            const action = createAction(uriRef("initial/uri"), "search phrase", 1, 3, 3);

            const newState = attributeElementsReducer(state, action);

            expect(newState).toEqual({
                query: {
                    attributeDisplayFormRef: uriRef("initial/uri"),
                    searchPhrase: "search phrase",
                },
                isLoading: false,
                items: [
                    {
                        title: "title0",
                        uri: "/uri0",
                    },
                    {
                        title: "title1",
                        uri: "/uri1",
                    },
                    {
                        title: "title2",
                        uri: "/uri2",
                    },
                ],
                total: 100,
                filteredTotal: 3,
            });
        });
    });
});
