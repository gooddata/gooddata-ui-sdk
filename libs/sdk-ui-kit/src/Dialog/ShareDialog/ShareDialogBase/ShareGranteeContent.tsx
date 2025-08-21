// (C) 2021-2025 GoodData Corporation
import React from "react";

import { AddUserOrGroupButton } from "./AddGranteeButton.js";
import { GranteeList } from "./GranteeList.js";
import { GranteeListLoading } from "./GranteeListLoading.js";
import { IShareGranteeContentProps } from "./types.js";
import { Typography } from "../../../Typography/index.js";

/**
 * @internal
 */
export function ShareGranteeContent(props: IShareGranteeContentProps) {
    const {
        isLoading,
        grantees,
        areGranularPermissionsSupported,
        currentUserPermissions,
        isSharedObjectLocked,
        isGranteeShareLoading,
        applyShareGrantOnSelect,
        headline,
        onAddGrantee,
        onChange,
        onDelete,
    } = props;

    return (
        <>
            <div className="gd-share-dialog-grantee-content-header">
                <Typography tagName="h3">{headline}</Typography>
                <AddUserOrGroupButton
                    onClick={onAddGrantee}
                    isDisabled={isLoading || (applyShareGrantOnSelect && isGranteeShareLoading)}
                />
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
                    isGranteeShareLoading={isGranteeShareLoading}
                />
            )}
        </>
    );
}
