// (C) 2021 GoodData Corporation

import { dashboardFilterContextDefinition, dashboardFilterContextSanitize } from "../dashboardFilterContext";
// TODO RAIL-3383 move the fixtures?
import { EmptyDashboardWithReferences } from "../../../model/tests/fixtures/Dashboard.fixtures";
import { defaultDateFilterConfig } from "../../dateFilterConfig/defaultConfig";
import { TestFilterContext, TestFilterContextWithInvalidParents } from "./dashboardFilterContext.fixture";
import { uriRef } from "@gooddata/sdk-model";
import { SimpleDashboardWithReferences } from "../../../model/tests/fixtures/SimpleDashboard.fixtures";

describe("dashboardFilterContextDefinition", () => {
    it("should return default filter context when dashboard does not have one", () => {
        const filterContext = dashboardFilterContextDefinition(
            EmptyDashboardWithReferences.dashboard,
            defaultDateFilterConfig,
        );

        expect(filterContext.ref).toBeUndefined();
        expect(filterContext.filters).toBeDefined();
    });

    it("should remove identity from persisted filter context", () => {
        const filterContext = dashboardFilterContextDefinition(
            SimpleDashboardWithReferences.dashboard,
            defaultDateFilterConfig,
        );

        expect(filterContext).toEqual({
            ...SimpleDashboardWithReferences.dashboard.filterContext,
            ref: undefined,
            uri: undefined,
            identifier: undefined,
        });
    });
});

describe("omitNonExistingParentsFromFilterContext", () => {
    it("should handle filters without local identifiers and parents", () => {
        const getResult = () => dashboardFilterContextSanitize(TestFilterContext);

        expect(getResult).not.toThrow();
    });

    it("should only remove connections to non-existing parents", () => {
        const result = dashboardFilterContextSanitize(TestFilterContextWithInvalidParents);

        expect(result.filters).toEqual([
            {
                dateFilter: {
                    type: "relative",
                    granularity: "GDC.time.date",
                },
            },
            {
                attributeFilter: {
                    attributeElements: {
                        uris: [
                            "/gdc/md/GoodSalesDemo/obj/1251/elements?id=169661",
                            "/gdc/md/GoodSalesDemo/obj/1251/elements?id=169658",
                        ],
                    },
                    displayForm: uriRef("/gdc/md/GoodSalesDemo/obj/1252"),
                    localIdentifier: "filter1",
                    negativeSelection: false,
                },
            },
            {
                attributeFilter: {
                    attributeElements: {
                        uris: ["/gdc/md/GoodSalesDemo/obj/1026/elements?id=1234"],
                    },
                    displayForm: uriRef("/gdc/md/GoodSalesDemo/obj/1027"),
                    localIdentifier: "filter2",
                    filterElementsBy: [
                        {
                            filterLocalIdentifier: "filter1",
                            over: {
                                attributes: [uriRef("/gdc/md/GoodSalesDemo/obj/9999")],
                            },
                        },
                    ],
                    negativeSelection: true,
                },
            },
        ]);
    });
});
