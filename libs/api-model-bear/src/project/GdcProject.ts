// (C) 2019-2022 GoodData Corporation
import { Uri } from "../aliases.js";
import { IBearPagingWithTotalCount } from "../base/GdcPaging.js";

/**
 * @public
 */
export type UserProjectState = "ENABLED" | "DISABLED";

/**
 * @public
 */
export interface IUserProject {
    userProject: {
        projectState: UserProjectState;
        userState: UserProjectState;
        projectDescription: string;
        projectTitle: string;
        links: {
            self: Uri;
        };
        demoProject?: boolean;
    };
}

/**
 * @public
 */
export interface IUserProjectsParams {
    limit: number;
    offset: number;
    userId: string;
    projectStates: "ENABLED";
    userState: "ENABLED";
    titleSubstring?: string;
}

/**
 * @public
 */
export interface IUserProjectsResponse {
    userProjects: {
        items: IUserProject[];
        paging: IBearPagingWithTotalCount;
    };
}

/**
 * @public
 */
export interface IProjectLcmIdentifiers {
    projectLcm: {
        projectId?: string;
        dataProductId?: string;
        clientId?: string;
        segmentId?: string;
    };
}

/**
 * @public
 */
export interface IProjectId {
    projectId: string;
}

/**
 * @public
 */
export interface ITimezone {
    timezone: {
        id: string;
        displayName: string;
        shortDisplayName: string;
        currentOffsetMs: number;
    };
}
