// (C) 2007-2022 GoodData Corporation
import {
    IUserProjectsResponse,
    IProjectLcmIdentifiers,
    IProject,
    IGetUserListParams,
    IGetUserListResponse,
    IUserListItem,
    IAssociatedProjectPermissions,
    IGetUserGroupsParams,
    IGetUserGroupsResponse,
    IGetGranteesParams,
    IGetGranteesResponse,
} from "@gooddata/api-model-bear";

import { IColor, IColorPalette, IFeatureFlags, ITimezone } from "../interfaces.js";
import { ApiResponse } from "../xhr.js";
import { IProjectConfigSettingItem, IProjectModule, ProjectModule } from "../project.js";

export class ProjectModuleDecorator implements IProjectModule {
    private decorated: ProjectModule;

    constructor(decorated: ProjectModule) {
        this.decorated = decorated;
    }

    public getCurrentProjectId(): Promise<string> {
        return this.decorated.getCurrentProjectId();
    }

    public getProject(projectId: string): Promise<IProject> {
        return this.decorated.getProject(projectId);
    }

    public getProjects(profileId: string): Promise<IProject[]> {
        return this.decorated.getProjects(profileId);
    }

    public getProjectsWithPaging(
        userId: string,
        offset: number,
        limit: number,
        search?: string,
    ): Promise<IUserProjectsResponse> {
        return this.decorated.getProjectsWithPaging(userId, offset, limit, search);
    }

    public getDatasets(projectId: string) {
        return this.decorated.getDatasets(projectId);
    }

    public getColorPalette(projectId: string) {
        return this.decorated.getColorPalette(projectId);
    }

    public getColorPaletteWithGuids(projectId: string): Promise<IColorPalette | undefined> {
        return this.decorated.getColorPaletteWithGuids(projectId);
    }

    public setColorPalette(projectId: string, colors: IColor[]): Promise<ApiResponse> {
        return this.decorated.setColorPalette(projectId, colors);
    }

    public getTimezone(projectId: string): Promise<ITimezone> {
        return this.decorated.getTimezone(projectId);
    }

    public setTimezone(projectId: string, timezone: ITimezone) {
        return this.decorated.setTimezone(projectId, timezone);
    }

    public createProject(title: string, authorizationToken: string, options: any = {}) {
        return this.decorated.createProject(title, authorizationToken, options);
    }

    public deleteProject(projectId: string) {
        return this.decorated.deleteProject(projectId);
    }

    public getFeatureFlags(projectId: string): Promise<IFeatureFlags> {
        return this.decorated.getFeatureFlags(projectId);
    }

    public getConfig(projectId: string): Promise<IProjectConfigSettingItem[]> {
        return this.decorated.getConfig(projectId);
    }

    public getConfigItem(projectId: string, key: string): Promise<IProjectConfigSettingItem | undefined> {
        return this.decorated.getConfigItem(projectId, key);
    }

    public getProjectFeatureFlags(projectId: string, source?: string): Promise<IFeatureFlags> {
        return this.decorated.getProjectFeatureFlags(projectId, source);
    }

    public getUserListWithPaging(
        projectId: string,
        options: IGetUserListParams,
    ): Promise<IGetUserListResponse> {
        return this.decorated.getUserListWithPaging(projectId, options);
    }

    public getUserList(
        projectId: string,
        options: Omit<IGetUserListParams, "offset" | "limit">,
    ): Promise<IUserListItem[]> {
        return this.decorated.getUserList(projectId, options);
    }

    public getUserGroups(projectId: string, options: IGetUserGroupsParams): Promise<IGetUserGroupsResponse> {
        return this.decorated.getUserGroups(projectId, options);
    }

    public getGranteesInfo(objectUri: string, options: IGetGranteesParams): Promise<IGetGranteesResponse> {
        return this.decorated.getGranteesInfo(objectUri, options);
    }

    public addGrantees(objectUri: string, granteeUris: string[]): Promise<any> {
        return this.decorated.addGrantees(objectUri, granteeUris);
    }

    public removeGrantees(objectUri: string, granteeUris: string[] = []): Promise<any> {
        return this.decorated.removeGrantees(objectUri, granteeUris);
    }

    public getPermissions(workspaceId: string, userId: string): Promise<IAssociatedProjectPermissions> {
        return this.decorated.getPermissions(workspaceId, userId);
    }

    public getProjectLcmIdentifiers(
        domainId: string,
        projectId?: string,
        productId?: string,
        clientId?: string,
    ): Promise<IProjectLcmIdentifiers> {
        return this.decorated.getProjectLcmIdentifiers(domainId, projectId, productId, clientId);
    }
}
