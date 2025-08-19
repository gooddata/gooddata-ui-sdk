// (C) 2021-2025 GoodData Corporation
import React, { useCallback } from "react";

import { IGranteeGranularity, areObjRefsEqual } from "@gooddata/sdk-model";

import { AddGranteeSelect } from "./AddGranteeSelect.js";
import { GranteeList } from "./GranteeList.js";
import {
    GranteeItem,
    IAddGranteeContentProps,
    IGranteeGroup,
    IGranteeRules,
    IGranteeUser,
    IGranularGranteeGroup,
    IGranularGranteeUser,
    isGranteeGroup,
    isGranteeRules,
    isGranteeUser,
} from "./types.js";

/**
 * In case of user and group, we need to make sure, that the added grantee has some default granular permission.
 */
const enrichGranteeWithDefaultPermission = (
    grantee: IGranteeUser | IGranteeGroup | IGranteeRules,
): IGranularGranteeUser | IGranularGranteeGroup | IGranteeRules => {
    const defaultPermissions: IGranteeGranularity = {
        permissions: ["VIEW"],
        inheritedPermissions: [],
    };

    if (isGranteeUser(grantee)) {
        return {
            ...grantee,
            ...defaultPermissions,
            type: "granularUser",
        };
    } else if (isGranteeRules(grantee)) {
        return {
            ...grantee,
            ...defaultPermissions,
            type: "allWorkspaceUsers",
        };
    } else {
        return {
            ...grantee,
            ...defaultPermissions,
            type: "granularGroup",
        };
    }
};

/**
 * @internal
 */
export const AddGranteeContent: React.FC<IAddGranteeContentProps> = (props) => {
    const {
        appliedGrantees,
        currentUser,
        addedGrantees,
        areGranularPermissionsSupported,
        currentUserPermissions,
        isSharedObjectLocked,
        sharedObjectRef,
        isGranteeShareLoading,
        onDelete,
        onAddUserOrGroups,
        onGranularGranteeChange,
    } = props;

    const onSelectGrantee = useCallback(
        (grantee: GranteeItem) => {
            if (!appliedGrantees.some((g) => areObjRefsEqual(g.id, grantee.id))) {
                const isGranularGrantee =
                    areGranularPermissionsSupported &&
                    (isGranteeUser(grantee) || isGranteeGroup(grantee) || isGranteeRules(grantee));

                if (isGranularGrantee) {
                    onAddUserOrGroups(enrichGranteeWithDefaultPermission(grantee));
                } else {
                    onAddUserOrGroups(grantee);
                }
            }
        },
        [appliedGrantees, onAddUserOrGroups, areGranularPermissionsSupported],
    );

    return (
        <>
            <AddGranteeSelect
                currentUser={currentUser}
                appliedGrantees={appliedGrantees}
                sharedObjectRef={sharedObjectRef}
                onSelectGrantee={onSelectGrantee}
            />
            <GranteeList
                currentUserPermissions={currentUserPermissions}
                isSharedObjectLocked={isSharedObjectLocked}
                grantees={addedGrantees}
                mode={"AddGrantee"}
                areGranularPermissionsSupported={areGranularPermissionsSupported}
                onDelete={onDelete}
                onChange={onGranularGranteeChange}
                isGranteeShareLoading={isGranteeShareLoading}
            />
        </>
    );
};
