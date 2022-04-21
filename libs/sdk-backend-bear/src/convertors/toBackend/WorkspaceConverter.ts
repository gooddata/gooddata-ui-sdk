// (C) 2019-2022 GoodData Corporation
import { GdcProject, GdcUser } from "@gooddata/api-model-bear";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions } from "@gooddata/sdk-model";

export const convertUserProject = ({ userProject }: GdcProject.IUserProject): IWorkspaceDescriptor => {
    const workspace: IWorkspaceDescriptor = {
        description: userProject.projectDescription,
        title: userProject.projectTitle,
        id: userProject.links.self.match(/\/gdc\/projects\/(.+)/i)![1],
    };

    if (userProject.demoProject) {
        workspace.isDemo = true;
    }

    return workspace;
};

export const convertPermissions = ({ permissions }: GdcUser.IProjectPermissions): IWorkspacePermissions => {
    const workspacePermissions = Object.keys(permissions).reduce(
        (acc: Partial<IWorkspacePermissions>, permission) => {
            const hasPermission = permissions[permission as GdcUser.ProjectPermission];
            // the cast is necessary here, otherwise the indexing does not work
            (acc as any)[permission] = hasPermission === "1";
            return acc;
        },
        {},
    );

    return workspacePermissions as IWorkspacePermissions;
};
