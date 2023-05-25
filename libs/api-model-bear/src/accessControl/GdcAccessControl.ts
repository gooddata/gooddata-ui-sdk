// (C) 2021 GoodData Corporation
import { IUsersItem } from "../user/GdcUser.js";
import { IUserGroupItem } from "../userGroup/GdcUserGroup.js";

/**
 * @alpha
 */
export type Permission = "read";

/**
 * @alpha
 */
export interface IGranteeUserInfo {
    user: IUsersItem;
}

/**
 * @alpha
 */
export interface IGranteeUserGroupInfo {
    userGroup: IUserGroupItem;
}

/**
 * @alpha
 */
export interface IGranteeEntry {
    aclEntry: {
        permission: Permission;
        grantee: IGranteeUserInfo | IGranteeUserGroupInfo;
    };
}

/**
 * Request params for GET /gdc/userGroups?project=\{projectId\} /gdc/projects/\{projectId\}/obj/\{objectId\}/grantees
 * @alpha
 */
export interface IGetGranteesParams {
    permission?: Permission;
}

/**
 * Response for GET /gdc/userGroups?project=\{projectId\} /gdc/projects/\{projectId\}/obj/\{objectId\}/grantees
 * @alpha
 */
export interface IGetGranteesResponse {
    grantees: {
        items: IGranteeEntry[];
    };
}
