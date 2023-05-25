// (C) 2007-2022 GoodData Corporation
import { invariant } from "ts-invariant";
import { GdcProject, GdcUser, GdcUserGroup, GdcAccessControl } from "@gooddata/api-model-bear";

import { getAllPagesByOffsetLimit, getQueryEntries, handlePolling, parseSettingItemValue } from "./util.js";
import { IColor, IColorPalette, IFeatureFlags, ITimezone } from "./interfaces.js";
import { IFeatureFlagsResponse, IStyleSettingsResponse } from "./apiResponsesInterfaces.js";
import { ApiError, ApiResponse, XhrModule } from "./xhr.js";
import { stringify } from "./utils/queryString.js";

export const DEFAULT_PALETTE = [
    { r: 0x2b, g: 0x6b, b: 0xae },
    { r: 0x69, g: 0xaa, b: 0x51 },
    { r: 0xee, g: 0xb1, b: 0x4c },
    { r: 0xd5, g: 0x3c, b: 0x38 },
    { r: 0x89, g: 0x4d, b: 0x94 },
    { r: 0x73, g: 0x73, b: 0x73 },
    { r: 0x44, g: 0xa9, b: 0xbe },
    { r: 0x96, g: 0xbd, b: 0x5f },
    { r: 0xfd, g: 0x93, b: 0x69 },
    { r: 0xe1, g: 0x5d, b: 0x86 },
    { r: 0x7c, g: 0x6f, b: 0xad },
    { r: 0xa5, g: 0xa5, b: 0xa5 },
    { r: 0x7a, g: 0xa6, b: 0xd5 },
    { r: 0x82, g: 0xd0, b: 0x8d },
    { r: 0xff, g: 0xd2, b: 0x89 },
    { r: 0xf1, g: 0x84, b: 0x80 },
    { r: 0xbf, g: 0x90, b: 0xc6 },
    { r: 0xbf, g: 0xbf, b: 0xbf },
];

const isProjectCreated = (project: any) => {
    // TODO
    const projectState = project.content.state;

    return projectState === "ENABLED" || projectState === "DELETED";
};

export interface IProjectConfigSettingItem {
    settingItem: {
        key: string;
        links: {
            self: string;
        };
        source: string;
        value: string;
    };
}
export interface IProjectConfigResponse {
    settings: {
        items: IProjectConfigSettingItem[];
    };
}

interface IProjectLcmEntityResponse {
    projectUri: string;
    projectId: string;
    projectTitle: string;
    clientId: string;
    segmentId: string;
    dataProductId: string;
    domainId: string;
}

interface IClientResponse {
    client: {
        id: string;
        segment: string;
        project: string;
        links: {
            self: string;
            domain: string;
            dataProduct: string;
        };
    };
}

/**
 * Functions for working with projects
 *
 */
export class ProjectModule {
    constructor(private xhr: XhrModule) {}

    /**
     * Get current project id
     *
     * @returns current project identifier
     */
    public getCurrentProjectId(): Promise<string> {
        return this.xhr
            .getParsed<GdcProject.IProjectId>("/gdc/app/account/bootstrap/projectId")
            .then((response) => response.projectId);
    }

    /**
     * Fetches project by its identifier.
     *
     * @param projectId - Project identifier
     * @returns Project
     */
    public getProject(projectId: string): Promise<GdcUser.IProject> {
        return this.xhr.getParsed(`/gdc/projects/${projectId}`);
    }

    /**
     * Fetches projects available for the user represented by the given profileId
     *
     * @param profileId - User profile identifier
     * @returns An Array of projects
     */
    public getProjects(profileId: string): Promise<GdcUser.IProject[]> {
        return getAllPagesByOffsetLimit(
            this.xhr,
            `/gdc/account/profile/${profileId}/projects`,
            "projects",
        ).then((result: any) => result.map((p: any) => p.project));
    }

    /**
     * Fetches projects available for the user represented by the given profileId page by page.
     * @param userId - id of the user to get the projects for
     * @param offset - number of items to skip
     * @param limit - maximum items on page
     * @param search - search string that is matched to project title as a substring
     */
    public getProjectsWithPaging(
        userId: string,
        offset: number,
        limit: number,
        search?: string,
    ): Promise<GdcProject.IUserProjectsResponse> {
        // inspired by ProjectDataSource in goodstrap. Maybe the /gdc/account/profile/${profileId}/projects would be suitable as well.
        const mergedOptions: GdcProject.IUserProjectsParams = {
            limit,
            offset,
            userId,
            projectStates: "ENABLED",
            userState: "ENABLED",
        };
        if (search) {
            mergedOptions.titleSubstring = search;
        }

        const uri = `/gdc/internal/projects/?${stringify(mergedOptions)}`;
        return this.xhr.get(uri).then((res) => res.getData());
    }

    /**
     * Fetches all datasets for the given project
     *
     * @param projectId - GD project identifier
     * @returns An array of objects containing datasets metadata
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public getDatasets(projectId: string) {
        return this.xhr
            .get(`/gdc/md/${projectId}/query/datasets`)
            .then((r) => r.getData())
            .then(getQueryEntries);
    }

    /**
     * Fetches a chart color palette for a project represented by the given
     * projectId parameter.
     *
     * @param projectId - A project identifier
     * @returns An array of objects with r, g, b fields representing a project's
     * color palette
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public getColorPalette(projectId: string) {
        return this.xhr
            .get(`/gdc/projects/${projectId}/styleSettings`)
            .then((apiResponse: ApiResponse): IStyleSettingsResponse => {
                return apiResponse.getData();
            })
            .then((result: IStyleSettingsResponse) => {
                if (!result) {
                    return DEFAULT_PALETTE;
                }

                return result.styleSettings.chartPalette.map((c: any) => {
                    return {
                        r: c.fill.r,
                        g: c.fill.g,
                        b: c.fill.b,
                    };
                });
            })
            .catch((e) => {
                if (!(e instanceof ApiError)) {
                    return DEFAULT_PALETTE;
                }

                throw e;
            });
    }

    /**
     * Fetches a chart color palette for a project represented by the given
     * projectId parameter.
     *
     * @param projectId - A project identifier
     * @returns An array of objects representing a project's
     * color palette with color guid or undefined
     */
    public getColorPaletteWithGuids(projectId: string): Promise<IColorPalette | undefined> {
        return this.xhr
            .get(`/gdc/projects/${projectId}/styleSettings`)
            .then((apiResponse: ApiResponse): IStyleSettingsResponse => {
                return apiResponse.getData();
            })
            .then((result: IStyleSettingsResponse) => {
                if (result?.styleSettings) {
                    return result.styleSettings.chartPalette;
                } else {
                    return undefined;
                }
            })
            .catch((e) => {
                if (!(e instanceof ApiError)) {
                    return undefined;
                }

                throw e;
            });
    }

    /**
     * Sets given colors as a color palette for a given project.
     *
     * @param projectId - GD project identifier
     * @param colors - An array of colors that we want to use within the project.
     * Each color should be an object with r, g, b fields. // TODO really object?
     */
    public setColorPalette(projectId: string, colors: IColor[]): Promise<ApiResponse> {
        return this.xhr.put(`/gdc/projects/${projectId}/styleSettings`, {
            body: {
                styleSettings: {
                    chartPalette: colors.map((fill, idx: number) => {
                        return { fill, guid: `guid${idx}` };
                    }),
                },
            },
        });
    }

    /**
     * Gets current timezone and its offset.
     * @example
     *
     * Example output:
     *
     * ```
     * {
     *     id: 'Europe/Prague',
     *     displayName: 'Central European Time',
     *     currentOffsetMs: 3600000
     * }
     * ```
     *
     * @param projectId - GD project identifier
     */
    public getTimezone(projectId: string): Promise<ITimezone> {
        const uri = `/gdc/app/projects/${projectId}/timezone`;
        return this.xhr.getParsed<GdcProject.ITimezone>(uri).then((result) => result.timezone);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public setTimezone(projectId: string, timezone: ITimezone) {
        const timezoneServiceUrl = `/gdc/md/${projectId}/service/timezone`;
        const data = {
            service: { timezone },
        };

        return this.xhr
            .post(timezoneServiceUrl, {
                body: data,
            })
            .then((r) => r.getData());
    }

    /**
     * Create project
     * Note: returns a promise which is resolved when the project creation is finished
     *
     * @experimental
     * @param title - title of the new project
     * @param authorizationToken - authorization token to use
     * @param options - for project creation (summary, projectTemplate, ...)
     * @returns created project object
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public createProject(title: string, authorizationToken: string, options: any = {}) {
        const {
            summary,
            projectTemplate,
            driver = "Pg",
            environment = "TESTING",
            guidedNavigation = 1,
        } = options;

        return this.xhr
            .post("/gdc/projects", {
                body: JSON.stringify({
                    project: {
                        content: {
                            guidedNavigation,
                            driver,
                            authorizationToken,
                            environment,
                        },
                        meta: {
                            title,
                            summary,
                            projectTemplate,
                        },
                    },
                }),
            })
            .then((r) => r.getData())
            .then((project: any) =>
                handlePolling(
                    this.xhr.get.bind(this.xhr),
                    project.uri,
                    (response: any) => {
                        // TODO project response
                        return isProjectCreated(response.project);
                    },
                    options,
                ),
            );
    }

    /**
     * Delete project
     *
     * @param projectId - projectId to delete
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public deleteProject(projectId: string) {
        return this.xhr.del(`/gdc/projects/${projectId}`);
    }

    /**
     * Gets aggregated feature flags for given project and current user
     *
     * @param projectId - A project identifier
     * @returns Hash table of feature flags and theirs values where feature flag is as key
     */
    public getFeatureFlags(projectId: string): Promise<IFeatureFlags> {
        return this.xhr
            .get(`/gdc/app/projects/${projectId}/featureFlags`)
            .then((apiResponse: ApiResponse) => {
                return apiResponse.getData();
            })
            .then((result: IFeatureFlagsResponse) => {
                if (result?.featureFlags) {
                    return result.featureFlags;
                }
                return {};
            });
    }

    /**
     * Gets project config including project specific feature flags
     *
     * @param projectId - A project identifier
     * @returns An array of project config setting items
     */
    public getConfig(projectId: string): Promise<IProjectConfigSettingItem[]> {
        return this.xhr
            .get(`/gdc/app/projects/${projectId}/config`)
            .then((apiResponse: ApiResponse) => {
                return apiResponse.getData();
            })
            .then((result: IProjectConfigResponse) => {
                if (result?.settings?.items) {
                    return result.settings.items;
                }
                return [];
            });
    }

    /**
     * Gets project config including project specific feature flags
     *
     * @param projectId - A project identifier
     * @param key - config item key
     * @returns single setting item or undefined if item with such key does not exist
     */
    public getConfigItem(projectId: string, key: string): Promise<IProjectConfigSettingItem | undefined> {
        return this.xhr
            .get(`/gdc/app/projects/${projectId}/config/${key}`)
            .then((apiResponse: ApiResponse) => {
                return apiResponse.getData();
            })
            .catch((error: any) => {
                if (error?.response?.status === 404) {
                    return undefined;
                }

                throw error;
            });
    }

    /**
     * Gets project specific feature flags
     *
     * @param projectId - A project identifier
     * @param source - optional filter settingItems with specific source
     * @returns Hash table of feature flags and theirs values where feature flag is as key
     */
    public getProjectFeatureFlags(projectId: string, source?: string): Promise<IFeatureFlags> {
        return this.getConfig(projectId).then((settingItems: IProjectConfigSettingItem[]) => {
            const filteredSettingItems = source
                ? settingItems.filter((settingItem) => settingItem.settingItem.source === source)
                : settingItems;
            const featureFlags: IFeatureFlags = {};
            filteredSettingItems.forEach((settingItem) => {
                featureFlags[settingItem.settingItem.key] = parseSettingItemValue(
                    settingItem.settingItem.value,
                );
            });
            return featureFlags;
        });
    }

    /**
     * Get paged user list
     *
     * @param projectId - project identifier
     * @param options - filtering options for the user list
     * @returns List of users with paging
     */
    public getUserListWithPaging(
        projectId: string,
        options: GdcUser.IGetUserListParams,
    ): Promise<GdcUser.IGetUserListResponse> {
        return this.xhr.getParsed<GdcUser.IGetUserListResponse>(`/gdc/projects/${projectId}/userlist`, {
            data: options,
        });
    }

    /**
     * Get full user list
     *
     * @param projectId - project identifier
     * @param options - filtering options for the user list
     * @returns List of users
     */
    public getUserList(
        projectId: string,
        options: Omit<GdcUser.IGetUserListParams, "offset" | "limit">,
    ): Promise<GdcUser.IUserListItem[]> {
        const loadPage = async (
            offset = 0,
            limit = 1000,
            items: GdcUser.IUserListItem[] = [],
        ): Promise<GdcUser.IUserListItem[]> => {
            return this.getUserListWithPaging(projectId, { ...options, limit, offset }).then(
                ({
                    userList: {
                        items: userItems,
                        paging: { count },
                    },
                }) => {
                    const updatedItems = [...items, ...userItems];
                    return count < limit ? updatedItems : loadPage(offset + limit, limit, updatedItems);
                },
            );
        };

        return loadPage();
    }

    /**
     * Get paged user groups
     *
     * @param projectId - project identifier
     * @param options - paging params
     * @returns List of user groups with paging
     */
    public getUserGroups(
        projectId: string,
        options: GdcUserGroup.IGetUserGroupsParams,
    ): Promise<GdcUserGroup.IGetUserGroupsResponse> {
        const { offset = "0", limit = 100 } = options;

        return this.xhr.getParsed<GdcUserGroup.IGetUserGroupsResponse>(
            `/gdc/userGroups?project=${projectId}&offset=${offset}&limit=${limit}`,
        );
    }

    /**
     * Get info about all grantees able to access given object
     *
     * @param objectUri - object's uri
     * @param options - grantee limitations params
     * @returns List of all grantees
     */
    public getGranteesInfo(
        objectUri: string,
        options: GdcAccessControl.IGetGranteesParams,
    ): Promise<GdcAccessControl.IGetGranteesResponse> {
        const { permission = "read" } = options;
        const apiUri = objectUri.replace("/md/", "/projects/");
        return this.xhr.getParsed<GdcAccessControl.IGetGranteesResponse>(
            `${apiUri}/grantees?permission=${permission}`,
        );
    }

    private convertGrantees(granteeUris: string[] = []) {
        return granteeUris.map((granteeUri) => ({
            aclEntryURI: {
                permission: "read",
                grantee: granteeUri,
            },
        }));
    }

    private handleGranteesChangeError(error: any) {
        if (error?.response?.status !== 200) {
            throw error;
        }
    }

    /**
     * Add grantees to access given object
     * @param objectUri - object's uri
     * @param granteeUris - grantees uri array
     */
    public addGrantees(objectUri: string, granteeUris: string[]): Promise<any> {
        const addGranteesRequest = {
            granteeURIs: {
                items: this.convertGrantees(granteeUris),
            },
        };
        return this.xhr
            .post(`${objectUri}/grantees/add`, { body: { ...addGranteesRequest } })
            .catch(this.handleGranteesChangeError);
    }

    /**
     * Remove grantees access given object
     * @param objectUri - object's uri
     * @param granteeUris - grantees uri array
     */
    public removeGrantees(objectUri: string, granteeUris: string[] = []): Promise<any> {
        const removeGranteesRequest = {
            granteeURIs: {
                items: this.convertGrantees(granteeUris),
            },
        };

        return this.xhr
            .post(`${objectUri}/grantees/remove`, { body: { ...removeGranteesRequest } })
            .catch(this.handleGranteesChangeError);
    }

    /**
     * Get permissions for the workspace and user
     * @param workspaceId - ID of the workspace
     * @param userId - ID of the user
     */
    public getPermissions(
        workspaceId: string,
        userId: string,
    ): Promise<GdcUser.IAssociatedProjectPermissions> {
        return this.xhr.getParsed<GdcUser.IAssociatedProjectPermissions>(
            `/gdc/projects/${workspaceId}/users/${userId}/permissions`,
        );
    }

    /**
     * Resolves LCM workspace identifiers. This function will use the data product and client information
     * and consult the backend in order to obtain identifier of workspace contains analytics for that
     * data product & client combination.
     *
     * Domain parameter is required. Then either project ID or product ID and client ID pair must be provided.
     *
     * @param domainId - ID of the domain, must be provided
     * @param projectId - ID of the project. LCM identifiers will be fetched via project ID if the
     *  ID is provided.
     * @param productId - ID of the product. LCM identifiers will be provided by product ID and client ID
     *  pair, if project ID is not provided.
     * @param clientId - ID of the client. LCM identifiers will be provided by product ID and client ID pair,
     *  if project ID is not provided.
     *
     * @returns Resolves with project LCM identifiers.
     */
    public getProjectLcmIdentifiers(
        domainId: string,
        projectId?: string,
        productId?: string,
        clientId?: string,
    ): Promise<GdcProject.IProjectLcmIdentifiers> {
        invariant(domainId, "domain ID must be specified");

        if (projectId) {
            return this.xhr
                .getParsed<IProjectLcmEntityResponse>(`/gdc/projects/${projectId}/lcmEntity`)
                .then(({ projectUri, clientId, dataProductId, segmentId }) => ({
                    projectLcm: {
                        projectId: this.extractIdFromUri(projectUri),
                        clientId,
                        dataProductId,
                        segmentId,
                    },
                }));
        }

        invariant(productId, "product ID must be specified when project ID is not provided");
        invariant(clientId, "client ID must be specified when project ID is not provided");

        return this.xhr
            .getParsed<IClientResponse>(
                `/gdc/domains/${domainId}/dataproducts/${productId}/clients/${clientId}`,
            )
            .then(({ client: { id, project, segment, links } }) => ({
                projectLcm: {
                    projectId: this.extractIdFromUri(project),
                    clientId: id,
                    dataProductId: this.extractIdFromUri(links?.dataProduct),
                    segmentId: this.extractIdFromUri(segment),
                },
            }));
    }

    private extractIdFromUri(uri?: string) {
        return uri?.split("/").pop();
    }
}
