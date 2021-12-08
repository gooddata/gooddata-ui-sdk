// (C) 2021 GoodData Corporation
import { IFilter, newRelativeDateFilter, ObjRef } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";

import { hasDateFilterForDateDataset } from "../filters";

describe("hasDateFilterForDateDataset", () => {
    type Scenario = [boolean, string, IFilter[], ObjRef];

    const dateDimension = ReferenceMd.DateDatasets.Created.ref;
    const otherDateDimension = ReferenceMd.DateDatasets.Timeline.ref;

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
