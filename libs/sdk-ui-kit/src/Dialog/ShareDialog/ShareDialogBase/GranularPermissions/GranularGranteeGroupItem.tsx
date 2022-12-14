// (C) 2022 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { IDashboardPermissions } from "@gooddata/sdk-model";

import { GranteeGroupIcon } from "../GranteeIcons";
import { GranteeItem, IGranularGrantee } from "../types";
import { getGranteeLabel, getGranularGranteePermissionId } from "../utils";

import { GranularPermissionsDropdownBody } from "./GranularPermissionsDropdownBody";

interface IGranularGranteeGroupItemProps {
    grantee: IGranularGrantee;
    dashboardPermissions: IDashboardPermissions;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularGranteeGroupItem: React.FC<IGranularGranteeGroupItemProps> = (props) => {
    const { grantee, dashboardPermissions, onChange, onDelete } = props;
    const intl = useIntl();
    const groupName = useMemo(() => getGranteeLabel(grantee, intl), [grantee, intl]);
    const permissionId = useMemo(
        () => getGranularGranteePermissionId(grantee.permissions[0]),
        [grantee, intl],
    );

    return (
        <div className="gd-share-dialog-grantee-item">
            <GranularPermissionsDropdownBody
                dashboardPermissions={dashboardPermissions}
                grantee={grantee}
                value={intl.formatMessage({ id: permissionId })}
                onChange={onChange}
                onDelete={onDelete}
            />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{groupName}</div>
            </div>
            <GranteeGroupIcon />
        </div>
    );
};
