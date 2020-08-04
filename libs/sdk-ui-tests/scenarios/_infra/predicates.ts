// (C) 2007-2019 GoodData Corporation

import { ReferenceLdm } from "@gooddata/reference-workspace";
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
    measureIdentifier(ReferenceLdm.Amount)!,
);
export const WonMeasurePredicate = HeaderPredicates.identifierMatch(measureIdentifier(ReferenceLdm.Won)!);
export const SampleXirrMeasurePredicate = HeaderPredicates.identifierMatch(
    measureIdentifier(ReferenceLdm.SampleXIRR)!,
);

export const DepartmentPredicate = HeaderPredicates.identifierMatch(
    attributeIdentifier(ReferenceLdm.Department)!,
);

export const ProductPredicate = HeaderPredicates.identifierMatch(
    attributeIdentifier(ReferenceLdm.Product.Name)!,
);

export const SalesRepPredicate = HeaderPredicates.identifierMatch(
    attributeIdentifier(ReferenceLdm.SalesRep.OwnerName)!,
);
