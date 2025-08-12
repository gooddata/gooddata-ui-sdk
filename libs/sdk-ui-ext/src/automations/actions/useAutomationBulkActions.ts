// (C) 2025 GoodData Corporation

import { useMemo } from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { UiAsyncTableBulkAction } from "@gooddata/sdk-ui-kit";
import { useUser } from "../UserContext.js";
import { useIntl } from "react-intl";
import { messages } from "../messages.js";

interface UseAutomationBulkActionsProps {
    selected: IAutomationMetadataObject[];
    bulkDeleteAutomations: (automationIds: string[]) => void;
    bulkUnsubscribeFromAutomations: (automationIds: string[]) => void;
}

export const useAutomationBulkActions = ({
    selected,
    bulkDeleteAutomations,
    bulkUnsubscribeFromAutomations,
}: UseAutomationBulkActionsProps): UiAsyncTableBulkAction[] => {
    const { canManageAutomation, isSubscribedToAutomation } = useUser();
    const intl = useIntl();

    const bulkDelete = useMemo(() => {
        const canManageAllSelected = selected.length > 0 && selected.every(canManageAutomation);

        if (!canManageAllSelected) {
            return [];
        }

        return [
            {
                label: intl.formatMessage(messages.menuDelete),
                onClick: () => bulkDeleteAutomations(selected.map((automation) => automation.id)),
            },
        ];
    }, [selected, canManageAutomation, bulkDeleteAutomations, intl]);

    const bulkUnsubscribe = useMemo(() => {
        const isSubscribedToAllSelected = selected.length > 0 && selected.every(isSubscribedToAutomation);

        if (!isSubscribedToAllSelected) {
            return [];
        }

        return [
            {
                label: intl.formatMessage(messages.menuUnsubscribe),
                onClick: () => bulkUnsubscribeFromAutomations(selected.map((automation) => automation.id)),
            },
        ];
    }, [selected, isSubscribedToAutomation, bulkUnsubscribeFromAutomations, intl]);

    return [...bulkDelete, ...bulkUnsubscribe];
};
