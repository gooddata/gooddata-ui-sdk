// (C) 2024-2025 GoodData Corporation

import { JsonApiWorkspacePatch } from "@gooddata/api-client-tiger";
import { IWorkspaceDescriptorUpdate } from "@gooddata/sdk-backend-spi";

export const convertWorkspaceUpdate = (
    descriptor: IWorkspaceDescriptorUpdate,
    workspaceId: string,
): JsonApiWorkspacePatch => {
    return {
        id: workspaceId,
        type: "workspace",
        attributes: {
            name: descriptor.title,
            description: descriptor.description,
            // type casts are necessary because nulls are not allowed in the type definition,
            // but backend expects them in case we want to delete the value
            prefix: descriptor.prefix as string | undefined,
            earlyAccess: descriptor.earlyAccess as string | undefined,
            earlyAccessValues: descriptor.earlyAccessValues as string[] | undefined,
        },
    };
};
