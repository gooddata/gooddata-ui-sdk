// (C) 2020-2022 GoodData Corporation
import { IFilter, newAllTimeFilter, newRelativeDateFilter, idRef } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { addImplicitAllTimeFilter } from "../utils";
import { IWidgetDefinition } from "@gooddata/sdk-backend-spi";

describe("addImplicitAllTimeFilter", () => {
    type Scenario = [string, IWidgetDefinition, IFilter[], IFilter[]];

    const dateDimension = ReferenceMd.DateDatasets.Created.ref;
    const otherDateDimension = ReferenceMd.DateDatasets.Timeline.ref;

    const matchingFilter = newRelativeDateFilter(dateDimension, "GDC.time.date", -5, 5);
    const notMatchingFilter = newRelativeDateFilter(otherDateDimension, "GDC.time.date", -5, 5);

    const widgetWithNoDateDataset: IWidgetDefinition = {
        description: "",
        drills: [],
        ignoreDashboardFilters: [],
        title: "Foo",
        type: "insight",
        dateDataSet: undefined,
        insight: idRef("insight"),
        configuration: {
            hideTitle: false,
        },
    };

    const widgetWithMatchingDateDataset: IWidgetDefinition = {
        ...widgetWithNoDateDataset,
        dateDataSet: dateDimension,
    };

    const widgetWithNotMatchingDateDataset: IWidgetDefinition = {
        ...widgetWithNoDateDataset,
        dateDataSet: otherDateDimension,
    };

    const expectedFilter = newAllTimeFilter(dateDimension);
    const expectedNotMatchingFilter = newAllTimeFilter(otherDateDimension);

    const scenarios: Scenario[] = [
        ["empty filters with no date dataset", widgetWithNoDateDataset, [], []],
        ["empty filters with matching date dataset", widgetWithMatchingDateDataset, [], [expectedFilter]],
        [
            "empty filters with not matching date dataset",
            widgetWithNotMatchingDateDataset,
            [],
            [expectedNotMatchingFilter],
        ],
        ["filters with matching filter", widgetWithMatchingDateDataset, [matchingFilter], [matchingFilter]],
        [
            "filters with not matching filter",
            widgetWithMatchingDateDataset,
            [notMatchingFilter],
            [notMatchingFilter, expectedFilter],
        ],
    ];

    it.each(scenarios)("should handle %s properly", (_, widget, filters, expected) => {
        expect(addImplicitAllTimeFilter(widget, filters)).toEqual(expected);
    });
});
