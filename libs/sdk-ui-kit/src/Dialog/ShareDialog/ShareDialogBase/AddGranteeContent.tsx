// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import { GranteeList } from "./GranteeList";
import { GranteeItem, IAddGranteeContentProps } from "./types";
import { AddGranteeSelect } from "./AddGranteeSelect";

/**
 * @internal
 */
export const AddGranteeContent: React.FC<IAddGranteeContentProps> = (props) => {
    const {
        appliedGrantees,
        currentUserRef,
        addedGrantees,
        areGranularPermissionsSupported,
        dashboardPermissions,
        sharedObjectRef,
        onDelete,
        onAddUserOrGroups,
    } = props;

    const onSelectGrantee = useCallback(
        (grantee: GranteeItem) => {
            if (!appliedGrantees.some((g) => areObjRefsEqual(g.id, grantee.id))) {
                onAddUserOrGroups(grantee);
            }
        },
        [appliedGrantees, onAddUserOrGroups],
    );

    return (
        <>
            <AddGranteeSelect
                currentUserRef={currentUserRef}
                appliedGrantees={appliedGrantees}
                sharedObjectRef={sharedObjectRef}
                onSelectGrantee={onSelectGrantee}
            />
            <GranteeList
                dashboardPermissions={dashboardPermissions}
                grantees={addedGrantees}
                mode={"AddGrantee"}
                areGranularPermissionsSupported={areGranularPermissionsSupported}
                onDelete={onDelete}
            />
        </>
    );
};
