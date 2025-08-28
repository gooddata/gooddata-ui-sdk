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
    bulkPauseAutomations: (automationIds: string[]) => void;
    bulkResumeAutomations: (automationIds: string[]) => void;
    setPendingAction: (pendingAction: IAutomationsPendingAction | undefined) => void;
}

export const useAutomationBulkActions = ({
    selected,
    automationsType,
    bulkDeleteAutomations,
    bulkUnsubscribeFromAutomations,
    bulkPauseAutomations,
    bulkResumeAutomations,
    setPendingAction,
}: UseAutomationBulkActionsProps): UiAsyncTableBulkAction[] => {
    const { canManageAutomation, isSubscribedToAutomation, canPauseAutomation, canResumeAutomation } =
        useUser();
    const intl = useIntl();

    const isAnySelected = useMemo(() => selected.length > 0, [selected]);

    const bulkDeleteAction = useMemo(() => {
        const canManageAllSelected = isAnySelected && selected.every(canManageAutomation);

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
    }, [
        isAnySelected,
        selected,
        canManageAutomation,
        intl,
        setPendingAction,
        automationsType,
        bulkDeleteAutomations,
    ]);

    const bulkUnsubscribeAction = useMemo(() => {
        const isSubscribedToAllSelected = isAnySelected && selected.every(isSubscribedToAutomation);

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
        isAnySelected,
        selected,
        isSubscribedToAutomation,
        bulkUnsubscribeFromAutomations,
        intl,
        automationsType,
        setPendingAction,
    ]);

    const bulkPauseAction = useMemo(() => {
        const canPauseAllSelected = isAnySelected && selected.every(canPauseAutomation);

        if (!canPauseAllSelected) {
            return [];
        }

        return [
            {
                label: intl.formatMessage(messages.menuPause),
                onClick: () => {
                    setPendingAction({
                        type: "bulkPause",
                        automationsType,
                        onConfirm: () => bulkPauseAutomations(selected.map((automation) => automation.id)),
                    });
                },
            },
        ];
    }, [
        isAnySelected,
        selected,
        canPauseAutomation,
        intl,
        setPendingAction,
        automationsType,
        bulkPauseAutomations,
    ]);

    const bulkResumeAction = useMemo(() => {
        const canResumeAllSelected = isAnySelected && selected.every(canResumeAutomation);

        if (!canResumeAllSelected) {
            return [];
        }

        return [
            {
                label: intl.formatMessage(messages.menuResume),
                onClick: () => {
                    setPendingAction({
                        type: "bulkResume",
                        automationsType,
                        onConfirm: () => bulkResumeAutomations(selected.map((automation) => automation.id)),
                    });
                },
            },
        ];
    }, [
        isAnySelected,
        selected,
        canResumeAutomation,
        intl,
        setPendingAction,
        automationsType,
        bulkResumeAutomations,
    ]);

    return [...bulkDeleteAction, ...bulkUnsubscribeAction, ...bulkPauseAction, ...bulkResumeAction];
};
