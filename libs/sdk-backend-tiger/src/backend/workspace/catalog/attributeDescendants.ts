// (C) 2023 GoodData Corporation

import { ObjRef, idRef } from "@gooddata/sdk-model";
import {
    IAttributeHierarchy,
    convertAttributeHierarchy,
} from "../../../convertors/fromBackend/HierarchyConverter.js";

// TODO: getAllPagesOf attributeHierarchy entity
export function loadAttributeHierarchies(): Promise<any[]> {
    const hierarchies = hierarchiesOut.map(convertAttributeHierarchy);

    return Promise.resolve(hierarchies);
}

// TODO: call /computeValidDescendants for all attributes that have descendants and filter out invalid ones
export async function sanitizeAttributeDescendants(
    descendants: IAttributeDescendants,
): Promise<IAttributeDescendants> {
    return Promise.resolve(descendants);
}

export interface IAttributeDescendants {
    [key: string]: ObjRef[];
}

export function getAttributeDescendantsFromAttributeHierarchies(attributeHierarchies: IAttributeHierarchy[]) {
    const descendantsMap: IAttributeDescendants = {};

    // construct descendants map for all attributes available in hierarchies for convenience
    attributeHierarchies.forEach((hierarchy) => {
        const { attributes } = hierarchy;

        attributes.forEach((attribute, index) => {
            const { id: attributeId } = attribute;

            // attributes in each hierarchy are represented by an ordered list,
            // so for each attribute, we take the next one as its descendant
            const foundDescendant = attributes[index + 1];

            if (!foundDescendant) {
                return;
            }

            const foundDescendantRef = idRef(foundDescendant.id, foundDescendant.type);

            if (descendantsMap[attributeId]) {
                descendantsMap[attributeId].push(foundDescendantRef);
            } else {
                descendantsMap[attributeId] = [foundDescendantRef];
            }
        });
    });

    return descendantsMap;
}

// TODO: remove dummy hierarchy data
const hierarchiesOut = [
    {
        id: "hierarchy1",
        type: "AttributeHierarchy",
        attributes: {
            title: "My Hierarchy 1",
            attributes: [
                {
                    id: "f_owner.region_id",
                    type: "attribute",
                },
                {
                    id: "attr.f_owner.salesrep",
                    type: "attribute",
                },
                {
                    id: "attr.f_product.product",
                    type: "attribute",
                },
                {
                    id: "attr.f_stage.stagename",
                    type: "attribute",
                },
            ],
        },
    },
    {
        id: "hierarchy2",
        type: "AttributeHierarchy",
        attributes: {
            title: "My Hierarchy 2",
            attributes: [
                {
                    id: "f_owner.region_id",
                    type: "attribute",
                },
                {
                    id: "f_owner.department_id",
                    type: "attribute",
                },
                {
                    id: "attr.f_owner.salesrep",
                    type: "attribute",
                },
                {
                    id: "attr.f_stage.stagename",
                    type: "attribute",
                },
                {
                    id: "attr.f_product.product",
                    type: "attribute",
                },
            ],
        },
    },
];
