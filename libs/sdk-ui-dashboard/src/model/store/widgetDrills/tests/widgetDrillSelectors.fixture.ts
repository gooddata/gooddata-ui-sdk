// (C) 2023 GoodData Corporation
import { ICatalogAttributeHierarchy, idRef, IDrillDownReference, ObjRef } from "@gooddata/sdk-model";

import { IDrillTargets } from "../../drillTargets/drillTargetsTypes.js";

export const widgetRef: ObjRef = {
    identifier: "4361c310-891c-4af7-b2c5-877f4d5ec432_widget-0",
    uri: "4361c310-891c-4af7-b2c5-877f4d5ec432_widget-0",
};

export const widgetRefWithoutAvailableDrillTargets: ObjRef = {
    identifier: "4361c310-891c-4af7-b2c5-877f4d5ec432_widget-1",
    uri: "4361c310-891c-4af7-b2c5-877f4d5ec432_widget-1",
};

export const availableDrillTargets: IDrillTargets = {
    identifier: "4361c310-891c-4af7-b2c5-877f4d5ec432_widget-0",
    uri: "4361c310-891c-4af7-b2c5-877f4d5ec432_widget-0",
    ref: {
        identifier: "4361c310-891c-4af7-b2c5-877f4d5ec432_widget-0",
    },
    availableDrillTargets: {
        measures: [
            {
                measure: {
                    measureHeaderItem: {
                        localIdentifier: "e0dd75b358d44129a1edc330bf36b0e2",
                        name: "Amount",
                        format: "$#,##0.00",
                        identifier: "87a053b0-3947-49f3-b0c5-de53fd01f050",
                        ref: {
                            identifier: "87a053b0-3947-49f3-b0c5-de53fd01f050",
                            type: "measure",
                        },
                    },
                },
                attributes: [
                    {
                        attributeHeader: {
                            uri: "",
                            identifier: "label.f_product.product.name",
                            ref: {
                                identifier: "label.f_product.product.name",
                                type: "displayForm",
                            },
                            formOf: {
                                identifier: "attr.f_product.product",
                                name: "Product",
                                uri: "",
                                ref: {
                                    identifier: "attr.f_product.product",
                                    type: "attribute",
                                },
                            },
                            localIdentifier: "adb0808585b34879b8b603a7e52a60b7",
                            name: "Product Name",
                            totalItems: [],
                        },
                    },
                    {
                        attributeHeader: {
                            uri: "",
                            identifier: "f_owner.region_id",
                            ref: {
                                identifier: "f_owner.region_id",
                                type: "displayForm",
                            },
                            formOf: {
                                identifier: "f_owner.region_id",
                                name: "Region",
                                uri: "",
                                ref: {
                                    identifier: "f_owner.region_id",
                                    type: "attribute",
                                },
                            },
                            localIdentifier: "458cb8556b604396be5d736ada2aa833",
                            name: "Region",
                            totalItems: [],
                        },
                    },
                    {
                        attributeHeader: {
                            uri: "",
                            identifier: "f_owner.department_id",
                            ref: {
                                identifier: "f_owner.department_id",
                                type: "displayForm",
                            },
                            formOf: {
                                identifier: "f_owner.department_id",
                                name: "Department",
                                uri: "",
                                ref: {
                                    identifier: "f_owner.department_id",
                                    type: "attribute",
                                },
                            },
                            localIdentifier: "f20e093c6af5439dbfce10ee37620fc8",
                            name: "Department",
                            totalItems: [],
                        },
                    },
                ],
            },
        ],
        attributes: [
            {
                attribute: {
                    attributeHeader: {
                        uri: "",
                        identifier: "label.f_product.product.name",
                        ref: {
                            identifier: "label.f_product.product.name",
                            type: "displayForm",
                        },
                        formOf: {
                            identifier: "attr.f_product.product",
                            name: "Product",
                            uri: "",
                            ref: {
                                identifier: "attr.f_product.product",
                                type: "attribute",
                            },
                        },
                        localIdentifier: "adb0808585b34879b8b603a7e52a60b7",
                        name: "Product Name",
                        totalItems: [],
                    },
                },
                intersectionAttributes: [
                    {
                        attributeHeader: {
                            uri: "",
                            identifier: "label.f_product.product.name",
                            ref: {
                                identifier: "label.f_product.product.name",
                                type: "displayForm",
                            },
                            formOf: {
                                identifier: "attr.f_product.product",
                                name: "Product",
                                uri: "",
                                ref: {
                                    identifier: "attr.f_product.product",
                                    type: "attribute",
                                },
                            },
                            localIdentifier: "adb0808585b34879b8b603a7e52a60b7",
                            name: "Product Name",
                            totalItems: [],
                        },
                    },
                ],
            },
            {
                attribute: {
                    attributeHeader: {
                        uri: "",
                        identifier: "f_owner.region_id",
                        ref: {
                            identifier: "f_owner.region_id",
                            type: "displayForm",
                        },
                        formOf: {
                            identifier: "f_owner.region_id",
                            name: "Region",
                            uri: "",
                            ref: {
                                identifier: "f_owner.region_id",
                                type: "attribute",
                            },
                        },
                        localIdentifier: "458cb8556b604396be5d736ada2aa833",
                        name: "Region",
                        totalItems: [],
                    },
                },
                intersectionAttributes: [
                    {
                        attributeHeader: {
                            uri: "",
                            identifier: "f_owner.region_id",
                            ref: {
                                identifier: "f_owner.region_id",
                                type: "displayForm",
                            },
                            formOf: {
                                identifier: "f_owner.region_id",
                                name: "Region",
                                uri: "",
                                ref: {
                                    identifier: "f_owner.region_id",
                                    type: "attribute",
                                },
                            },
                            localIdentifier: "458cb8556b604396be5d736ada2aa833",
                            name: "Region",
                            totalItems: [],
                        },
                    },
                ],
            },
            {
                attribute: {
                    attributeHeader: {
                        uri: "",
                        identifier: "f_owner.department_id",
                        ref: {
                            identifier: "f_owner.department_id",
                            type: "displayForm",
                        },
                        formOf: {
                            identifier: "f_owner.department_id",
                            name: "Department",
                            uri: "",
                            ref: {
                                identifier: "f_owner.department_id",
                                type: "attribute",
                            },
                        },
                        localIdentifier: "f20e093c6af5439dbfce10ee37620fc8",
                        name: "Department",
                        totalItems: [],
                    },
                },
                intersectionAttributes: [
                    {
                        attributeHeader: {
                            uri: "",
                            identifier: "f_owner.region_id",
                            ref: {
                                identifier: "f_owner.region_id",
                                type: "displayForm",
                            },
                            formOf: {
                                identifier: "f_owner.region_id",
                                name: "Region",
                                uri: "",
                                ref: {
                                    identifier: "f_owner.region_id",
                                    type: "attribute",
                                },
                            },
                            localIdentifier: "458cb8556b604396be5d736ada2aa833",
                            name: "Region",
                            totalItems: [],
                        },
                    },
                    {
                        attributeHeader: {
                            uri: "",
                            identifier: "f_owner.department_id",
                            ref: {
                                identifier: "f_owner.department_id",
                                type: "displayForm",
                            },
                            formOf: {
                                identifier: "f_owner.department_id",
                                name: "Department",
                                uri: "",
                                ref: {
                                    identifier: "f_owner.department_id",
                                    type: "attribute",
                                },
                            },
                            localIdentifier: "f20e093c6af5439dbfce10ee37620fc8",
                            name: "Department",
                            totalItems: [],
                        },
                    },
                ],
            },
        ],
    },
};

export const catalogAttributeHierarchies: ICatalogAttributeHierarchy[] = [
    {
        type: "attributeHierarchy",
        attributeHierarchy: {
            type: "attributeHierarchy",
            id: "477f101d580549049144fdb8aa39f7b4_attribute_hierarchies_2",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/477f101d580549049144fdb8aa39f7b4/attributeHierarchies/477f101d580549049144fdb8aa39f7b4_attribute_hierarchies_2",
            ref: {
                identifier: "477f101d580549049144fdb8aa39f7b4_attribute_hierarchies_2",
                type: "attributeHierarchy",
            },
            title: "Attribute Hierarchies 2",
            description: "Attribute Hierarchies 2",
            attributes: [
                {
                    identifier: "f_owner.region_id",
                    type: "attribute",
                },
                {
                    identifier: "f_owner.department_id",
                    type: "attribute",
                },
                {
                    identifier: "attr.f_product.product",
                    type: "attribute",
                },
            ],
            production: true,
            deprecated: false,
            unlisted: false,
        },
    },
    {
        type: "attributeHierarchy",
        attributeHierarchy: {
            type: "attributeHierarchy",
            id: "477f101d580549049144fdb8aa39f7b4_attribute_hierarchies_1",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/477f101d580549049144fdb8aa39f7b4/attributeHierarchies/477f101d580549049144fdb8aa39f7b4_attribute_hierarchies_1",
            ref: {
                identifier: "477f101d580549049144fdb8aa39f7b4_attribute_hierarchies_1",
                type: "attributeHierarchy",
            },
            title: "Attribute Hierarchies 1",
            description: "Attribute Hierarchies 1",
            attributes: [
                {
                    identifier: "f_owner.region_id",
                    type: "attribute",
                },
                {
                    identifier: "f_owner.department_id",
                    type: "attribute",
                },
                {
                    identifier: "attr.f_product.product",
                    type: "attribute",
                },
            ],
            production: true,
            deprecated: false,
            unlisted: false,
        },
    },
];

export const ignoredHierarchies: IDrillDownReference[] = [
    {
        type: "attributeHierarchyReference",
        attributeHierarchy: idRef(
            "477f101d580549049144fdb8aa39f7b4_attribute_hierarchies_1",
            "attributeHierarchy",
        ),
        label: idRef("f_owner.department_id", "displayForm"),
    },
];
