// (C) 2021 GoodData Corporation
import { GdcAccessControl } from "@gooddata/api-model-bear";

import { convertWorkspaceUserGroup } from "./UserGroupsConverter";
import { convertUsersItem } from "./UsersConverter";
import { AccessGranteeDetail } from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";

function isGranteeUserInfo(
    grantee: GdcAccessControl.IGranteeUserInfo | GdcAccessControl.IGranteeUserGroupInfo,
): grantee is GdcAccessControl.IGranteeUserInfo {
    return !isEmpty(grantee) && (grantee as GdcAccessControl.IGranteeUserInfo).user !== undefined;
}

export const convertGranteeEntry = (item: GdcAccessControl.IGranteeEntry): AccessGranteeDetail => {
    if (isGranteeUserInfo(item.aclEntry.grantee)) {
        return {
            type: "user",
            user: convertUsersItem(item.aclEntry.grantee.user),
        };
    } else {
        return {
            type: "group",
            userGroup: convertWorkspaceUserGroup(item.aclEntry.grantee.userGroup),
        };
    }
};
