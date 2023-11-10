// (C) 2023 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { DialogBase } from "../DialogBase.js";
import { Typography } from "../../Typography/index.js";
import { Button } from "../../Button/index.js";
import { userManagementMessages } from "../../locales.js";

import { DeleteLink } from "./DeleteLink.js";

export interface IViewDialogProps {
    children: React.ReactNode;
    dialogTitle: string;
    isAdmin: boolean;
    isDeleteLinkEnabled: boolean;
    deleteLinkDisabledTooltipTextId?: string;
    deleteLinkText: string;
    onOpenDeleteDialog: () => void;
    onClose: () => void;
    editButtonText: string;
    editButtonIconClassName: string;
    onEdit: () => void;
}

export const ViewDialog: React.FC<IViewDialogProps> = ({
    dialogTitle,
    isAdmin,
    onEdit,
    editButtonIconClassName,
    editButtonText,
    children,
    deleteLinkText,
    isDeleteLinkEnabled,
    deleteLinkDisabledTooltipTextId,
    onOpenDeleteDialog,
    onClose,
}) => {
    const intl = useIntl();
    return (
        <DialogBase
            className="gd-share-dialog gd-share-dialog-add-users gd-user-management-dialog-view s-user-management-view-mode"
            displayCloseButton={true}
            isPositive={true}
            onClose={onClose}
        >
            <div className="gd-dialog-header-wrapper">
                <div className="gd-dialog-header">
                    <Typography tagName="h3" className="gd-dialog-header-title">
                        <span>{dialogTitle}</span>
                        {isAdmin ? (
                            <span className="gd-setting-widget-status-pill">
                                {intl.formatMessage(userManagementMessages.adminPill)}
                            </span>
                        ) : null}
                    </Typography>
                </div>
            </div>
            <div className="gd-dialog-content">{children}</div>
            <div className="gd-dialog-footer">
                <div className="gd-user-management-dialog-buttons">
                    <div className="gd-user-management-dialog-buttons-left">
                        <Button
                            className="gd-button gd-button-secondary"
                            iconLeft={cx(editButtonIconClassName, "gd-user-management-dialog-edit-mode-icon")}
                            value={editButtonText}
                            onClick={onEdit}
                        />
                    </div>
                    <div className="gd-user-management-dialog-buttons-right">
                        <DeleteLink
                            deleteLinkText={deleteLinkText}
                            onOpenDeleteDialog={onOpenDeleteDialog}
                            isDeleteLinkEnabled={isDeleteLinkEnabled}
                            disabledLinkTooltipTextId={deleteLinkDisabledTooltipTextId}
                        />
                        <Button
                            className="gd-button gd-button-secondary"
                            value={intl.formatMessage(userManagementMessages.closeDialog)}
                            onClick={onClose}
                        />
                    </div>
                </div>
            </div>
        </DialogBase>
    );
};
