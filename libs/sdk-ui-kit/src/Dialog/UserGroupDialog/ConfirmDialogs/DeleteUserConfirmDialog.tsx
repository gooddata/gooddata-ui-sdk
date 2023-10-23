// (C) 2023 GoodData Corporation

import React from "react";
import { ConfirmDialog } from "../../ConfirmDialog.js";
import { Typography } from "../../../Typography/index.js";
import { FormattedMessage, useIntl } from "react-intl";

export interface IDeleteUserConfirmDialogProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteUserConfirmDialog: React.FC<IDeleteUserConfirmDialogProps> = ({onConfirm, onCancel}) => {
    const intl = useIntl();
    return (
        <ConfirmDialog
            onSubmit={onConfirm}
            onCancel={onCancel}
            isPositive={false}
            className="s-dialog"
            headline={intl.formatMessage({ id: "userGroupDialog.deleteUser.title" })}
            cancelButtonText={intl.formatMessage({ id: "userGroupDialog.deleteUser.cancelButton" })}
            submitButtonText={intl.formatMessage({ id: "userGroupDialog.deleteUser.confirmButton" })}
        >
            <Typography tagName="p">
                <FormattedMessage id="userGroupDialog.deleteUser.message" values={{br: <br />}} />
            </Typography>
        </ConfirmDialog>
    );
}
