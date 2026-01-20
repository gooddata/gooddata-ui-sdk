// (C) 2025-2026 GoodData Corporation

import type { IAttributeDescriptor } from "@gooddata/sdk-model";

export function normalizeAttributeDescriptorLocalIdentifier(
    descriptor: IAttributeDescriptor,
): IAttributeDescriptor {
    const attributeId = descriptor.attributeHeader.formOf.identifier;
    if (!attributeId || descriptor.attributeHeader.localIdentifier === attributeId) {
        return descriptor;
    }

    return {
        ...descriptor,
        attributeHeader: {
            ...descriptor.attributeHeader,
            localIdentifier: attributeId,
        },
    };
}
