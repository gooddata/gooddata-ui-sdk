// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

/**
 * @internal
 */
export const GranteeListEmpty: React.FC = () => {
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection">
            <span>
                <FormattedMessage id="shareDialog.share.grantee.add.empty.selection" />
            </span>
        </div>
    );
};
