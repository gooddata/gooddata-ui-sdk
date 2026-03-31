// (C) 2024-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type FilterContextItem, type IFilterContext, idRef } from "@gooddata/sdk-model";

import { changeFilterContextSelection } from "../filterViews.js";

const buildFilterContext = (filters: FilterContextItem[]): IFilterContext => ({
    ref: { identifier: "1c07035a-d48c-48f9-97ac-ca6a146a1b17", type: "filterContext" },
    identifier: "1c07035a-d48c-48f9-97ac-ca6a146a1b17",
    uri: "https://internal-testing.staging.stg11.panther.intgdc.com/api/v1/entities/workspaces/130ee9a3d69b4508aed431773a660706/filterContexts/1c07035a-d48c-48f9-97ac-ca6a146a1b17",
    title: "filterContext",
    description: "",
    filters,
});

describe("filterViews", () => {
    describe("changeFilterContextSelection", () => {
        describe("attribute filter", () => {
            it("should reset filter if it is not matched by local identifier", () => {
                const filterContext = buildFilterContext([
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["Content"] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: false,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "single",
                        },
                    },
                ]);

                const filterViewFilters: FilterContextItem[] = [
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["Content"] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: false,
                            localIdentifier: "xxx",
                            selectionMode: "single",
                        },
                    },
                ];

                const updatedFilterContext = changeFilterContextSelection(filterContext, filterViewFilters);
                expect(updatedFilterContext).toEqual({
                    filterContext: {
                        ...filterContext,
                        filters: [
                            {
                                attributeFilter: {
                                    attributeElements: { uris: [] },
                                    displayForm: {
                                        identifier: "campaign_channels.category",
                                        type: "displayForm",
                                    },
                                    negativeSelection: true,
                                    localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                                    selectionMode: "single",
                                },
                            },
                        ],
                    },
                    configUpdates: new Map(),
                });
            });

            it.each([
                [
                    "displayForm",
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["A"] },
                            displayForm: { identifier: "xxx", type: "displayForm" as const },
                            negativeSelection: false,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "single" as const,
                        },
                    },
                ],
                [
                    "selectionMode",
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["A"] },
                            displayForm: {
                                identifier: "campaign_channels.category",
                                type: "displayForm" as const,
                            },
                            negativeSelection: false,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "multi" as const,
                        },
                    },
                ],
            ])(
                "should reset filter if it is matched by local identifier but configuration differs (%s)",
                (_prop: string, filterViewFilter: FilterContextItem) => {
                    const filterContext = buildFilterContext([
                        {
                            attributeFilter: {
                                attributeElements: { uris: ["Content"] },
                                displayForm: {
                                    identifier: "campaign_channels.category",
                                    type: "displayForm",
                                },
                                negativeSelection: false,
                                localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                                selectionMode: "single",
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [filterViewFilter];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: [
                                {
                                    attributeFilter: {
                                        attributeElements: { uris: [] },
                                        displayForm: {
                                            identifier: "campaign_channels.category",
                                            type: "displayForm",
                                        },
                                        negativeSelection: true,
                                        localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                                        selectionMode: "single",
                                    },
                                },
                            ],
                        },
                        configUpdates: new Map(),
                    });
                },
            );

            it("should reset attribute filter when title differs between dashboard and view", () => {
                const filterContext = buildFilterContext([
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["Content"] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: false,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "single",
                            title: "Current Title",
                        },
                    },
                ]);

                const filterViewFilters: FilterContextItem[] = [
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["A", "B"] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: false,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "single",
                            title: "Old Title From View",
                        },
                    },
                ];

                const updatedFilterContext = changeFilterContextSelection(filterContext, filterViewFilters);
                expect(updatedFilterContext.filterContext.filters).toEqual([
                    {
                        attributeFilter: {
                            attributeElements: { uris: [] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: true,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "single",
                            title: "Current Title",
                        },
                    },
                ]);
            });

            it("should update filter if everything apart from selected elements is the same", () => {
                const filterContext = buildFilterContext([
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["Content"] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: false,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "single",
                        },
                    },
                ]);

                const filterViewFilters: FilterContextItem[] = [
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["A", "B"] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: false,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "single",
                        },
                    },
                ];

                const updatedFilterContext = changeFilterContextSelection(filterContext, filterViewFilters);
                expect(updatedFilterContext).toEqual({
                    filterContext: {
                        ...filterContext,
                        filters: filterViewFilters,
                    },
                    configUpdates: new Map(),
                });
            });

            it("should update filter if everything apart from negative flag is the same", () => {
                const filterContext = buildFilterContext([
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["Content"] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: true,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "multi",
                        },
                    },
                ]);

                const filterViewFilters: FilterContextItem[] = [
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["A", "B"] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: false,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "multi",
                        },
                    },
                ];

                const updatedFilterContext = changeFilterContextSelection(filterContext, filterViewFilters);
                expect(updatedFilterContext).toEqual({
                    filterContext: {
                        ...filterContext,
                        filters: filterViewFilters,
                    },
                    configUpdates: new Map(),
                });
            });

            it("should update filter to All if everything apart from negative flag is the same", () => {
                const filterContext = buildFilterContext([
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["Content"] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: false,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "multi",
                        },
                    },
                ]);

                const filterViewFilters: FilterContextItem[] = [
                    {
                        attributeFilter: {
                            attributeElements: { uris: [] },
                            displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                            negativeSelection: true,
                            localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                            selectionMode: "multi",
                        },
                    },
                ];

                const updatedFilterContext = changeFilterContextSelection(filterContext, filterViewFilters);
                expect(updatedFilterContext).toEqual({
                    filterContext: {
                        ...filterContext,
                        filters: filterViewFilters,
                    },
                    configUpdates: new Map(),
                });
            });
        });

        describe("date filter", () => {
            describe("common date filter", () => {
                it("should leave filter on All if view have it set as All", () => {
                    const filterContext = buildFilterContext([]);

                    const filterViewFilters: FilterContextItem[] = [];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: filterViewFilters,
                        },
                        configUpdates: new Map(),
                    });
                });

                it("should update filter from All to value in view", () => {
                    const filterContext = buildFilterContext([]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            dateFilter: {
                                granularity: "GDC.time.year",
                                type: "relative",
                                from: -1,
                                to: -1,
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: filterViewFilters,
                        },
                        configUpdates: new Map(),
                    });
                });

                it("should update filter from its value to All from view", () => {
                    const filterContext = buildFilterContext([
                        {
                            dateFilter: {
                                granularity: "GDC.time.year",
                                type: "relative",
                                from: -1,
                                to: -1,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: filterViewFilters,
                        },
                        configUpdates: new Map(),
                    });
                });

                it("should update filter from its value to filter view", () => {
                    const filterContext = buildFilterContext([
                        {
                            dateFilter: {
                                granularity: "GDC.time.year",
                                type: "relative",
                                from: -1,
                                to: -1,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            dateFilter: {
                                granularity: "GDC.time.date",
                                type: "absolute",
                                from: "2024-08-12",
                                to: "2024-09-13",
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: filterViewFilters,
                        },
                        configUpdates: new Map(),
                    });
                });
            });

            describe("date filter with data set", () => {
                it("should update the filter if it matches by data set", () => {
                    const filterContext = buildFilterContext([
                        {
                            dateFilter: {
                                dataSet: { identifier: "date", type: "dataSet" },
                                granularity: "GDC.time.year",
                                type: "relative",
                                from: -1,
                                to: -1,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            dateFilter: {
                                dataSet: { identifier: "date", type: "dataSet" },
                                granularity: "GDC.time.date",
                                type: "absolute",
                                from: "2024-08-12",
                                to: "2024-09-13",
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: filterViewFilters,
                        },
                        configUpdates: new Map(),
                    });
                });

                it("should update the filter to All if it matches by data set", () => {
                    const filterContext = buildFilterContext([
                        {
                            dateFilter: {
                                dataSet: { identifier: "date", type: "dataSet" },
                                granularity: "GDC.time.year",
                                type: "relative",
                                from: -1,
                                to: -1,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            dateFilter: {
                                dataSet: { identifier: "date", type: "dataSet" },
                                granularity: "GDC.time.date",
                                type: "relative",
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: filterViewFilters,
                        },
                        configUpdates: new Map(),
                    });
                });

                it("should update the filter from All if it matches by data set", () => {
                    const filterContext = buildFilterContext([
                        {
                            dateFilter: {
                                dataSet: { identifier: "date", type: "dataSet" },
                                granularity: "GDC.time.date",
                                type: "relative",
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            dateFilter: {
                                dataSet: { identifier: "date", type: "dataSet" },
                                granularity: "GDC.time.year",
                                type: "relative",
                                from: -1,
                                to: -1,
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: filterViewFilters,
                        },
                        configUpdates: new Map(),
                    });
                });

                it("should reset filter as is if it does not match by data set", () => {
                    const filterContext = buildFilterContext([
                        {
                            dateFilter: {
                                dataSet: { identifier: "date", type: "dataSet" },
                                granularity: "GDC.time.year",
                                type: "relative",
                                from: -1,
                                to: -1,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            dateFilter: {
                                dataSet: { identifier: "does-not-match", type: "dataSet" },
                                granularity: "GDC.time.date",
                                type: "absolute",
                                from: "2024-08-12",
                                to: "2024-09-13",
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: [
                                {
                                    dateFilter: {
                                        dataSet: { identifier: "date", type: "dataSet" },
                                        granularity: "GDC.time.date",
                                        type: "relative",
                                    },
                                },
                            ],
                        },
                        configUpdates: new Map(),
                    });
                });
            });
        });

        describe("text attribute filter (arbitrary, match)", () => {
            const displayFormRef = { identifier: "campaign_channels.category", type: "displayForm" as const };
            const localId = "text-filter-1";

            describe("arbitrary filter", () => {
                it("should restore arbitrary filter selection from view when matched by localIdentifier", () => {
                    const filterContext = buildFilterContext([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["old"],
                                negativeSelection: false,
                                localIdentifier: localId,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A", "B"],
                                negativeSelection: true,
                                localIdentifier: localId,
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: filterViewFilters,
                        },
                        configUpdates: new Map(),
                    });
                });

                it("should preserve dashboard title when applying arbitrary filter from view", () => {
                    const filterContext = buildFilterContext([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["old"],
                                negativeSelection: false,
                                localIdentifier: localId,
                                title: "My Filter",
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A", "B"],
                                negativeSelection: true,
                                localIdentifier: localId,
                                title: "My Filter",
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A", "B"],
                                negativeSelection: true,
                                localIdentifier: localId,
                                title: "My Filter",
                            },
                        },
                    ]);
                });

                it("should preserve dashboard filterElementsBy, filterElementsByDate, validateElementsBy when applying arbitrary filter from view", () => {
                    const filterElementsBy = [
                        {
                            filterLocalIdentifier: "parent-filter",
                            over: { attributes: [{ identifier: "parent", type: "displayForm" as const }] },
                        },
                    ];
                    const filterElementsByDate = [
                        {
                            filterLocalIdentifier: "date-filter",
                            isCommonDate: false,
                        },
                    ];
                    const validateElementsBy = [idRef("validate", "displayForm")];

                    const filterContext = buildFilterContext([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["old"],
                                negativeSelection: false,
                                localIdentifier: localId,
                                title: "My Filter",
                                filterElementsBy,
                                filterElementsByDate,
                                validateElementsBy,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A", "B"],
                                negativeSelection: true,
                                localIdentifier: localId,
                                title: "My Filter",
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A", "B"],
                                negativeSelection: true,
                                localIdentifier: localId,
                                title: "My Filter",
                                filterElementsBy,
                                filterElementsByDate,
                                validateElementsBy,
                            },
                        },
                    ]);
                });

                it("should reset arbitrary filter when title differs", () => {
                    const filterContext = buildFilterContext([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["old"],
                                negativeSelection: false,
                                localIdentifier: localId,
                                title: "Current Title",
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A", "B"],
                                negativeSelection: true,
                                localIdentifier: localId,
                                title: "Old Saved Title",
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: [],
                                negativeSelection: true,
                                localIdentifier: localId,
                                title: "Current Title",
                                filterElementsBy: undefined,
                                filterElementsByDate: undefined,
                                validateElementsBy: undefined,
                            },
                        },
                    ]);
                });

                it("should reset arbitrary filter when not found in view", () => {
                    const filterContext = buildFilterContext([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["selected"],
                                negativeSelection: false,
                                localIdentifier: localId,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: [],
                                negativeSelection: true,
                                localIdentifier: localId,
                            },
                        },
                    ]);
                });

                it("should reset arbitrary filter when matched by localIdentifier but displayForm differs", () => {
                    const filterContext = buildFilterContext([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["selected"],
                                negativeSelection: false,
                                localIdentifier: localId,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            arbitraryAttributeFilter: {
                                displayForm: { identifier: "other.displayForm", type: "displayForm" },
                                values: ["A", "B"],
                                negativeSelection: false,
                                localIdentifier: localId,
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: [],
                                negativeSelection: true,
                                localIdentifier: localId,
                            },
                        },
                    ]);
                });
            });

            describe("match filter", () => {
                it("should restore match filter selection from view when matched by localIdentifier", () => {
                    const filterContext = buildFilterContext([
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "contains",
                                literal: "old",
                                caseSensitive: false,
                                localIdentifier: localId,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "contains",
                                literal: "new-value",
                                caseSensitive: true,
                                negativeSelection: true,
                                localIdentifier: localId,
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext).toEqual({
                        filterContext: {
                            ...filterContext,
                            filters: filterViewFilters,
                        },
                        configUpdates: new Map(),
                    });
                });

                it("should reset match filter when not found in view", () => {
                    const filterContext = buildFilterContext([
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "startsWith",
                                literal: "prefix",
                                localIdentifier: localId,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: [],
                                negativeSelection: true,
                                localIdentifier: localId,
                            },
                        },
                    ]);
                });

                it("should allow to change operator of match filter", () => {
                    const filterContext = buildFilterContext([
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "contains",
                                literal: "value",
                                localIdentifier: localId,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "endsWith",
                                literal: "different",
                                localIdentifier: localId,
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "endsWith",
                                literal: "different",
                                localIdentifier: localId,
                            },
                        },
                    ]);
                });
            });

            describe("cross-type (arbitrary vs match)", () => {
                it("should apply arbitrary filter from view when dashboard has match filter with same localId", () => {
                    const filterContext = buildFilterContext([
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "contains",
                                literal: "value",
                                localIdentifier: localId,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A", "B"],
                                negativeSelection: false,
                                localIdentifier: localId,
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A", "B"],
                                negativeSelection: false,
                                localIdentifier: localId,
                            },
                        },
                    ]);
                });

                it("should apply match filter from view when dashboard has arbitrary filter with same localId", () => {
                    const filterContext = buildFilterContext([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A", "B"],
                                negativeSelection: false,
                                localIdentifier: localId,
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "contains",
                                literal: "value",
                                localIdentifier: localId,
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "contains",
                                literal: "value",
                                localIdentifier: localId,
                            },
                        },
                    ]);
                });

                it("should preserve dashboard title on cross-type change", () => {
                    const filterContext = buildFilterContext([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A"],
                                negativeSelection: false,
                                localIdentifier: localId,
                                title: "My Filter",
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "contains",
                                literal: "value",
                                localIdentifier: localId,
                                title: "My Filter",
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "contains",
                                literal: "value",
                                localIdentifier: localId,
                                title: "My Filter",
                            },
                        },
                    ]);
                });

                it("should reset on cross-type change when title differs", () => {
                    const filterContext = buildFilterContext([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: ["A"],
                                negativeSelection: false,
                                localIdentifier: localId,
                                title: "Dashboard Title",
                            },
                        },
                    ]);

                    const filterViewFilters: FilterContextItem[] = [
                        {
                            matchAttributeFilter: {
                                displayForm: displayFormRef,
                                operator: "contains",
                                literal: "value",
                                localIdentifier: localId,
                                title: "View Title",
                            },
                        },
                    ];

                    const updatedFilterContext = changeFilterContextSelection(
                        filterContext,
                        filterViewFilters,
                    );
                    expect(updatedFilterContext.filterContext.filters).toEqual([
                        {
                            arbitraryAttributeFilter: {
                                displayForm: displayFormRef,
                                values: [],
                                negativeSelection: true,
                                localIdentifier: localId,
                                title: "Dashboard Title",
                                filterElementsBy: undefined,
                                filterElementsByDate: undefined,
                                validateElementsBy: undefined,
                            },
                        },
                    ]);
                });
            });
        });
    });
});
