// (C) 2007-2020 GoodData Corporation
import { describe, expect, it } from "vitest";
import { isValidSetFilterParentsCommandData } from "../validators.js";

describe("isValidSetFilterParentsCommandData", () => {
    function newCommandData(filters: any): any {
        return {
            filters,
        };
    }

    function newAttributeFilter(displayForm: any): any {
        return {
            attributeFilter: {
                displayForm,
            },
        };
    }

    function newParentItem(parent: any, connectingAttribute: any): any {
        return {
            connectingAttribute,
            parent,
        };
    }

    function newFilterItem(filter: any, parents: any): any {
        return {
            filter,
            parents,
        };
    }

    function newUri(uri: any): any {
        return { uri };
    }

    function newLocalId(localIdentifier: any): any {
        return { localIdentifier };
    }

    function newIdentifier(identifier: any): any {
        return { identifier };
    }

    const validRef = newUri("uri1");
    const validFilter = newAttributeFilter(validRef);
    const validParentItem = newParentItem(validFilter, validRef);
    const validFilterItem = newFilterItem(validFilter, [validParentItem]);
    const dateFilter: any = {
        dateFilter: validRef,
    };

    function newCommandWithConnectingAttribute(connectingAttribute: any): any {
        return {
            filters: [
                {
                    filter: validFilter,
                    parents: [
                        {
                            parent: validFilter,
                            connectingAttribute,
                        },
                    ],
                },
            ],
        };
    }

    function newCommandWithParent(parent: any): any {
        return {
            filters: [
                {
                    filter: validFilter,
                    parents: [
                        {
                            parent,
                            connectingAttribute: validRef,
                        },
                    ],
                },
            ],
        };
    }

    function newCommandWithFilter(filter: any): any {
        return {
            filters: [
                {
                    filter,
                    parents: [
                        {
                            parent: validFilter,
                            connectingAttribute: validRef,
                        },
                    ],
                },
            ],
        };
    }

    const Scenarios: Array<[boolean, string, any]> = [
        // Filter items
        [true, "with empty array of filter items", newCommandData([])],
        [false, "with undefined filter items", newCommandData(undefined)],
        [true, "with single valid filter item", newCommandData([validFilterItem])],
        [true, "with multiple valid filter items", newCommandData([validFilterItem, validFilterItem])],
        [
            false,
            "with single invalid filter items",
            newCommandData([validFilterItem, newFilterItem(undefined, validParentItem)]),
        ],

        // Filter item parents
        [
            false,
            "with filter item with undefined parents",
            newCommandData([newFilterItem(validFilter, undefined)]),
        ],
        [true, "with filter item with empty parents", newCommandData([newFilterItem(validFilter, [])])],

        // Parent connecting attribute
        [
            false,
            "with filter item with undefined connecting attribute",
            newCommandWithConnectingAttribute(undefined),
        ],
        [
            false,
            "with filter item with connecting attribute with localIdentifier",
            newCommandWithConnectingAttribute(newLocalId("id")),
        ],
        [
            true,
            "with filter item with connecting attribute with uri",
            newCommandWithConnectingAttribute(newUri("uri")),
        ],
        [
            true,
            "with filter item with connecting attribute with identifier",
            newCommandWithConnectingAttribute(newIdentifier("id")),
        ],

        // Parent filter
        [false, "with filter item with undefined parent", newCommandWithParent(undefined)],
        [
            false,
            "with filter item with parent with localIdentifier",
            newCommandWithParent(newAttributeFilter(newLocalId("id"))),
        ],
        [
            true,
            "with filter item with parent with identifier",
            newCommandWithParent(newAttributeFilter(newIdentifier("id"))),
        ],
        [
            true,
            "with filter item with parent with uri",
            newCommandWithParent(newAttributeFilter(newUri("uri"))),
        ],
        [false, "with filter item with parent with dateFilter", newCommandWithParent(dateFilter)],

        // Filter
        [false, "with filter item with undefined filter", newCommandWithFilter(undefined)],
        [false, "with filter item with filter with dateFilter", newCommandWithFilter(dateFilter)],
        [
            false,
            "with filter item with filter with localIdentifier",
            newCommandWithFilter(newAttributeFilter(newLocalId("id"))),
        ],
        [
            true,
            "with filter item with filter with identifier",
            newCommandWithFilter(newAttributeFilter(newIdentifier("id"))),
        ],
        [
            true,
            "with filter item with filter with uri",
            newCommandWithFilter(newAttributeFilter(newUri("uri"))),
        ],
    ];

    it.each(Scenarios)("should return %s when data is %s", (expectedResult, _desc, input) => {
        expect(isValidSetFilterParentsCommandData(input)).toEqual(expectedResult);
    });
});
