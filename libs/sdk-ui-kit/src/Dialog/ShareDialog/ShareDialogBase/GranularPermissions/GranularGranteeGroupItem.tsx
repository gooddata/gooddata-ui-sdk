// (C) 2022 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { GranteeGroupIcon } from "../GranteeIcons";
import { GranteeItem, IGranularGranteeGroup } from "../types";
import { getGranteeLabel } from "../utils";

import { GranularPermissionsDropdownBody } from "./GranularPermissionsDropdownBody";

interface IGranularGranteeGroupItemProps {
    grantee: IGranularGranteeGroup;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularGranteeGroupItem: React.FC<IGranularGranteeGroupItemProps> = (props) => {
    const { grantee, onChange, onDelete } = props;
    const intl = useIntl();
    const groupName = useMemo(() => getGranteeLabel(grantee, intl), [grantee, intl]);

    return (
        <div className="gd-share-dialog-grantee-item">
            <GranularPermissionsDropdownBody
                grantee={grantee}
                // TODO: Update with selected permission
                value={intl.formatMessage({ id: "shareDialog.share.granular.grantee.permission.edit" })}
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
