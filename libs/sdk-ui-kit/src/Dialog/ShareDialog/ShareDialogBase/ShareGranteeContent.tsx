// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Typography } from "../../../Typography";
import { AddUserOrGroupButton } from "./AddGranteeButton";
import { GranteeList } from "./GranteeList";
import { GranteeListLoading } from "./GranteeListLoading";
import { IShareGranteeContentProps } from "./types";

/**
 * @internal
 */
export const ShareGranteeContent: React.FC<IShareGranteeContentProps> = (props) => {
    const { isLoading, grantees, onAddGrantee, onDelete } = props;

    return (
        <>
            <div className="gd-share-dialog-grantee-content-header">
                <Typography tagName="h3">
                    <FormattedMessage id="shareDialog.share.grantee.list.title" />
                </Typography>
                <AddUserOrGroupButton onClick={onAddGrantee} isDisabled={isLoading} />
            </div>
            {isLoading ? (
                <GranteeListLoading />
            ) : (
                <GranteeList grantees={grantees} mode="ShareGrantee" onDelete={onDelete} />
            )}
        </>
    );
};
