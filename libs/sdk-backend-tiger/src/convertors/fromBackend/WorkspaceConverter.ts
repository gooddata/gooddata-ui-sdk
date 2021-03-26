// (C) 2019-2021 GoodData Corporation
import { JsonApiWorkspaceOutWithLinks } from "@gooddata/api-client-tiger";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

export const workspaceConverter = ({
    relationships,
    attributes,
    id,
}: JsonApiWorkspaceOutWithLinks): IWorkspaceDescriptor => {
    // TODO: TIGER HACK: Update api-client-tiger, once metadata json-api schema is fixed
    const parentWorkspace = (relationships as any)?.parent?.data?.id;
    const workspace: IWorkspaceDescriptor = {
        description: attributes?.name || id,
        title: attributes?.name || id,
        id: id,
        parentWorkspace,
    };

    return workspace;
};
