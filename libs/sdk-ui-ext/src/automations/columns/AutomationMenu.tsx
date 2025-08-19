// (C) 2025 GoodData Corporation

import { Item, Separator, ItemsWrapper } from "@gooddata/sdk-ui-kit";
import { messages } from "../messages.js";
import { useIntl } from "react-intl";
import React, { useCallback } from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { navigate } from "../utils.js";

export const AutomationMenu = ({
    item,
    workspace,
    canManage,
    isSubscribed,
    automationUrlBuilder,
    deleteAutomation,
    unsubscribeFromAutomation,
}: {
    item: IAutomationMetadataObject;
    workspace: string;
    canManage: boolean;
    isSubscribed: boolean;
    automationUrlBuilder: (workspace: string, dashboardId: string, automationId: string) => string;
    deleteAutomation: (automationId: string) => void;
    unsubscribeFromAutomation: (automationId: string) => void;
}) => {
    const intl = useIntl();

    const onEdit = useCallback(() => {
        const automationUrl = automationUrlBuilder(workspace, item.dashboard?.id, item.id);
        if (automationUrl) {
            navigate(automationUrl);
        }
    }, [automationUrlBuilder, workspace, item.dashboard?.id, item.id]);
    const onDelete = useCallback(() => {
        deleteAutomation(item.id);
    }, [deleteAutomation, item.id]);
    const onUnsubscribe = useCallback(() => {
        unsubscribeFromAutomation(item.id);
    }, [unsubscribeFromAutomation, item.id]);

    return (
        <ItemsWrapper smallItemsSpacing>
            {canManage ? <Item onClick={onEdit}>{intl.formatMessage(messages.menuEdit)}</Item> : null}
            {isSubscribed ? (
                <Item onClick={onUnsubscribe}>{intl.formatMessage(messages.menuUnsubscribe)}</Item>
            ) : null}
            {canManage ? (
                <>
                    <Separator />
                    <Item onClick={onDelete}>{intl.formatMessage(messages.menuDelete)}</Item>
                </>
            ) : null}
        </ItemsWrapper>
    );
};
