// (C) 2023 GoodData Corporation

import { AccessGranularPermission } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { CurrentUserPermissions } from "../../types";
import { IGranularPermissionTypeItem } from "../types";

export const getEffectivePermission = (
    permissions: AccessGranularPermission[],
    inheritedPermissions: AccessGranularPermission[],
    isDashboardLocked: boolean,
): AccessGranularPermission => {
    const allUserPermissions = [...permissions, ...inheritedPermissions];
    const allPermissionsSorted: AccessGranularPermission[] = ["EDIT", "SHARE", "VIEW"];

    const effectivePermission = allPermissionsSorted.find((permission) =>
        allUserPermissions.includes(permission),
    );

    invariant(effectivePermission, "Provided item permissions are incomplete or invalid");

    if (isDashboardLocked && effectivePermission === "EDIT") {
        return "SHARE";
    }

    return effectivePermission;
};

export const getPermissionTypeItems = (
    currentUserPermissions: CurrentUserPermissions,
    isDashboardLocked: boolean,
): IGranularPermissionTypeItem[] => {
    return [
        {
            id: "EDIT",
            disabled: !currentUserPermissions.canEditDashboard,
            hidden: isDashboardLocked,
        },
        {
            id: "SHARE",
            disabled: !currentUserPermissions.canShareDashboard,
            hidden: false,
        },
        {
            id: "VIEW",
            disabled: !currentUserPermissions.canViewDashboard,
            hidden: false,
        },
    ];
};
