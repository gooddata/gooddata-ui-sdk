// (C) 2024 GoodData Corporation

import { it, describe, expect } from "vitest";
import { changeFilterContextSelection } from "../filterViews";
import { FilterContextItem, IFilterContext } from "@gooddata/sdk-model";

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
                    });
                },
            );

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
                    ...filterContext,
                    filters: filterViewFilters,
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
                    ...filterContext,
                    filters: filterViewFilters,
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
                    ...filterContext,
                    filters: filterViewFilters,
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
                        ...filterContext,
                        filters: filterViewFilters,
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
                        ...filterContext,
                        filters: filterViewFilters,
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
                        ...filterContext,
                        filters: filterViewFilters,
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
                        ...filterContext,
                        filters: filterViewFilters,
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
                        ...filterContext,
                        filters: filterViewFilters,
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
                        ...filterContext,
                        filters: filterViewFilters,
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
                        ...filterContext,
                        filters: filterViewFilters,
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
                    });
                });
            });
        });
    });
});
