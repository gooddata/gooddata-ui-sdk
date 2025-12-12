// (C) 2019-2024 GoodData Corporation
import { type JsonApiWorkspaceOut, type JsonApiWorkspaceOutWithLinks } from "@gooddata/api-client-tiger";
import { type IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

export const workspaceConverter = (
    { relationships, attributes, id, meta }: JsonApiWorkspaceOut | JsonApiWorkspaceOutWithLinks,
    parentPrefixes: string[],
): IWorkspaceDescriptor => {
    const parentWorkspace = relationships?.parent?.data?.id;
    return {
        description: attributes?.description ?? "",
        title: attributes?.name ?? "",
        id: id,
        prefix: attributes?.prefix ?? undefined,
        parentWorkspace,
        parentPrefixes,
        earlyAccess: attributes?.earlyAccess ?? undefined,
        earlyAccessValues: attributes?.earlyAccessValues ?? undefined,
        childWorkspacesCount: meta?.hierarchy?.childrenCount,
    };
};
