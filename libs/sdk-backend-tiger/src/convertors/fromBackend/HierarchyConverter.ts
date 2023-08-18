// (C) 2023 GoodData Corporation

// TODO: where to put this interface?
export interface IAttributeHierarchy {
    id: string;
    title: string;
    description?: string;
    attributes: string[];
}

export function convertAttributeHierarchy(hierarchyOut: any): IAttributeHierarchy {
    const { id, attributes } = hierarchyOut;

    return {
        id,
        title: attributes.title,
        description: attributes.description,
        attributes: attributes.attributes.map(({ id }: { id: string }) => id),
    };
}
