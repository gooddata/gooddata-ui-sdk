// (C) 2007-2019 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { measureIdentifier, attributeIdentifier } from "@gooddata/sdk-model";
import { HeaderPredicates } from "@gooddata/sdk-ui";

/**
 * Predicates matching particular attribute elements
 */
export const AttributeElements = {
    Product: {
        Explorer: HeaderPredicates.attributeItemNameMatch("Explorer"),
        WonderKid: HeaderPredicates.attributeItemNameMatch("WonderKid"),
    },
    Region: {
        EastCoast: HeaderPredicates.attributeItemNameMatch("East Coast"),
        WestCoast: HeaderPredicates.attributeItemNameMatch("West Coast"),
    },
};

export const AmountMeasurePredicate = HeaderPredicates.identifierMatch(
    measureIdentifier(ReferenceMd.Amount)!,
);
export const WonMeasurePredicate = HeaderPredicates.identifierMatch(measureIdentifier(ReferenceMd.Won)!);
export const SampleXirrMeasurePredicate = HeaderPredicates.identifierMatch(
    measureIdentifier(ReferenceMd.SampleXIRR)!,
);

export const DepartmentPredicate = HeaderPredicates.identifierMatch(
    attributeIdentifier(ReferenceMd.Department)!,
);

export const ProductPredicate = HeaderPredicates.identifierMatch(
    attributeIdentifier(ReferenceMd.Product.Name)!,
);

export const SalesRepPredicate = HeaderPredicates.identifierMatch(
    attributeIdentifier(ReferenceMd.SalesRep.OwnerName)!,
);
