// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type CatalogItem } from "@gooddata/sdk-model";

import { initialState } from "../../reducers/initial_state.js";
import { catalogAttribute, catalogFact, catalogMeasure } from "../../tests/catalog.test.helpers.js";
import { buildAttributeHierarchyMock } from "../../tests/catalog_attribute_hierarchy.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withAppState, withData, withRoot } from "../../tests/state_builder.test.helpers.js";
import { type IDateDataset } from "../../typings/datasets.js";

import { initialCatalogState } from "./catalog_reducer.js";
import {
    getAttributeHierarchies,
    getAttributeHierarchiesWithCatalogItem,
    getAvailableAttributes,
    getAvailableCatalogItemsUris,
    getAvailableItems,
    getCatalogItems,
    getHLLFilteredCatalogItems,
    getSortedCatalogGroups,
    hasAvailabilityError,
    hasCatalogFirstLoaded,
    isDateItemAvailable,
    isLoadingAvailability,
    isLoadingGroups,
    isLoadingItems,
    isWorkspaceEmpty,
    shouldUnavailableItemsBeVisible,
    showUnavailableItems,
} from "./catalog_selector.js";
import { type ICatalogState } from "./catalog_types.js";

describe("CatalogSelector", () => {
    describe("getAvailableCatalogItemsUris", () => {
        it("should return available catalog items uris", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                availableItemsUris: ["item1/uri", "item2/uri"],
            };
            const state = withData(initialState, { catalog: catalogState });

            const availableCatalogItemsUris = getAvailableCatalogItemsUris(state);

            expect(availableCatalogItemsUris).toEqual(catalogState.availableItemsUris);
        });
    });

    describe("getCatalogItems", () => {
        it("should return all items", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                items: [catalogMeasure, catalogFact],
            };

            const state = withData(initialState, { catalog: catalogState });
            const allItems = getCatalogItems(state);
            expect(allItems).toEqual(catalogState.items);
        });
    });

    describe("getHLLFilteredCatalogItems", () => {
        it("should hide attributes without sourceColumn when enableHLL is true", () => {
            const attributeWithSourceColumn = {
                ...catalogAttribute,
                attribute: {
                    ...catalogAttribute.attribute,
                    sourceColumn: "source-column-id",
                },
            };
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                items: [catalogMeasure, catalogAttribute, attributeWithSourceColumn],
            };

            const state = withRoot(withData(initialState, { catalog: catalogState }), {
                featureFlags: {
                    enableHLL: true,
                },
            });

            const filteredItems = getHLLFilteredCatalogItems(state);
            expect(filteredItems).toEqual([catalogMeasure, attributeWithSourceColumn]);
        });

        it("should keep all items when enableHLL is false", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                items: [catalogMeasure, catalogAttribute],
            };
            const state = withRoot(withData(initialState, { catalog: catalogState }), {
                featureFlags: {
                    enableHLL: false,
                },
            });

            const filteredItems = getHLLFilteredCatalogItems(state);
            expect(filteredItems).toEqual(catalogState.items);
        });
    });

    describe("getSortedCatalogGroups performs locale-specific sorting", () => {
        const deterministicShuffle = <T>(list: T[]) => {
            return list.reduce((acc, element, index) => {
                if (index % 2 === 0) {
                    acc.push(element);
                } else {
                    acc.unshift(element);
                }
                return acc;
            }, []);
        };

        it.each([
            [
                "english with numbers",
                "en-US",
                ["_a", "_b", "0", "10", "aaaaa", "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"],
            ],
            [
                "german",
                "de-DE",
                ["_", "1", "a", "Mull", "Müll", "strassa", "straßa", "strasse", "straße", "z"],
            ],
            [
                "special characters",
                "en-US",
                ["_un", "# bbbb", "% aaaa", "^ ki", "0 nh", "1 nh", "10 nh", "6 nh"],
            ],
        ])(
            "should return sorted catalog groups items for %s(%s)",
            (_language, locale: string, groupNames: string[]) => {
                const groups = groupNames.map((groupTitle) => ({
                    title: groupTitle,
                    identifier: groupTitle,
                }));
                const catalogState: ICatalogState = {
                    ...initialCatalogState,
                    groups: deterministicShuffle(groups),
                };

                const state = withAppState(withData(initialState, { catalog: catalogState }), {
                    intl: {
                        ...withData(initialState, { catalog: catalogState }).appState.intl,
                        locale: locale,
                    },
                });
                const resultGroups = getSortedCatalogGroups(state);
                expect(resultGroups.map((group) => group.title)).toEqual(groupNames);
            },
        );
    });

    describe("getAvailableItems", () => {
        const catalogItems: ReadonlyArray<CatalogItem> = [catalogMeasure, catalogFact, catalogAttribute];

        it("should return all the catalog items when there are no bucket items", () => {
            const availableCatalogItemsUris: string[] | null = null;

            const availableCatalogItems = getAvailableItems.resultFunc(
                availableCatalogItemsUris,
                catalogItems,
            );
            expect(availableCatalogItems).toEqual(catalogItems);
        });

        it("should return available catalog items when there are some bucket items", () => {
            const availableCatalogItemsUris: string[] = [
                catalogMeasure.measure.uri,
                catalogAttribute.attribute.uri,
            ];

            const availableCatalogItems = getAvailableItems.resultFunc(
                availableCatalogItemsUris,
                catalogItems,
            );
            expect(availableCatalogItems).toEqual([catalogItems[0], catalogItems[2]]);
        });

        it("should return all catalog items when availability is null", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                availableItemsUris: null,
                items: [catalogMeasure, catalogFact, catalogAttribute],
            };

            const state = withData(initialState, { catalog: catalogState });
            const availableCatalogItems = getAvailableItems(state);
            expect(availableCatalogItems).toEqual(catalogState.items);
        });
    });

    describe("getAvailableAttributes", () => {
        const catalogItems: ReadonlyArray<CatalogItem> = [catalogMeasure, catalogFact, catalogAttribute];
        it("should return only available attributes", () => {
            const availableCatalogItems = getAvailableAttributes.resultFunc(catalogItems);

            expect(availableCatalogItems).toEqual([catalogItems[2]]);
        });
    });

    describe("isLoadingItems", () => {
        function getStateWithLoading(loadingItems: boolean, dateDatasetLoaded = true) {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    loadingItems,
                },
            };
            return withData(withData(getInitializedState(), { catalog: catalogState }), {
                dateDatasets: { ...getInitializedState().data.dateDatasets, loaded: dateDatasetLoaded },
            });
        }

        it("should return true when loadingItems flag is active", () => {
            const state = getStateWithLoading(true);
            const result = isLoadingItems(state);
            expect(result).toEqual(true);
        });

        it("should return false when loadingItems flag is disabled", () => {
            const state = getStateWithLoading(false);
            const result = isLoadingItems(state);
            expect(result).toEqual(false);
        });

        it("should return true when loading items is done but date datasets are not loaded", () => {
            const state = getStateWithLoading(false, false);
            const result = isLoadingItems(state);
            expect(result).toEqual(true);
        });

        it("should return false if loading items and datasets is done", () => {
            const state = getStateWithLoading(false, true);
            const result = isLoadingItems(state);
            expect(result).toEqual(false);
        });
    });

    describe("isLoadingGroups", () => {
        it("should return true when loadingGroups flag is active", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    loadingGroups: true,
                },
            };

            const state = withData(initialState, { catalog: catalogState });
            const result = isLoadingGroups(state);
            expect(result).toEqual(true);
        });

        it("should return false when loadingGroups flag is disabled", () => {
            const state = withData(initialState, { catalog: initialCatalogState });
            const result = isLoadingGroups(state);
            expect(result).toEqual(false);
        });
    });

    describe("isLoadingAvailability", () => {
        it("should return true when loadingAvailability flag is active", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    loadingAvailability: true,
                },
            };

            const state = withData(initialState, { catalog: catalogState });
            const result = isLoadingAvailability(state);
            expect(result).toEqual(true);
        });

        it("should return false when loadingAvailability flag is disabled", () => {
            const state = withData(initialState, { catalog: initialCatalogState });
            const result = isLoadingAvailability(state);
            expect(result).toEqual(false);
        });
    });

    describe("hasAvailabilityError", () => {
        it("should return true when availabilityError is not null", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    availabilityError: { message: "error" },
                },
            };

            const state = withData(initialState, { catalog: catalogState });
            const result = hasAvailabilityError(state);
            expect(result).toEqual(true);
        });

        it("should return false when availabilityError is null", () => {
            const state = withData(initialState, { catalog: initialCatalogState });
            const result = hasAvailabilityError(state);
            expect(result).toEqual(false);
        });
    });

    describe("hasCatalogFirstLoaded", () => {
        it("should return true when firstLoaded flag is active", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                flags: {
                    ...initialCatalogState.flags,
                    firstLoaded: true,
                },
            };

            const state = withData(initialState, { catalog: catalogState });
            const result = hasCatalogFirstLoaded(state);
            expect(result).toEqual(true);
        });

        it("should return false when firstLoaded flag is disabled", () => {
            const state = withData(initialState, { catalog: initialCatalogState });
            const result = hasCatalogFirstLoaded(state);
            expect(result).toEqual(false);
        });
    });

    describe("isDateItemAvailable", () => {
        const availableDateDatasets = [
            {
                attributes: [
                    { dfUri: "dfUri1", uri: "attrUri1" },
                    { dfUri: "dfUri2", uri: "attrUri2" },
                ],
            },
        ] as unknown as IDateDataset[];

        it("should return true when in dateDatasets is at least one available dataset", () => {
            expect(isDateItemAvailable.resultFunc(availableDateDatasets, false)).toEqual(true);
        });

        it("should return false when in dateDatasets updating", () => {
            expect(isDateItemAvailable.resultFunc(availableDateDatasets, true)).toEqual(false);
        });

        it("should return false when in dateDatasets are no available datasets", () => {
            expect(isDateItemAvailable.resultFunc([], false)).toEqual(false);
        });
    });

    describe("isWorkspaceEmpty", () => {
        it("should return true if there are no data items and no date item in the project", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                isWorkspaceEmpty: true,
            };
            const result = isWorkspaceEmpty.resultFunc(catalogState, false);
            expect(result).toEqual(true);
        });

        it("should return false if there are some data items in the project", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                isWorkspaceEmpty: false,
            };
            const result = isWorkspaceEmpty.resultFunc(catalogState, false);
            expect(result).toEqual(false);
        });

        it("should return false if there is a date item in the project", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                isWorkspaceEmpty: true,
            };
            const result = isWorkspaceEmpty.resultFunc(catalogState, true);
            expect(result).toEqual(false);
        });
    });

    describe("showUnavailableItems", () => {
        it("should return true if showUnavailableItems is true", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                showUnavailableItems: true,
            };
            const state = withData(initialState, { catalog: catalogState });
            const result = showUnavailableItems(state);
            expect(result).toEqual(true);
        });

        it("should return true if showUnavailableItems is false", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                showUnavailableItems: false,
            };
            const state = withData(initialState, { catalog: catalogState });
            const result = showUnavailableItems(state);
            expect(result).toEqual(false);
        });
    });

    describe("shouldUnavailableItemsBeVisible", () => {
        it("should return true if showUnavailableItems isfalse", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                showUnavailableItems: false,
            };
            const state = withData(initialState, { catalog: catalogState });
            const result = shouldUnavailableItemsBeVisible(state);
            expect(result).toEqual(false);
        });

        it("should return true if showUnavailableItems is true", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                showUnavailableItems: true,
            };
            const state = withData(initialState, { catalog: catalogState });
            const result = shouldUnavailableItemsBeVisible(state);
            expect(result).toEqual(false);
        });
    });

    describe("getAttributeHierarchies", () => {
        it("should return attribute hierarchy item", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                attributeHierarchies: [buildAttributeHierarchyMock()],
            };

            const state = withData(initialState, { catalog: catalogState });
            const item = getAttributeHierarchies(state);

            expect(item).toEqual([catalogState.attributeHierarchies[0]]);
        });

        it("should return attribute hierarchy include a specify attribute item", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                attributeHierarchies: [buildAttributeHierarchyMock()],
            };

            const state = withData(initialState, { catalog: catalogState });
            const item = getAttributeHierarchiesWithCatalogItem("state_name")(state);
            expect(item).toEqual([catalogState.attributeHierarchies[0]]);
        });

        it("should not return attribute hierarchy if doesn't include a specify attribute item", () => {
            const catalogState: ICatalogState = {
                ...initialCatalogState,
                items: [catalogMeasure, catalogFact, buildAttributeHierarchyMock()],
            };

            const state = withData(initialState, { catalog: catalogState });
            const item = getAttributeHierarchiesWithCatalogItem("city_name")(state);
            expect(item).toEqual([]);
        });
    });
});
