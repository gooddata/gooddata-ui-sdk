// (C) 2019-2021 GoodData Corporation
import { WorkspaceObjectModel } from "@gooddata/api-client-tiger";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

export const convertWorkspaceToDescriptor = ({
    attributes,
    id,
}: WorkspaceObjectModel.IWorkspace): IWorkspaceDescriptor => {
    const workspace: IWorkspaceDescriptor = {
        description: attributes.name,
        title: attributes.name,
        id: id,
    };

    return workspace;
};
