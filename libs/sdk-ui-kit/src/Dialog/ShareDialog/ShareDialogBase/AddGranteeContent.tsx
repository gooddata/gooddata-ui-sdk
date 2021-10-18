// (C) 2021 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import { GranteeList } from "./GranteeList";
import { GranteeItem, IAddGranteeContentProps, ISelectOption } from "./types";
import { getGranteeLabel } from "./utils";
import { AddGranteeSelect } from "./AddGranteeSelect";

/**
 * @internal
 */
export const AddGranteeContent: React.FC<IAddGranteeContentProps> = (props) => {
    const { availableGrantees, addedGrantees, onDelete, onAddUserOrGroups } = props;
    const intl = useIntl();

    const granteesOption = useMemo(() => {
        return availableGrantees.map((grantee: GranteeItem): ISelectOption => {
            return {
                label: getGranteeLabel(grantee, intl),
                value: grantee,
            };
        });
    }, [availableGrantees, intl]);

    const onSelectGrantee = useCallback(
        (grantee: GranteeItem) => {
            if (!addedGrantees.some((g) => areObjRefsEqual(g.id, grantee.id))) {
                onAddUserOrGroups(grantee);
            }
        },
        [addedGrantees, onAddUserOrGroups],
    );

    return (
        <>
            <AddGranteeSelect granteesOption={granteesOption} onSelectGrantee={onSelectGrantee} />
            <GranteeList grantees={addedGrantees} mode={"AddGrantee"} onDelete={onDelete} />
        </>
    );
};
