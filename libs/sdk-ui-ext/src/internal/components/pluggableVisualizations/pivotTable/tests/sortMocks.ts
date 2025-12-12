// (C) 2020 GoodData Corporation

// sortItems based on referencePointMocks.simpleStackedReferencePoint
import {
    type IAttributeSortItem,
    type IMeasureSortItem,
    newAttributeLocator,
    newAttributeSort,
    newMeasureSort,
} from "@gooddata/sdk-model";

export const validMeasureSort: IMeasureSortItem = newMeasureSort("m1", "asc", [
    newAttributeLocator("a2", "/gdc/md/PROJECTID/obj/2210/elements?id=1234"),
]);
export const validAttributeSort: IAttributeSortItem = newAttributeSort("a1", "desc");
export const invalidAttributeSort: IAttributeSortItem = newAttributeSort("invalid", "desc");

export const invalidMeasureSortInvalidMeasure: IMeasureSortItem = newMeasureSort("invalid", "asc", [
    newAttributeLocator("a2", "/gdc/md/PROJECTID/obj/2210/elements?id=1234"),
]);

export const invalidMeasureSortInvalidAttribute: IMeasureSortItem = newMeasureSort("m1", "asc", [
    newAttributeLocator("a1", "/gdc/md/PROJECTID/obj/2210/elements?id=1234"),
]);

export const invalidMeasureSortTooManyLocators: IMeasureSortItem = newMeasureSort("m1", "asc", [
    newAttributeLocator("a2", "/gdc/md/PROJECTID/obj/2210/elements?id=1234"),
    newAttributeLocator("a2", "/gdc/md/PROJECTID/obj/2210/elements?id=1234"),
]);

export const invalidMeasureSortLocatorsTooShort: IMeasureSortItem = newMeasureSort("m1", "asc");
