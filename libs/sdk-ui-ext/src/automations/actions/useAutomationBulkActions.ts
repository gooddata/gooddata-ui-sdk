// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { UiAsyncTableBulkAction } from "@gooddata/sdk-ui-kit";

import { messages } from "../messages.js";
import { AutomationsType, IAutomationsPendingAction } from "../types.js";
import { useUser } from "../UserContext.js";

interface UseAutomationBulkActionsProps {
    selected: IAutomationMetadataObject[];
    automationsType: AutomationsType;
    bulkDeleteAutomations: (automationIds: string[]) => void;
    bulkUnsubscribeFromAutomations: (automationIds: string[]) => void;
    setPendingAction: (pendingAction: IAutomationsPendingAction | undefined) => void;
}

export const useAutomationBulkActions = ({
    selected,
    automationsType,
    bulkDeleteAutomations,
    bulkUnsubscribeFromAutomations,
    setPendingAction,
}: UseAutomationBulkActionsProps): UiAsyncTableBulkAction[] => {
    const { canManageAutomation, isSubscribedToAutomation } = useUser();
    const intl = useIntl();

    const bulkDeleteAction = useMemo(() => {
        const canManageAllSelected = selected.length > 0 && selected.every(canManageAutomation);

        if (!canManageAllSelected) {
            return [];
        }

        return [
            {
                label: intl.formatMessage(messages.menuDelete),
                onClick: () => {
                    setPendingAction({
                        type: "bulkDelete",
                        automationsType,
                        onConfirm: () => bulkDeleteAutomations(selected.map((automation) => automation.id)),
                    });
                },
            },
        ];
    }, [selected, canManageAutomation, bulkDeleteAutomations, intl, automationsType, setPendingAction]);

    const bulkUnsubscribeAction = useMemo(() => {
        const isSubscribedToAllSelected = selected.length > 0 && selected.every(isSubscribedToAutomation);

        if (!isSubscribedToAllSelected) {
            return [];
        }

        return [
            {
                label: intl.formatMessage(messages.menuUnsubscribe),
                onClick: () => {
                    setPendingAction({
                        type: "bulkUnsubscribe",
                        automationsType,
                        onConfirm: () =>
                            bulkUnsubscribeFromAutomations(selected.map((automation) => automation.id)),
                    });
                },
            },
        ];
    }, [
        selected,
        isSubscribedToAutomation,
        bulkUnsubscribeFromAutomations,
        intl,
        automationsType,
        setPendingAction,
    ]);

    return [...bulkDeleteAction, ...bulkUnsubscribeAction];
};
