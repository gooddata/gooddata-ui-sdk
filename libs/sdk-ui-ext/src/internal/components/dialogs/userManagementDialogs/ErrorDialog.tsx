// (C) 2023-2024 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import { DialogBase, Typography, Button } from "@gooddata/sdk-ui-kit";

import { messages } from "./locales.js";

export interface IErrorDialogProps {
    children?: React.ReactNode;
    dialogTitle: string;
    onClose: () => void;
}

export const ErrorDialog: React.FC<IErrorDialogProps> = ({ dialogTitle, children, onClose }) => {
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
                    </Typography>
                </div>
            </div>
            <div className="gd-dialog-content">{children}</div>
            <div className="gd-dialog-footer">
                <div className="gd-user-management-dialog-buttons">
                    <div className="gd-user-management-dialog-buttons-left" />
                    <div className="gd-user-management-dialog-buttons-right">
                        <Button
                            className="gd-button gd-button-secondary"
                            value={intl.formatMessage(messages.closeDialog)}
                            onClick={onClose}
                        />
                    </div>
                </div>
            </div>
        </DialogBase>
    );
};
