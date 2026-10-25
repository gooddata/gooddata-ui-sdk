// (C) 2019-2026 GoodData Corporation

import { type IAttributeHierarchyMetadataObject, type ICatalogAttributeHierarchy } from "@gooddata/sdk-model";

const attributeHierarchyBase: ICatalogAttributeHierarchy = {
    type: "attributeHierarchy",
    attributeHierarchy: {
        type: "attributeHierarchy",
        id: "abc",
        title: "hierarchy 1",
        attributes: [
            {
                identifier: "county_name",
                type: "attribute",
            },
            {
                identifier: "state_name",
                type: "attribute",
            },
        ],
        ref: {
            identifier: "id2",
            type: "attributeHierarchy",
        },
        description: "hierarchy 1",
        deprecated: false,
        production: true,
        unlisted: false,
        uri: "/abc",
    },
};

export function buildAttributeHierarchyMock(
    props: Partial<IAttributeHierarchyMetadataObject> = {},
): ICatalogAttributeHierarchy {
    return {
        ...attributeHierarchyBase,
        attributeHierarchy: {
            ...attributeHierarchyBase.attributeHierarchy,
            ...props,
        },
    };
}
