// (C) 2023 GoodData Corporation

import { AccessGranularPermission } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { CurrentUserPermissions } from "../../types";
import {
    IGranteePermissionsPossibilities,
    IGranteePermissionsPossibility,
    IGranularGrantee,
    IGranularPermissionTypeItem,
    isGranularGranteeUser,
} from "../types";
import { granularPermissionMessageTooltips } from "../../../../locales";

const allPermissionsSorted: AccessGranularPermission[] = ["EDIT", "SHARE", "VIEW"];

export const getEffectivePermission = (
    permissions: AccessGranularPermission[],
    inheritedPermissions: AccessGranularPermission[],
    isDashboardLocked: boolean,
): AccessGranularPermission => {
    const allUserPermissions = [...permissions, ...inheritedPermissions];

    const effectivePermission = allPermissionsSorted.find((permission) =>
        allUserPermissions.includes(permission),
    );

    invariant(effectivePermission, "Provided item permissions are incomplete or invalid");

    if (isDashboardLocked && effectivePermission === "EDIT") {
        return "SHARE";
    }

    return effectivePermission;
};

const disableWithTooltip = (possibility: IGranteePermissionsPossibility, tooltip: string) => {
    possibility.enabled = false;
    possibility.tooltip = tooltip;
};

const getPermissionTypeItems = (
    grantee: IGranularGrantee,
    currentUserPermissions: CurrentUserPermissions,
    isDashboardLocked: boolean,
): IGranularPermissionTypeItem[] => {
    return allPermissionsSorted.map<IGranularPermissionTypeItem>((permission, permissionIndex) => {
        const item: IGranularPermissionTypeItem = {
            id: permission,
            enabled: true,
            tooltip: "",
            hidden: false,
        };

        // don't allow setting permissions higher that the current user
        if (
            (permission === "EDIT" && !currentUserPermissions.canEditDashboard) ||
            (permission === "SHARE" && !currentUserPermissions.canShareDashboard) ||
            !currentUserPermissions.canViewDashboard
        ) {
            disableWithTooltip(item, "shareDialog.share.granular.grantee.tooltip.cannotGrantHigher");
        }

        // hide Edit & share on inherited dashboards
        if (permission === "EDIT" && isDashboardLocked) {
            item.hidden = true;
        }

        // don't allow setting permission lower that permission obtained indirectly
        grantee.inheritedPermissions.forEach((inheritedPermission) => {
            const inheritedPermissionIndex = allPermissionsSorted.indexOf(inheritedPermission);
            if (permissionIndex > inheritedPermissionIndex) {
                disableWithTooltip(
                    item,
                    isGranularGranteeUser(grantee)
                        ? "shareDialog.share.granular.grantee.tooltip.cannotGrantLowerForUser"
                        : "shareDialog.share.granular.grantee.tooltip.cannotGrantLowerForGroup",
                );
            }
        });

        return item;
    });
};

export const getGranteePossibilities = (
    grantee: IGranularGrantee,
    currentUserPermissions: CurrentUserPermissions,
    isDashboardLocked: boolean,
): IGranteePermissionsPossibilities => {
    const granteeEffectivePermission = getEffectivePermission(
        grantee.permissions,
        grantee.inheritedPermissions,
        isDashboardLocked,
    );

    // the "Remove" option state
    const remove: IGranteePermissionsPossibility = {
        enabled: true,
        tooltip: "",
    };

    // state of the whole permissions selection dropdown
    const change: IGranteePermissionsPossibility = {
        enabled: true,
        tooltip: "",
    };

    //state of the permissions selection dropdown items
    const permissionTypeItems = getPermissionTypeItems(grantee, currentUserPermissions, isDashboardLocked);

    // cannot change or remove permissions of a grantee that has higher permission than the current user
    if (
        (granteeEffectivePermission === "EDIT" && !currentUserPermissions.canEditDashboard) ||
        (granteeEffectivePermission === "SHARE" && !currentUserPermissions.canShareDashboard)
    ) {
        disableWithTooltip(change, granularPermissionMessageTooltips.cannotChangeHigher.id);
        disableWithTooltip(remove, granularPermissionMessageTooltips.cannotChangeHigher.id);
    }

    // cannot remove permission that is defined on the dashboard in parent workspace
    if (grantee.permissions.length === 0 && grantee.inheritedPermissions.length !== 0) {
        disableWithTooltip(remove, granularPermissionMessageTooltips.cannotRemoveFromParent.id);
    }

    // disable all permissions change if all assignment options are disabled and also the Remove option is disabled
    if (
        change.enabled &&
        !remove.enabled &&
        permissionTypeItems.every(
            (item) => !item.enabled || item.hidden || item.id === granteeEffectivePermission,
        )
    ) {
        disableWithTooltip(change, granularPermissionMessageTooltips.noChangeAvailable.id);
    }

    return {
        remove,
        assign: {
            items: permissionTypeItems,
            effective: granteeEffectivePermission,
        },
        change,
    };
};
