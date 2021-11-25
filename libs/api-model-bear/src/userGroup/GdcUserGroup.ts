// (C) 2021 GoodData Corporation
import { Timestamp, Uri } from "../aliases";

/**
 * @alpha
 */
export namespace GdcUserGroup {
    export interface IUserGroupItem {
        content: {
            name: string;
            id?: string | null;
            description?: string | null;
            domain?: Uri | null;
            project?: Uri | null;
        };
        links?: {
            self: Uri;
            members: Uri;
            modifyMembers: Uri;
        };
        meta: {
            created?: Timestamp;
            updated?: Timestamp;
        };
    }

    export interface IWrappedUserGroupItem {
        userGroup: IUserGroupItem;
    }
    /**
     * Request params for GET /gdc/userGroups?project=\{projectId\}
     */
    export interface IGetUserGroupsParams {
        /**
         * Sets starting point for the query.
         * DANGER: It is groupId of group which should be first in the result, not the numeric index.
         */
        offset?: string;
        /**
         * Sets number of items to return per page
         */
        limit?: number;
    }

    /**
     * Response for GET /gdc/userGroups?project=\{projectId\}
     */
    export interface IGetUserGroupsResponse {
        userGroups: {
            paging: {
                offset?: number | null;
                limit: number;
                next?: Uri | null;
            };
            items: IWrappedUserGroupItem[];
        };
    }
}
