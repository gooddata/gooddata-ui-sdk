// (C) 2020 GoodData Corporation
import { IFilter, newAllTimeFilter, newRelativeDateFilter, ObjRef } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { hasDateFilterForDateDataset, addImplicitAllTimeFilter } from "../utils";
import { IWidgetDefinition } from "@gooddata/sdk-backend-spi";

describe("hasDateFilterForDateDataset", () => {
    type Scenario = [boolean, string, IFilter[], ObjRef];

    const dateDimension = ReferenceLdm.DateDatasets.Created.ref;
    const otherDateDimension = ReferenceLdm.DateDatasets.Timeline.ref;

    const matchingFilter = newRelativeDateFilter(dateDimension, "GDC.time.date", -5, 5);
    const notMatchingFilter = newRelativeDateFilter(otherDateDimension, "GDC.time.date", -5, 5);

    const scenarios: Scenario[] = [
        [false, "empty filters", [], dateDimension],
        [false, "undefined date dimension", [matchingFilter], undefined],
        [false, "not matching date dimension", [notMatchingFilter], dateDimension],
        [true, "matching date dimension and filter", [matchingFilter], dateDimension],
    ];

    it.each(scenarios)("should return %p for %s", (expected, _, filters, dateDimension) => {
        expect(hasDateFilterForDateDataset(filters, dateDimension)).toEqual(expected);
    });
});

describe("addImplicitAllTimeFilter", () => {
    type Scenario = [string, IWidgetDefinition, IFilter[], IFilter[]];

    const dateDimension = ReferenceLdm.DateDatasets.Created.ref;
    const otherDateDimension = ReferenceLdm.DateDatasets.Timeline.ref;

    const matchingFilter = newRelativeDateFilter(dateDimension, "GDC.time.date", -5, 5);
    const notMatchingFilter = newRelativeDateFilter(otherDateDimension, "GDC.time.date", -5, 5);

    const widgetWithNoDateDataset: IWidgetDefinition = {
        description: "",
        drills: [],
        ignoreDashboardFilters: [],
        title: "Foo",
        type: "insight",
        dateDataSet: undefined,
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
