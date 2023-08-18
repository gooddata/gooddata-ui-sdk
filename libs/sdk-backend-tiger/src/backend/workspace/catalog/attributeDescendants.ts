// (C) 2023 GoodData Corporation

import { ObjRef, idRef } from "@gooddata/sdk-model";
import { IAttributeHierarchy } from "../../../convertors/fromBackend/HierarchyConverter.js";

export interface IAttributeDescendants {
    [key: string]: {
        hierarchyTitle: string;
        ref: ObjRef;
    }[];
}

export function getAttributeDescendantsFromAttributeHierarchies(
    attributeIds: string[],
    attributeHierarchies: IAttributeHierarchy[],
) {
    const descendants: IAttributeDescendants = {};

    // TODO: is there some other way to optimize this lookup?
    attributeIds.forEach((attributeId) => {
        attributeHierarchies.forEach((hierarchy) => {
            const foundAttributeIndex = hierarchy.attributes.findIndex((id) => id === attributeId);

            if (foundAttributeIndex < 0) {
                return;
            }

            const foundAttributeDescendantId = hierarchy.attributes[foundAttributeIndex + 1];

            if (!foundAttributeDescendantId) {
                return;
            }

            const foundDescendant = {
                hierarchyTitle: hierarchy.title,
                ref: idRef(foundAttributeDescendantId),
            };

            if (descendants[attributeId]) {
                descendants[attributeId].push(foundDescendant);
            } else {
                descendants[attributeId] = [foundDescendant];
            }
        });
    });

    return descendants;
}
