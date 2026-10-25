// (C) 2019-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { type CatalogItem, type ICatalogGroup } from "@gooddata/sdk-model";

import { catalogAttribute, catalogFact, catalogMeasure } from "../../tests/catalog.test.helpers.js";

import { catalogReducer, initialCatalogState } from "./catalog_reducer.js";
import {
    setAttributeHierarchiesChanged,
    setAvailabilityError,
    setCatalogFirstLoaded,
    setCatalogGroups,
    setCatalogItems,
    setCatalogItemsAvailability,
    setItemTooltipDetails,
    setLoadingAvailability,
    setLoadingGroups,
    setLoadingItems,
    toggleUnavailableItemsVisibility,
} from "./catalog_store_actions.js";
import { type ICatalogState } from "./catalog_types.js";

describe("Catalog Reducer", () => {
    it("should set initial catalog state", () => {
        const initialState = catalogReducer(undefined, {} as Parameters<typeof catalogReducer>[1]);

        const expectedInitialState: ICatalogState = {
            items: [],
            availableItemsUris: null,
            groups: [],
            updatedItemsCount: null,
            flags: {
                loadingItems: false,
                loadingGroups: false,
                loadingAvailability: false,
                availabilityError: null,
                firstLoaded: false,
                attributeHierarchiesChanged: false,
            },
            tooltipDetails: {},
            isWorkspaceEmpty: false,
            showUnavailableItems: false,
            dateHierarchies: [],
            attributeHierarchies: [],
            parameters: [],
        };

        expect(initialState).toEqual(expectedInitialState);
    });

    it("should change catalog items on STORE_SET_CATALOG_ITEMS action", () => {
        const items: ReadonlyArray<CatalogItem> = [catalogMeasure, catalogFact, catalogAttribute];
        const setAction = setCatalogItems(items);
        const resultState = catalogReducer(undefined, setAction);

        const expectedCatalogState: ICatalogState = {
            ...initialCatalogState,
            items,
        };
        expect(resultState).toEqual(expectedCatalogState);
    });

    it("should change catalog groups on STORE_SET_CATALOG_GROUPS action", () => {
        const groups: ReadonlyArray<ICatalogGroup> = [
            {
                tag: {
                    identifier: "g1",
                },
                title: "group 1",
            },
            {
                tag: {
                    identifier: "g2",
                },
                title: "group 2",
            },
        ];
        const setAction = setCatalogGroups(groups);
        const resultState = catalogReducer(undefined, setAction);

        const expectedCatalogState: ICatalogState = {
            ...initialCatalogState,
            groups,
        };
        expect(resultState).toEqual(expectedCatalogState);
    });

    it("should change catalog items availability on STORE_SET_CATALOG_ITEMS_AVAILABILITY action", () => {
        const availableItemsUris: ReadonlyArray<string> = ["item1/uri", "item2/uri"];

        const setAction = setCatalogItemsAvailability(availableItemsUris);
        const resultState = catalogReducer(undefined, setAction);

        const expectedCatalogState: ICatalogState = {
            ...initialCatalogState,
            availableItemsUris,
        };
        expect(resultState).toEqual(expectedCatalogState);
    });

    describe("STORE_SET_LOADING_ITEMS action", () => {
        it("should set true for loadingItems flag", () => {
            const setAction = setLoadingItems(true);
            const resultState = catalogReducer(initialCatalogState, setAction);

            const expectedState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    loadingItems: true,
                },
            };

            expect(resultState).toEqual(expectedState);
        });

        it("should set false for loadingItems flag", () => {
            const initialState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    loadingItems: true,
                },
            };

            const setAction = setLoadingItems(false);
            const resultState = catalogReducer(initialState, setAction);

            expect(resultState).toEqual(initialCatalogState);
        });
    });

    describe("STORE_SET_ATTRIBUTE_HIERARCHIES_CHANGED", () => {
        it("should set true for attributeHierarchiesChanged flag", () => {
            const setAction = setAttributeHierarchiesChanged(true);
            const resultState = catalogReducer(initialCatalogState, setAction);

            const expectedState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    attributeHierarchiesChanged: true,
                },
            };

            expect(resultState).toEqual(expectedState);
        });

        it("should set false for attributeHierarchiesChanged flag", () => {
            const initialState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    attributeHierarchiesChanged: true,
                },
            };

            const setAction = setAttributeHierarchiesChanged(false);
            const resultState = catalogReducer(initialState, setAction);

            expect(resultState).toEqual(initialCatalogState);
        });
    });

    describe("STORE_SET_LOADING_GROUPS action", () => {
        it("should set true for loadingGroups flag", () => {
            const setAction = setLoadingGroups(true);
            const resultState = catalogReducer(initialCatalogState, setAction);

            const expectedState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    loadingGroups: true,
                },
            };

            expect(resultState).toEqual(expectedState);
        });

        it("should set false for loadingGroups flag", () => {
            const initialState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    loadingGroups: true,
                },
            };

            const setAction = setLoadingGroups(false);
            const resultState = catalogReducer(initialState, setAction);

            expect(resultState).toEqual(initialCatalogState);
        });
    });

    describe("STORE_SET_LOADING_AVAILABILITY action", () => {
        it("should set true for loadingAvailability flag", () => {
            const setAction = setLoadingAvailability(true);
            const resultState = catalogReducer(initialCatalogState, setAction);

            const expectedState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    loadingAvailability: true,
                },
            };

            expect(resultState).toEqual(expectedState);
        });

        it("should set false for loadingAvailability flag", () => {
            const initialState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    loadingAvailability: true,
                },
            };

            const setAction = setLoadingAvailability(false);
            const resultState = catalogReducer(initialState, setAction);

            expect(resultState).toEqual(initialCatalogState);
        });
    });

    describe("STORE_SET_AVAILABILITY_ERROR action", () => {
        it("should set availability error", () => {
            const error = { message: "Error" };
            const setAction = setAvailabilityError(error);
            const resultState = catalogReducer(initialCatalogState, setAction);

            const expectedState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    availabilityError: { message: "Error" },
                },
            };

            expect(resultState).toEqual(expectedState);
        });

        it("should clear availability error", () => {
            const setAction = setAvailabilityError(null);
            const resultState = catalogReducer(initialCatalogState, setAction);

            const expectedState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    availabilityError: null,
                },
            };

            expect(resultState).toEqual(expectedState);
        });
    });

    describe("STORE_SET_CATALOG_ITEMS_FIRST_LOADED action", () => {
        it("should set true for firstLoaded flag", () => {
            const setAction = setCatalogFirstLoaded(true);
            const resultState = catalogReducer(initialCatalogState, setAction);

            const expectedState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    firstLoaded: true,
                },
            };

            expect(resultState).toEqual(expectedState);
        });

        it("should set false for firstLoaded flag", () => {
            const initialState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    firstLoaded: true,
                },
            };

            const setAction = setCatalogFirstLoaded(false);
            const resultState = catalogReducer(initialState, setAction);

            expect(resultState).toEqual(initialCatalogState);
        });
    });

    describe("STORE_SET_TOOLTIP_DETAILS action", () => {
        it("should save tooltipDetails into the state", () => {
            const initialState: ICatalogState = {
                ...initialCatalogState,
                tooltipDetails: {
                    existingItemIdentifier: {},
                },
            };

            const expectedState: ICatalogState = {
                ...initialState,
                tooltipDetails: {
                    existingItemIdentifier: {},
                    newItemId: {
                        metricMaql: [],
                    },
                },
            };

            const setAction = setItemTooltipDetails("newItemId", { metricMaql: [] });
            const resultState = catalogReducer(initialState, setAction);

            expect(resultState).toEqual(expectedState);
        });

        it("should merge tooltipDetails parts dispatched separately for the same item", () => {
            const initialState: ICatalogState = {
                ...initialCatalogState,
                tooltipDetails: {
                    attributeItemId: {
                        dataset: { title: "My dataset" },
                    },
                },
            };

            const expectedState: ICatalogState = {
                ...initialState,
                tooltipDetails: {
                    attributeItemId: {
                        dataset: { title: "My dataset" },
                        attrElements: [{ title: "element" }],
                        attrElementsTotalCount: 1,
                    },
                },
            };

            const setAction = setItemTooltipDetails("attributeItemId", {
                attrElements: [{ title: "element" }],
                attrElementsTotalCount: 1,
            });
            const resultState = catalogReducer(initialState, setAction);

            expect(resultState).toEqual(expectedState);
        });
    });

    describe("STORE_TOGGLE_UNAVAILABLE_ITEMS_VISIBILITY action", () => {
        it("should save showUnavailableItems into the state", () => {
            const initialState: ICatalogState = {
                ...initialCatalogState,
                showUnavailableItems: false,
            };

            const expectedState: ICatalogState = {
                ...initialState,
                showUnavailableItems: true,
            };

            const setAction = toggleUnavailableItemsVisibility(true);
            const resultState = catalogReducer(initialState, setAction);

            expect(resultState).toEqual(expectedState);
        });
    });
});
