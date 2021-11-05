// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Typography } from "../../../Typography";
import { AddUserOrGroupButton } from "./AddGranteeButton";
import { GranteeList } from "./GranteeList";
import { IShareGranteeContentProps } from "./types";

/**
 * @internal
 */
export const ShareGranteeContent: React.FC<IShareGranteeContentProps> = (props) => {
    const { grantees, onAddGrantee, onDelete } = props;

    return (
        <>
            <div className="gd-share-dialog-grantee-content-header">
                <Typography tagName="h3">
                    <FormattedMessage id="shareDialog.share.grantee.list.title" />
                </Typography>
                <AddUserOrGroupButton onClick={onAddGrantee} />
            </div>
            <GranteeList grantees={grantees} mode="ShareGrantee" onDelete={onDelete} />
        </>
    );
};
