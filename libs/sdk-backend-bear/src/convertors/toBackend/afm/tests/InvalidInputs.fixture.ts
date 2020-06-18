// (C) 2020 GoodData Corporation
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
import { ReferenceLdmExt, ReferenceLdm } from "@gooddata/reference-workspace";

export const absoluteFilter = {
    // Invalid "To" input
    withoutTo: newAbsoluteDateFilter(ReferenceLdmExt.dataSet, "2019-08-06"),
    // Invalid "From" input
    withoutFrom: newAbsoluteDateFilter(ReferenceLdmExt.dataSet, undefined, "2019-08-12"),
};

export const relativeFilter = {
    // Invalid "To" input
    withoutTo: newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.date, 5),
    // Invalid "From" input
    withoutFrom: newRelativeDateFilter(
        ReferenceLdmExt.ClosedDataDatasetRef,
        DateGranularity.date,
        undefined,
        30,
    ),
};

export const measureValueFilterWithoutCondition = {
    measureValueFilter: {
        measure: ReferenceLdm.Amount,
        condition: undefined,
    },
};

export const negativeEmptyAttributeFilter = newNegativeAttributeFilter(ReferenceLdm.Product.Name, []);

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
