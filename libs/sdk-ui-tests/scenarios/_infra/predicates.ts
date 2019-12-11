// (C) 2007-2019 GoodData Corporation

import { ReferenceLdm } from "@gooddata/reference-workspace";
import { measureIdentifier } from "@gooddata/sdk-model";
import { HeaderPredicateFactory } from "@gooddata/sdk-ui";

/**
 * Predicates matching particular attribute elements
 */
export const AttributeElements = {
    Product: {
        Explorer: HeaderPredicateFactory.attributeItemNameMatch("Explorer"),
        WonderKid: HeaderPredicateFactory.attributeItemNameMatch("WonderKid"),
    },
    Region: {
        EastCoast: HeaderPredicateFactory.attributeItemNameMatch("East Coast"),
        WestCoast: HeaderPredicateFactory.attributeItemNameMatch("West Coast"),
    },
};

export const AmountMeasurePredicate = HeaderPredicateFactory.identifierMatch(
    measureIdentifier(ReferenceLdm.Amount)!,
);
export const WonMeasurePredicate = HeaderPredicateFactory.identifierMatch(
    measureIdentifier(ReferenceLdm.Won)!,
);
export const SampleXirrMeasurePredicate = HeaderPredicateFactory.identifierMatch(
    measureIdentifier(ReferenceLdm.SampleXIRR)!,
);
