// (C) 2023-2025 GoodData Corporation

import { useState } from "react";

import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { useBackendStrict } from "@gooddata/sdk-ui";
import { ConfirmDialogBase, type IAlignPoint, Input, Overlay, useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "./locales.js";
import { type IWithTelemetryProps, useTelemetry, withTelemetry } from "./TelemetryContext.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export interface ICreateUserGroupDialogProps extends IWithTelemetryProps {
    organizationId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

function CreateUserGroupDialogComponent({
    organizationId,
    onSuccess,
    onCancel,
}: ICreateUserGroupDialogProps) {
    const intl = useIntl();
    const backend = useBackendStrict();
    const { addSuccess, addError } = useToastMessage();
    const [userGroupName, setUserGroupName] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const trackEvent = useTelemetry();

    const onSubmit = () => {
        setIsProcessing(true);
        backend
            .organization(organizationId)
            .users()
            .createUserGroup({
                id: uuid(),
                ref: undefined,
                name: userGroupName,
            })
            .then(() => {
                addSuccess(messages.userGroupCreatedSuccess);
                trackEvent("group-created");
                onSuccess();
                onCancel();
            })
            .catch(() => {
                addError(messages.userGroupCreatedFailure);
            })
            .finally(() => setIsProcessing(false));
    };

    const onChange = (value: string | number) => setUserGroupName(String(value));

    return (
        <Overlay alignPoints={alignPoints} isModal positionType="fixed" className="gd-user-management-dialog">
            <ConfirmDialogBase
                onSubmit={onSubmit}
                isSubmitDisabled={userGroupName === "" || isProcessing}
                onCancel={onCancel}
                isPositive
                className="s-user-management-create-group-dialog gd-user-management-create-dialog"
                headline={intl.formatMessage(messages.createUserGroupDialogTitle)}
                submitButtonText={intl.formatMessage(messages.createUserGroupButton)}
                showProgressIndicator={isProcessing}
                cancelButtonText={intl.formatMessage(messages.cancelUserGroupButton)}
            >
                <Input
                    value={userGroupName}
                    onChange={onChange}
                    autofocus
                    placeholder={intl.formatMessage(messages.createUserGroupInputPlaceholder)}
                    className="gd-user-management-create-user-group-input s-group-name-input"
                />
            </ConfirmDialogBase>
        </Overlay>
    );
}

/**
 * @internal
 */
export const CreateUserGroupDialog = withTelemetry(CreateUserGroupDialogComponent);
