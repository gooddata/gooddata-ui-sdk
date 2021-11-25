// (C) 2021 GoodData Corporation
import React, { useCallback } from "react";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import { GranteeList } from "./GranteeList";
import { GranteeItem, IAddGranteeContentProps } from "./types";
import { AddGranteeSelect } from "./AddGranteeSelect";

/**
 * @internal
 */
export const AddGranteeContent: React.FC<IAddGranteeContentProps> = (props) => {
    const { appliedGrantees, addedGrantees, onDelete, onAddUserOrGroups } = props;

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
            <AddGranteeSelect appliedGrantees={appliedGrantees} onSelectGrantee={onSelectGrantee} />
            <GranteeList grantees={addedGrantees} mode={"AddGrantee"} onDelete={onDelete} />
        </>
    );
};
