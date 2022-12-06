// (C) 2022 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { GranteeUserIcon } from "../GranteeIcons";

import { GranteeItem, IGranularGranteeUser } from "../types";
import { getGranteeLabel } from "../utils";

import { GranularPermissionsDropdownBody } from "./GranularPermissionsDropdownBody";

interface IGranularGranteeUserItemProps {
    grantee: IGranularGranteeUser;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularGranteeUserItem: React.FC<IGranularGranteeUserItemProps> = (props) => {
    const { grantee, onChange, onDelete } = props;
    const intl = useIntl();
    const itemClassName = cx(
        { "s-share-dialog-current-user": grantee.isCurrentUser },
        "gd-share-dialog-grantee-item",
        "gd-share-dialog-granular-grantee-item",
    );

    const userName = getGranteeLabel(grantee, intl);

    return (
        <div className={itemClassName}>
            <GranularPermissionsDropdownBody
                grantee={grantee}
                // TODO: Update with selected permission
                value={intl.formatMessage({ id: "shareDialog.share.granular.grantee.permission.edit" })}
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
