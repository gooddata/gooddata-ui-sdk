// (C) 2019-2023 GoodData Corporation
import { JsonApiWorkspaceOut, JsonApiWorkspaceOutWithLinks } from "@gooddata/api-client-tiger";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

export const workspaceConverter = (
    { relationships, attributes, id, meta }: JsonApiWorkspaceOut | JsonApiWorkspaceOutWithLinks,
    parentPrefixes: string[],
): IWorkspaceDescriptor => {
    const parentWorkspace = relationships?.parent?.data?.id;
    const { hierarchy, dataModel } = meta || {};
    return {
        description: attributes?.description || attributes?.name || id,
        title: attributes?.name || "",
        id: id,
        prefix: attributes?.prefix,
        parentWorkspace,
        parentPrefixes,
        childrenCount: hierarchy?.childrenCount,
        datasetCount: dataModel?.datasetCount,
    };
};
