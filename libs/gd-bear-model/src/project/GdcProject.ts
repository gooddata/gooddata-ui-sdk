// (C) 2019 GoodData Corporation
import { GdcPaging } from "../base/Paging";

/**
 * @public
 */
export namespace GdcProject {
    export type UserProjectState = "ENABLED" | "DISABLED";

    export interface IUserProject {
        projectState: UserProjectState;
        userState: UserProjectState;
        projectDescription: string;
        projectTitle: string;
        links: {
            self: string; // TODO use Uri type
        };
    }

    export interface IUserProjectsResponse {
        userProjects: {
            items: IUserProject[];
            paging: GdcPaging.IBearPagingWithTotalCount;
        };
    }
}
