// (C) 2023-2025 GoodData Corporation

import { ReactNode } from "react";

import { useIntl } from "react-intl";

import { Button, DialogBase, Typography, useId } from "@gooddata/sdk-ui-kit";

import { messages } from "./locales.js";

export interface IErrorDialogProps {
    children?: ReactNode;
    dialogTitle: string;
    onClose: () => void;
}

export function ErrorDialog({ dialogTitle, children, onClose }: IErrorDialogProps) {
    const intl = useIntl();
    const titleElementId = useId();

    return (
        <DialogBase
            className="gd-share-dialog gd-share-dialog-add-users gd-user-management-dialog-view s-user-management-view-mode"
            displayCloseButton
            onClose={onClose}
            accessibilityConfig={{ titleElementId }}
        >
            <div className="gd-dialog-header-wrapper">
                <div className="gd-dialog-header">
                    <Typography tagName="h3" className="gd-dialog-header-title" id={titleElementId}>
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
}
