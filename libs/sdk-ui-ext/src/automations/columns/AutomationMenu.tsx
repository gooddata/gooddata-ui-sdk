// (C) 2025 GoodData Corporation

import React, { useCallback } from "react";

import { useIntl } from "react-intl";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { Item, ItemsWrapper, Separator, useToastMessage } from "@gooddata/sdk-ui-kit";

import { bem } from "../../notificationsPanel/bem.js";
import { messages } from "../messages.js";
import { AutomationsType, IAutomationsPendingAction, IEditAutomation } from "../types.js";

const { b } = bem("gd-ui-ext-automation-menu-item");

export function AutomationMenu({
    item,
    workspace,
    canManage,
    isSubscribed,
    automationsType,
    canPause,
    canResume,
    editAutomation,
    deleteAutomation,
    unsubscribeFromAutomation,
    pauseAutomation,
    resumeAutomation,
    closeDropdown,
    setPendingAction,
}: {
    item: IAutomationMetadataObject;
    workspace: string;
    canManage: boolean;
    isSubscribed: boolean;
    automationsType: AutomationsType;
    canPause: boolean;
    canResume: boolean;
    editAutomation: IEditAutomation;
    deleteAutomation: (automationId: string) => void;
    unsubscribeFromAutomation: (automationId: string) => void;
    pauseAutomation: (automationId: string) => void;
    resumeAutomation: (automationId: string) => void;
    closeDropdown: () => void;
    setPendingAction: (pendingAction: IAutomationsPendingAction | undefined) => void;
}) {
    const intl = useIntl();
    const { addSuccess } = useToastMessage();

    const onEdit = useCallback(() => {
        closeDropdown();
        editAutomation(item, workspace, item.dashboard?.id);
    }, [editAutomation, workspace, item, closeDropdown]);

    const onDelete = useCallback(() => {
        closeDropdown();
        setPendingAction({
            type: "delete",
            automationsType,
            automationTitle: item.title,
            onConfirm: () => deleteAutomation(item.id),
        });
    }, [deleteAutomation, item.id, closeDropdown, setPendingAction, automationsType, item.title]);

    const onUnsubscribe = useCallback(() => {
        closeDropdown();
        setPendingAction({
            type: "unsubscribe",
            automationsType,
            automationTitle: item.title,
            onConfirm: () => unsubscribeFromAutomation(item.id),
        });
    }, [unsubscribeFromAutomation, item.id, closeDropdown, setPendingAction, automationsType, item.title]);

    const onPause = useCallback(() => {
        closeDropdown();
        setPendingAction({
            type: "pause",
            automationsType,
            automationTitle: item.title,
            onConfirm: () => pauseAutomation(item.id),
        });
    }, [pauseAutomation, item.id, closeDropdown, setPendingAction, automationsType, item.title]);

    const onResume = useCallback(() => {
        closeDropdown();
        setPendingAction({
            type: "resume",
            automationsType,
            automationTitle: item.title,
            onConfirm: () => resumeAutomation(item.id),
        });
    }, [resumeAutomation, item.id, closeDropdown, setPendingAction, automationsType, item.title]);

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
            {canResume ? (
                <AutomationMenuItem onClick={onResume} label={intl.formatMessage(messages.menuResume)} />
            ) : null}
            {canPause ? (
                <AutomationMenuItem onClick={onPause} label={intl.formatMessage(messages.menuPause)} />
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
}

interface AutomationMenuItemProps {
    onClick: () => void;
    label: string;
}

function AutomationMenuItem({ onClick, label }: AutomationMenuItemProps) {
    return (
        <Item className={b()} onClick={onClick}>
            {label}
        </Item>
    );
}
