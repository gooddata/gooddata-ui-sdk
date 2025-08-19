// (C) 2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";
import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";

/**
 * Simple hook for deleting a single automation using useCancelablePromise
 */
export const useAutomationActions = () => {
    const backend = useBackend();
    const workspace = useWorkspace();
    const [deletedId, setDeletedId] = useState<string | null>(null);
    const [bulkDeletedIds, setBulkDeletedIds] = useState<string[]>([]);
    const [unsubscribedId, setUnsubscribedId] = useState<string | null>(null);
    const [bulkUnsubscribedIds, setBulkUnsubscribedIds] = useState<string[]>([]);

    const { status: deleteStatus } = useCancelablePromise(
        {
            promise: deletedId
                ? async () => {
                      await backend.workspace(workspace).automations().deleteAutomation(deletedId);
                  }
                : null,
            onSuccess: () => {
                setDeletedId(null);
            },
            onError: (error) => {
                setDeletedId(null);
                console.error(error);
            },
        },
        [deletedId],
    );

    const { status: bulkDeleteStatus } = useCancelablePromise(
        {
            promise:
                bulkDeletedIds.length > 0
                    ? async () => {
                          await backend.workspace(workspace).automations().deleteAutomations(bulkDeletedIds);
                      }
                    : null,
            onSuccess: () => {
                setBulkDeletedIds([]);
            },
            onError: (error) => {
                setBulkDeletedIds([]);
                console.error(error);
            },
        },
        [bulkDeletedIds],
    );

    const { status: unsubscribeStatus } = useCancelablePromise(
        {
            promise: unsubscribedId
                ? async () => {
                      await backend.workspace(workspace).automations().unsubscribeAutomation(unsubscribedId);
                  }
                : null,
            onSuccess: () => {
                setUnsubscribedId(null);
            },
            onError: (error) => {
                setUnsubscribedId(null);
                console.error(error);
            },
        },
        [unsubscribedId],
    );

    const { status: bulkUnsubscribeStatus } = useCancelablePromise(
        {
            promise:
                bulkUnsubscribedIds.length > 0
                    ? async () => {
                          await backend
                              .workspace(workspace)
                              .automations()
                              .unsubscribeAutomations(bulkUnsubscribedIds);
                      }
                    : null,
            onSuccess: () => {
                setBulkUnsubscribedIds([]);
            },
            onError: (error) => {
                setBulkUnsubscribedIds([]);
                console.error(error);
            },
        },
        [bulkUnsubscribedIds],
    );

    const deleteAutomation = useCallback(async (automationId: string) => {
        setDeletedId(automationId);
    }, []);

    const bulkDeleteAutomations = useCallback(async (automationIds: string[]) => {
        setBulkDeletedIds(automationIds);
    }, []);

    const unsubscribeFromAutomation = useCallback(async (automationId: string) => {
        setUnsubscribedId(automationId);
    }, []);

    const bulkUnsubscribeFromAutomations = useCallback(async (automationIds: string[]) => {
        setBulkUnsubscribedIds(automationIds);
    }, []);

    const isLoading = useMemo(() => {
        return (
            deleteStatus === "loading" ||
            bulkDeleteStatus === "loading" ||
            unsubscribeStatus === "loading" ||
            bulkUnsubscribeStatus === "loading"
        );
    }, [deleteStatus, bulkDeleteStatus, unsubscribeStatus, bulkUnsubscribeStatus]);

    return {
        isLoading,
        deleteAutomation,
        bulkDeleteAutomations,
        unsubscribeFromAutomation,
        bulkUnsubscribeFromAutomations,
    };
};
