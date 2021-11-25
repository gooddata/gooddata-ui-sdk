// (C) 2021 GoodData Corporation
import { GdcUser } from "../user/GdcUser";
import { GdcUserGroup } from "../userGroup/GdcUserGroup";

/**
 * @alpha
 */
export namespace GdcAccessControl {
    export type Permission = "read";

    export interface IGranteeUserInfo {
        user: GdcUser.IUsersItem;
    }

    export interface IGranteeUserGroupInfo {
        userGroup: GdcUserGroup.IUserGroupItem;
    }
    export interface IGranteeEntry {
        aclEntry: {
            permission: Permission;
            grantee: IGranteeUserInfo | IGranteeUserGroupInfo;
        };
    }
    /**
     * Request params for GET /gdc/userGroups?project=\{projectId\} /gdc/projects/\{projectId\}/obj/\{objectId\}/grantees
     */
    export interface IGetGranteesParams {
        permission?: Permission;
    }

    /**
     * Response for GET /gdc/userGroups?project=\{projectId\} /gdc/projects/\{projectId\}/obj/\{objectId\}/grantees
     */
    export interface IGetGranteesResponse {
        grantees: {
            items: IGranteeEntry[];
        };
    }
}
