// (C) 2023 GoodData Corporation

import { ObjectType } from "@gooddata/sdk-model";

// TODO: where to put this interface?
export interface IAttributeHierarchy {
    id: string;
    title: string;
    description?: string;
    attributes: { id: string; type: ObjectType }[];
}

export function convertAttributeHierarchy(hierarchyOut: any): IAttributeHierarchy {
    const { id, attributes } = hierarchyOut;

    return {
        id,
        title: attributes.title,
        description: attributes.description,
        attributes: attributes.attributes,
    };
}
