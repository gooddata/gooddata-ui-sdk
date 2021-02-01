// (C) 2021 GoodData Corporation

import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import { WorkspaceObjectModel } from "@gooddata/api-client-tiger";

export const convertWorkspace = ({ workspace }: WorkspaceObjectModel.IWorkspace): IWorkspaceDescriptor => {
    const convertedWorkspace: IWorkspaceDescriptor = {
        description: workspace.attributes.name,
        title: workspace.attributes.name,
        id: workspace.links.self.match(/\/gdc\/projects\/(.+)/i)![1],
    };

    return convertedWorkspace;
};
