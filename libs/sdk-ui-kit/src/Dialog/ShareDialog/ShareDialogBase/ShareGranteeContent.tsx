// (C) 2021-2023 GoodData Corporation
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
    const {
        isLoading,
        grantees,
        areGranularPermissionsSupported,
        currentUserPermissions,
        isSharedObjectLocked,
        onAddGrantee,
        onChange,
        onDelete,
    } = props;

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
                <GranteeList
                    currentUserPermissions={currentUserPermissions}
                    isSharedObjectLocked={isSharedObjectLocked}
                    grantees={grantees}
                    mode="ShareGrantee"
                    areGranularPermissionsSupported={areGranularPermissionsSupported}
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )}
        </>
    );
};
