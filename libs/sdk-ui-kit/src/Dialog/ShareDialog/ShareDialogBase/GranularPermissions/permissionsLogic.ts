// (C) 2023 GoodData Corporation

import { AccessGranularPermission } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

export const getEffectivePermission = (
    permissions: AccessGranularPermission[],
    inheritedPermissions: AccessGranularPermission[],
): AccessGranularPermission => {
    const allUserPermissions = [...permissions, ...inheritedPermissions];
    const allPermissionsSorted: AccessGranularPermission[] = ["EDIT", "SHARE", "VIEW"];

    const effectivePermission = allPermissionsSorted.find((permission) =>
        allUserPermissions.includes(permission),
    );

    invariant(effectivePermission, "Provided item permissions are incomplete or invalid");

    return effectivePermission;
};
