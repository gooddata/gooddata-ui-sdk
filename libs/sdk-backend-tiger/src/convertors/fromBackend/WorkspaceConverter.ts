// (C) 2019-2022 GoodData Corporation
import { JsonApiWorkspaceOut, JsonApiWorkspaceOutWithLinks } from "@gooddata/api-client-tiger";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

export const workspaceConverter = ({
    relationships,
    attributes,
    id,
}: JsonApiWorkspaceOut | JsonApiWorkspaceOutWithLinks): IWorkspaceDescriptor => {
    const parentWorkspace = relationships?.parent?.data?.id;
    return {
        description: attributes?.description || attributes?.name || id,
        title: attributes?.name || id,
        id: id,
        parentWorkspace,
    };
};
