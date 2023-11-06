// (C) 2023 GoodData Corporation

import React, { useState } from "react";
import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";
import { useBackendStrict } from "@gooddata/sdk-ui";

import { ConfirmDialogBase } from "../ConfirmDialogBase.js";
import { userManagementMessages } from "../../locales.js";
import { Input } from "../../Form/index.js";
import { useToastMessage } from "../../Messages/index.js";
import { Overlay } from "../../Overlay/index.js";
import { IAlignPoint } from "../../typings/positioning.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export interface ICreateUserGroupDialogProps {
    organizationId: string;
    onGroupCreated: () => void;
    onCancel: () => void;
}

/**
 * @internal
 */
export const CreateUserGroupDialog:React.FC<ICreateUserGroupDialogProps> = ({organizationId, onGroupCreated, onCancel}) => {
    const intl = useIntl();
    const backend = useBackendStrict();
    const { addSuccess, addError} = useToastMessage();
    const [userGroupName, setUserGroupName] = useState<string>();

    const onSubmit = () => {
        backend
            .organization(organizationId)
            .users()
            .createUserGroup({
                id: uuid(),
                ref: undefined,
                name: userGroupName,
            })
            .then(() => {
                addSuccess(userManagementMessages.userGroupCreatedSuccess);
                onGroupCreated();
                onCancel();
            })
            .catch(() => {
                addError(userManagementMessages.userGroupCreatedFailure);
            });
    };

    const onChange = (value: string) => setUserGroupName(value);

    return (
        <Overlay
            alignPoints={alignPoints}
            isModal={true}
            positionType="fixed"
            className="gd-user-management-dialog"
        >
            <ConfirmDialogBase
                onSubmit={onSubmit}
                onCancel={onCancel}
                isPositive={true}
                className="s-user-management-delete-confirm-dialog gd-user-management-create-dialog"
                headline={intl.formatMessage(userManagementMessages.createUserGroupDialogTitle)}
                submitButtonText={intl.formatMessage(userManagementMessages.createUserGroupButton)}
                cancelButtonText={intl.formatMessage(userManagementMessages.cancelUserGroupButton)}
            >
                <Input
                    value={userGroupName}
                    onChange={onChange}
                    autofocus={true}
                    placeholder={intl.formatMessage(userManagementMessages.createUserGroupInputPlaceholder)}
                    className="gd-user-management-create-user-group-input"
                />
            </ConfirmDialogBase>
        </Overlay>
    );
};
