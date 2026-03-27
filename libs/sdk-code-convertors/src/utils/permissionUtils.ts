// (C) 2024-2026 GoodData Corporation

import type { Dashboard } from "@gooddata/sdk-code-schemas/v1";

import { createIdentifier } from "./yamlUtils.js";

type GenericAssigneePermission = {
    name: string;
    assignee: {
        type: string;
        id: string;
    };
};

type GenericAssigneeRulePermission = {
    name: string;
    assigneeRule: {
        type: "allWorkspaceUsers";
    };
};

type GenericPermission = GenericAssigneePermission | GenericAssigneeRulePermission;

type Permissions = {
    [name: string]:
        | {
              all?: boolean;
              users?: string[];
              user_groups?: string[];
          }
        | undefined;
};

export const fromDeclarativePermissions = (
    permissions?: GenericPermission[],
    hierarchyPermissions?: GenericPermission[],
): Permissions | undefined => {
    if (!permissions && !hierarchyPermissions) return undefined;

    const result: Permissions = {};
    const self_suffix = hierarchyPermissions ? "_SELF" : "";

    permissions?.forEach(mapPermission(result, self_suffix));
    hierarchyPermissions?.forEach(mapPermission(result));

    return result;
};

const mapPermission =
    (result: Permissions, suffix: string = "") =>
    (permission: GenericPermission): void => {
        const name = permission.name + suffix;

        if (!result[name]) {
            result[name] = {};
        }

        if ("assigneeRule" in permission && permission.assigneeRule.type === "allWorkspaceUsers") {
            result[name]!.all = true;
            return;
        }

        if ("assignee" in permission) {
            if (permission.assignee.type === "user") {
                if (!result[name]!.users) {
                    result[name]!.users = [];
                }
                result[name]!.users!.push(permission.assignee.id);
            } else if (permission.assignee.type === "userGroup") {
                if (!result[name]!.user_groups) {
                    result[name]!.user_groups = [];
                }
                result[name]!.user_groups!.push(permission.assignee.id);
            }
        }
    };

export const toDeclarativePermissions = (
    permissions?: Dashboard["permissions"],
): [GenericPermission[], GenericPermission[]] => {
    const ownPermissions: GenericPermission[] = [];
    const hierarchicalPermissions: GenericPermission[] = [];

    if (!permissions) {
        return [ownPermissions, hierarchicalPermissions];
    }

    (Object.keys(permissions) as Array<keyof typeof permissions>).forEach((name) => {
        const permission = permissions[name];

        const targetOutput = name.endsWith("_SELF") ? ownPermissions : hierarchicalPermissions;
        const permissionName = name.replace(/_SELF$/, "");

        if (!permission) {
            return;
        }

        if (permission.all) {
            targetOutput.push({
                name: permissionName,
                assigneeRule: {
                    type: "allWorkspaceUsers",
                },
            });
        }

        if (permission.users) {
            permission.users.forEach((userId: string) => {
                const identifier = createIdentifier(userId, { forceType: "user" });
                if (identifier) {
                    targetOutput.push({
                        name: permissionName,
                        assignee: identifier.identifier,
                    });
                }
            });
        }

        if (permission.user_groups) {
            permission.user_groups.forEach((userGroupId: string) => {
                const identifier = createIdentifier(userGroupId, { forceType: "userGroup" });
                if (identifier) {
                    targetOutput.push({
                        name: permissionName,
                        assignee: identifier.identifier,
                    });
                }
            });
        }
    });

    return [ownPermissions, hierarchicalPermissions];
};
