// (C) 2007-2019 GoodData Corporation

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
