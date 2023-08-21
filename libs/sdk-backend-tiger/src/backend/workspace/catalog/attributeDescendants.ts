// (C) 2023 GoodData Corporation

import { ObjRef, idRef } from "@gooddata/sdk-model";
import { IAttributeHierarchy } from "../../../convertors/fromBackend/HierarchyConverter.js";

export interface IAttributeDescendants {
    [key: string]: ObjRef[];
}

export function getAttributeDescendantsFromAttributeHierarchies(
    attributeIds: string[],
    attributeHierarchies: IAttributeHierarchy[],
) {
    const descendants: IAttributeDescendants = {};

    // TODO: is there some other way to optimize this lookup?
    attributeIds.forEach((attributeId) => {
        attributeHierarchies.forEach((hierarchy) => {
            const foundAttributeIndex = hierarchy.attributes.findIndex(({ id }) => id === attributeId);

            if (foundAttributeIndex < 0) {
                return;
            }

            const foundAttributeDescendant = hierarchy.attributes[foundAttributeIndex + 1];

            if (!foundAttributeDescendant) {
                return;
            }

            const foundDescendantRef = idRef(foundAttributeDescendant.id, foundAttributeDescendant.type);

            if (descendants[attributeId]) {
                descendants[attributeId].push(foundDescendantRef);
            } else {
                descendants[attributeId] = [foundDescendantRef];
            }
        });
    });

    return descendants;
}
