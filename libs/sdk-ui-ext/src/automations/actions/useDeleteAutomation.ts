// (C) 2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";
import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";

/**
 * Simple hook for deleting a single automation using useCancelablePromise
 */
export const useDeleteAutomation = () => {
    const backend = useBackend();
    const workspace = useWorkspace();
    const [deletedId, setDeletedId] = useState<string | null>(null);

    const { status } = useCancelablePromise(
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

    const deleteAutomation = useCallback(async (automationId: string) => {
        setDeletedId(automationId);
    }, []);

    const isDeleting = useMemo(() => {
        return status === "loading";
    }, [status]);

    return {
        isDeleting,
        deleteAutomation,
    };
};
