// (C) 2020 GoodData Corporation
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/**
 * A garbage file that creates fixtures to bypass typescript strict type checking
 * in order to test invalid inputs
 */
import {
    newNegativeAttributeFilter,
    newAbsoluteDateFilter,
    newRelativeDateFilter,
    DateGranularity,
    IMeasure,
    IExecutionDefinition,
    newAttribute,
} from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";

export const absoluteFilter = {
    // Invalid "To" input
    withoutTo: newAbsoluteDateFilter(ReferenceMd.DateDatasets.Closed.ref, "2019-08-06"),
    // Invalid "From" input
    withoutFrom: newAbsoluteDateFilter(ReferenceMd.DateDatasets.Closed.ref, undefined, "2019-08-12"),
};

export const relativeFilter = {
    // Invalid "To" input
    withoutTo: newRelativeDateFilter(ReferenceMd.DateDatasets.Closed.ref, DateGranularity.date, 5),
    // Invalid "From" input
    withoutFrom: newRelativeDateFilter(
        ReferenceMd.DateDatasets.Closed.ref,
        DateGranularity.date,
        undefined,
        30,
    ),
};

export const measureValueFilterWithoutCondition = {
    measureValueFilter: {
        measure: ReferenceMd.Amount,
        condition: undefined,
    },
};

export const negativeEmptyAttributeFilter = newNegativeAttributeFilter(ReferenceMd.Product.Name, []);

// Measure converter: unsupported measure definition
export const invalidMeasureDefinition: IMeasure = {
    measure: {
        definition: {},
        localIdentifier: "m_asd",
    },
};

// Definition with defined Alias
export const defWithAlias: IExecutionDefinition = {
    workspace: "test workspace",
    buckets: [],
    measures: [],
    attributes: [
        newAttribute("attribute1", (m) => m.alias("alias")),
        newAttribute("attribute2", (m) => m.localId()),
    ],
    filters: [],
    sortBy: [],
    dimensions: [],
};

// Definition with undefined filters
export const defWithoutFilters: IExecutionDefinition = {
    workspace: "test workspace",
    buckets: [],
    measures: [],
    attributes: [],
    filters: undefined,
    sortBy: [],
    dimensions: [],
};
