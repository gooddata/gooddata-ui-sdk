// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { UiAsyncTableBulkAction } from "@gooddata/sdk-ui-kit";

import {
    BULK_DELETE_CONFIRM_DIALOG_ID,
    BULK_PAUSE_CONFIRM_DIALOG_ID,
    BULK_RESUME_CONFIRM_DIALOG_ID,
    BULK_UNSUBSCRIBE_CONFIRM_DIALOG_ID,
} from "../constants.js";
import { messages } from "../messages.js";
import { IUseAutomationBulkActionsProps } from "../types.js";
import { useUser } from "../UserContext.js";

export const useAutomationBulkActions = ({
    selected,
    automationsType,
    enabled,
    bulkDeleteAutomations,
    bulkUnsubscribeFromAutomations,
    bulkPauseAutomations,
    bulkResumeAutomations,
    setPendingAction,
}: IUseAutomationBulkActionsProps): UiAsyncTableBulkAction[] => {
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
                        onConfirm: () => bulkDeleteAutomations(selected),
                    });
                },
                accessibilityConfig: {
                    ariaHaspopup: "dialog" as const,
                    ariaControls: BULK_DELETE_CONFIRM_DIALOG_ID,
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
                        onConfirm: () => bulkUnsubscribeFromAutomations(selected),
                    });
                },
                accessibilityConfig: {
                    ariaHaspopup: "dialog" as const,
                    ariaControls: BULK_UNSUBSCRIBE_CONFIRM_DIALOG_ID,
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
                        onConfirm: () => bulkPauseAutomations(selected),
                    });
                },
                accessibilityConfig: {
                    ariaHaspopup: "dialog" as const,
                    ariaControls: BULK_PAUSE_CONFIRM_DIALOG_ID,
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
                        onConfirm: () => bulkResumeAutomations(selected),
                    });
                },
                accessibilityConfig: {
                    ariaHaspopup: "dialog" as const,
                    ariaControls: BULK_RESUME_CONFIRM_DIALOG_ID,
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

    return enabled
        ? [...bulkDeleteAction, ...bulkUnsubscribeAction, ...bulkPauseAction, ...bulkResumeAction]
        : undefined;
};
