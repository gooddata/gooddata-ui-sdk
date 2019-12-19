// (C) 2019 GoodData Corporation
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
        };
    }

    export interface IUserProjectsResponse {
        userProjects: {
            items: IUserProject[];
            paging: GdcPaging.IBearPagingWithTotalCount;
        };
    }
}
