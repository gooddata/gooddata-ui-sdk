// (C) 2021-2023 GoodData Corporation
import React, { useCallback } from "react";
import { areObjRefsEqual, IGranteeGranularity } from "@gooddata/sdk-model";
import { GranteeList } from "./GranteeList.js";
import {
    GranteeItem,
    IAddGranteeContentProps,
    IGranularGranteeUser,
    IGranularGranteeGroup,
    isGranteeGroup,
    isGranteeUser,
    IGranteeUser,
    IGranteeGroup,
} from "./types.js";
import { AddGranteeSelect } from "./AddGranteeSelect.js";

/**
 * In case of user and group, we need to make sure, that the added grantee has some default granular permission.
 */
const enrichGranteeWithDefaultPermission = (
    grantee: IGranteeUser | IGranteeGroup,
): IGranularGranteeUser | IGranularGranteeGroup => {
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
        onDelete,
        onAddUserOrGroups,
        onGranularGranteeChange,
    } = props;

    const onSelectGrantee = useCallback(
        (grantee: GranteeItem) => {
            if (!appliedGrantees.some((g) => areObjRefsEqual(g.id, grantee.id))) {
                if (areGranularPermissionsSupported && (isGranteeUser(grantee) || isGranteeGroup(grantee))) {
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
            />
        </>
    );
};
