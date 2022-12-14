// (C) 2022 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { IDashboardPermissions } from "@gooddata/sdk-model";

import { GranteeUserIcon } from "../GranteeIcons";

import { GranteeItem, IGranularGranteeUser } from "../types";
import { getGranteeLabel, getGranularGranteePermissionId } from "../utils";

import { GranularPermissionsDropdownBody } from "./GranularPermissionsDropdownBody";

interface IGranularGranteeUserItemProps {
    grantee: IGranularGranteeUser;
    dashboardPermissions: IDashboardPermissions;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularGranteeUserItem: React.FC<IGranularGranteeUserItemProps> = (props) => {
    const { grantee, dashboardPermissions, onChange, onDelete } = props;
    const intl = useIntl();
    const itemClassName = cx(
        { "s-share-dialog-current-user": grantee.isCurrentUser },
        "gd-share-dialog-grantee-item",
        "gd-share-dialog-granular-grantee-item",
    );

    const userName = getGranteeLabel(grantee, intl);
    const permissionId = useMemo(
        () => getGranularGranteePermissionId(grantee.permissions[0]),
        [grantee, intl],
    );

    return (
        <div className={itemClassName}>
            <GranularPermissionsDropdownBody
                dashboardPermissions={dashboardPermissions}
                grantee={grantee}
                value={intl.formatMessage({ id: permissionId })}
                onChange={onChange}
                onDelete={onDelete}
            />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{userName}</div>
                <div className="gd-grantee-content-label gd-grantee-content-email">{grantee.email}</div>
            </div>
            <GranteeUserIcon />
        </div>
    );
};
