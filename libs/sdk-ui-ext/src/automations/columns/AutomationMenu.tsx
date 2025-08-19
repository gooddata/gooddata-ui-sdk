// (C) 2025 GoodData Corporation

import React, { useCallback } from "react";

import { useIntl } from "react-intl";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { Item, ItemsWrapper, Separator, useToastMessage } from "@gooddata/sdk-ui-kit";

import { bem } from "../../notificationsPanel/bem.js";
import { messages } from "../messages.js";
import { IEditAutomation } from "../types.js";

const { b } = bem("gd-ui-ext-automation-menu-item");

export const AutomationMenu = ({
    item,
    workspace,
    canManage,
    isSubscribed,
    editAutomation,
    deleteAutomation,
    unsubscribeFromAutomation,
    closeDropdown,
}: {
    item: IAutomationMetadataObject;
    workspace: string;
    canManage: boolean;
    isSubscribed: boolean;
    editAutomation: IEditAutomation;
    deleteAutomation: (automationId: string) => void;
    unsubscribeFromAutomation: (automationId: string) => void;
    closeDropdown: () => void;
}) => {
    const intl = useIntl();
    const { addSuccess } = useToastMessage();

    const onEdit = useCallback(() => {
        closeDropdown();
        editAutomation(item, workspace, item.dashboard?.id);
    }, [editAutomation, workspace, item, closeDropdown]);

    const onDelete = useCallback(() => {
        closeDropdown();
        deleteAutomation(item.id);
    }, [deleteAutomation, item.id, closeDropdown]);

    const onUnsubscribe = useCallback(() => {
        closeDropdown();
        unsubscribeFromAutomation(item.id);
    }, [unsubscribeFromAutomation, item.id, closeDropdown]);

    const onCopyId = useCallback(() => {
        closeDropdown();
        navigator.clipboard.writeText(item.id);
        addSuccess(messages.messageCopyIdSuccess);
    }, [item.id, addSuccess, closeDropdown]);

    return (
        <ItemsWrapper smallItemsSpacing>
            {canManage ? (
                <AutomationMenuItem onClick={onEdit} label={intl.formatMessage(messages.menuEdit)} />
            ) : null}
            {isSubscribed ? (
                <AutomationMenuItem
                    onClick={onUnsubscribe}
                    label={intl.formatMessage(messages.menuUnsubscribe)}
                />
            ) : null}
            <Item onClick={onCopyId}>{intl.formatMessage(messages.menuCopyId)}</Item>
            {canManage ? (
                <>
                    <Separator />
                    <AutomationMenuItem onClick={onDelete} label={intl.formatMessage(messages.menuDelete)} />
                </>
            ) : null}
        </ItemsWrapper>
    );
};

interface AutomationMenuItemProps {
    onClick: () => void;
    label: string;
}

const AutomationMenuItem: React.FC<AutomationMenuItemProps> = ({ onClick, label }) => {
    return (
        <Item className={b()} onClick={onClick}>
            {label}
        </Item>
    );
};
