// (C) 2020-2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { idRef, FilterContextItem, IFilterContext, IWidgetDefinition } from "@gooddata/sdk-model";
import { describe, it, expect } from "vitest";

import {
    filterContextToDashboardFiltersByDateDataSet,
    filterContextToDashboardFiltersByWidget,
} from "../filterConverters.js";

describe("filterConverters tests", () => {
    type Scenario = [string, IFilterContext | undefined];

    const getFilterContext = (filters: FilterContextItem[]): IFilterContext => ({
        description: "",
        filters,
        identifier: "foo",
        ref: idRef("foo"),
        title: "",
        uri: "/gdc/md/foo",
    });

    describe("filterContextToFiltersForWidget", () => {
        const widget: IWidgetDefinition = {
            description: "",
            drills: [],
            ignoreDashboardFilters: [],
            title: "Widget",
            type: "insight",
            dateDataSet: ReferenceMd.DateDatasets.Activity.ref,
            insight: idRef(ReferenceMd.Insights.Test),
        };

        const scenarios: Scenario[] = [
            ["undefined filterContext", undefined],
            [
                "filterContext with positive attribute filter with values",
                getFilterContext([
                    {
                        attributeFilter: {
                            attributeElements: { values: ["foo", "bar"] },
                            displayForm: ReferenceMd.Account.Name.attribute.displayForm,
                            negativeSelection: false,
                        },
                    },
                ]),
            ],
            [
                "filterContext with negative attribute filter with uris",
                getFilterContext([
                    {
                        attributeFilter: {
                            attributeElements: { uris: ["foo", "bar"] },
                            displayForm: ReferenceMd.Account.Name.attribute.displayForm,
                            negativeSelection: true,
                        },
                    },
                ]),
            ],
            [
                "filterContext with relative date filter",
                getFilterContext([
                    {
                        dateFilter: {
                            granularity: "GDC.time.date",
                            type: "relative",
                            from: -4,
                            to: -3,
                        },
                    },
                ]),
            ],
            [
                "filterContext with absolute date filter",
                getFilterContext([
                    {
                        dateFilter: {
                            granularity: "GDC.time.date",
                            type: "absolute",
                            from: "2020-01-01",
                            to: "2021-01-01",
                        },
                    },
                ]),
            ],
        ];

        it.each(scenarios)("should handle %s", (_, filterContext) => {
            expect(filterContextToDashboardFiltersByWidget(filterContext, widget)).toMatchSnapshot();
        });
    });

    describe("filterContextToFiltersForDataSet", () => {
        const scenarios: Scenario[] = [
            ["undefined filterContext", undefined],
            [
                "filterContext with positive attribute filter with values",
                getFilterContext([
                    {
                        attributeFilter: {
                            attributeElements: { values: ["foo", "bar"] },
                            displayForm: ReferenceMd.Account.Name.attribute.displayForm,
                            negativeSelection: false,
                        },
                    },
                ]),
            ],
            [
                "filterContext with relative date filter",
                getFilterContext([
                    {
                        dateFilter: {
                            granularity: "GDC.time.date",
                            type: "relative",
                            from: -4,
                            to: -3,
                        },
                    },
                ]),
            ],
            [
                "filterContext with absolute date filter",
                getFilterContext([
                    {
                        dateFilter: {
                            granularity: "GDC.time.date",
                            type: "absolute",
                            from: "2020-01-01",
                            to: "2021-01-01",
                        },
                    },
                ]),
            ],
        ];

        it.each(scenarios)("should handle %s", (_, filterContext) => {
            expect(
                filterContextToDashboardFiltersByDateDataSet(
                    filterContext,
                    ReferenceMd.DateDatasets.Activity.ref,
                ),
            ).toMatchSnapshot();
        });
    });
});
