// (C) 2020 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { FilterContextItem, IFilterContext, IWidgetDefinition } from "@gooddata/sdk-backend-spi";
import { idRef, uriRef } from "@gooddata/sdk-model";

import { filterContextToFiltersForWidget } from "../converters";

describe("filterContextToFiltersForWidget", () => {
    const widget: IWidgetDefinition = {
        description: "",
        drills: [],
        ignoreDashboardFilters: [],
        title: "Widget",
        type: "insight",
        dateDataSet: ReferenceLdm.DateDatasets.Activity.ref,
        insight: idRef(ReferenceLdm.Insights.Test),
    };

    const getFilterContext = (filters: FilterContextItem[]): IFilterContext => ({
        description: "",
        filters,
        identifier: "foo",
        ref: idRef("foo"),
        title: "",
        uri: "/gdc/md/foo",
    });

    type Scenario = [string, IFilterContext | undefined];

    const scenarios: Scenario[] = [
        ["undefined filterContext", undefined],
        [
            "filterContext with positive attribute filter with values",
            getFilterContext([
                {
                    attributeFilter: {
                        attributeElements: [idRef("foo"), idRef("bar")],
                        displayForm: ReferenceLdm.Account.Name.attribute.displayForm,
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
                        attributeElements: [uriRef("foo"), uriRef("bar")],
                        displayForm: ReferenceLdm.Account.Name.attribute.displayForm,
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
        expect(filterContextToFiltersForWidget(filterContext, widget)).toMatchSnapshot();
    });
});
