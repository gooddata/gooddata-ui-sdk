// (C) 2019-2022 GoodData Corporation
import { GdcPaging } from "../base/GdcPaging";
import { Uri } from "../aliases";

/**
 * @public
 */
export namespace GdcProject {
    export type UserProjectState = "ENABLED" | "DISABLED";

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

    export interface IUserProjectsParams {
        limit: number;
        offset: number;
        userId: string;
        projectStates: "ENABLED";
        userState: "ENABLED";
        titleSubstring?: string;
    }

    export interface IUserProjectsResponse {
        userProjects: {
            items: IUserProject[];
            paging: GdcPaging.IBearPagingWithTotalCount;
        };
    }

    export interface IProjectLcmIdentifiers {
        projectLcm: {
            projectId?: string;
            dataProductId?: string;
            clientId?: string;
            segmentId?: string;
        };
    }

    export interface IProjectId {
        projectId: string;
    }

    export interface ITimezone {
        timezone: {
            id: string;
            displayName: string;
            shortDisplayName: string;
            currentOffsetMs: number;
        };
    }
}
