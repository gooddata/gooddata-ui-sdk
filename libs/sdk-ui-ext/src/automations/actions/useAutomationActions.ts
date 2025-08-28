// (C) 2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "../messages.js";
import { AutomationsType } from "../types.js";

/**
 * Simple hook for deleting a single automation using useCancelablePromise
 */
export const useAutomationActions = (type: AutomationsType) => {
    const backend = useBackend();
    const workspace = useWorkspace();
    const [deletedId, setDeletedId] = useState<string | null>(null);
    const [bulkDeletedIds, setBulkDeletedIds] = useState<string[]>([]);
    const [unsubscribedId, setUnsubscribedId] = useState<string | null>(null);
    const [bulkUnsubscribedIds, setBulkUnsubscribedIds] = useState<string[]>([]);
    const [pausedId, setPausedId] = useState<string | null>(null);
    const [bulkPausedIds, setBulkPausedIds] = useState<string[]>([]);
    const [resumedId, setResumedId] = useState<string | null>(null);
    const [bulkResumedIds, setBulkResumedIds] = useState<string[]>([]);
    const { addSuccess, addError } = useToastMessage();

    const actionMessages = useMemo(() => {
        if (type === "schedule") {
            return {
                messageDeleteSuccess: messages.messageScheduleDeleteSuccess,
                messageDeleteError: messages.messageScheduleDeleteError,
                messageUnsubscribeSuccess: messages.messageScheduleUnsubscribeSuccess,
                messageUnsubscribeError: messages.messageScheduleUnsubscribeError,

                messageBulkDeleteSuccess: messages.messageScheduleBulkDeleteSuccess,
                messageBulkDeleteError: messages.messageScheduleBulkDeleteError,
                messageBulkUnsubscribeSuccess: messages.messageScheduleBulkUnsubscribeSuccess,
                messageBulkUnsubscribeError: messages.messageScheduleBulkUnsubscribeError,

                messagePauseSuccess: messages.messageSchedulePauseSuccess,
                messagePauseError: messages.messageSchedulePauseError,
                messageBulkPauseSuccess: messages.messageScheduleBulkPauseSuccess,
                messageBulkPauseError: messages.messageScheduleBulkPauseError,

                messageResumeSuccess: messages.messageScheduleResumeSuccess,
                messageResumeError: messages.messageScheduleResumeError,
                messageBulkResumeSuccess: messages.messageScheduleBulkResumeSuccess,
                messageBulkResumeError: messages.messageScheduleBulkResumeError,
            };
        }
        return {
            messageDeleteSuccess: messages.messageAlertDeleteSuccess,
            messageDeleteError: messages.messageAlertDeleteError,
            messageUnsubscribeSuccess: messages.messageAlertUnsubscribeSuccess,
            messageUnsubscribeError: messages.messageAlertUnsubscribeError,

            messageBulkDeleteSuccess: messages.messageAlertBulkDeleteSuccess,
            messageBulkDeleteError: messages.messageAlertBulkDeleteError,
            messageBulkUnsubscribeSuccess: messages.messageAlertBulkUnsubscribeSuccess,
            messageBulkUnsubscribeError: messages.messageAlertBulkUnsubscribeError,

            messagePauseSuccess: messages.messageAlertPauseSuccess,
            messagePauseError: messages.messageAlertPauseError,
            messageBulkPauseSuccess: messages.messageAlertBulkPauseSuccess,
            messageBulkPauseError: messages.messageAlertBulkPauseError,

            messageResumeSuccess: messages.messageAlertResumeSuccess,
            messageResumeError: messages.messageAlertResumeError,
            messageBulkResumeSuccess: messages.messageAlertBulkResumeSuccess,
            messageBulkResumeError: messages.messageAlertBulkResumeError,
        };
    }, [type]);

    const { status: deleteStatus } = useCancelablePromise(
        {
            promise: deletedId
                ? async () => {
                      await backend.workspace(workspace).automations().deleteAutomation(deletedId);
                  }
                : null,
            onSuccess: () => {
                setDeletedId(null);
                addSuccess(actionMessages.messageDeleteSuccess);
            },
            onError: (error) => {
                setDeletedId(null);
                addError(actionMessages.messageDeleteError);
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
                addSuccess(actionMessages.messageBulkDeleteSuccess);
            },
            onError: (error) => {
                setBulkDeletedIds([]);
                addError(actionMessages.messageBulkDeleteError);
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
                addSuccess(actionMessages.messageUnsubscribeSuccess);
            },
            onError: (error) => {
                setUnsubscribedId(null);
                addError(actionMessages.messageUnsubscribeError);
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
                addSuccess(actionMessages.messageBulkUnsubscribeSuccess);
            },
            onError: (error) => {
                setBulkUnsubscribedIds([]);
                addError(actionMessages.messageBulkUnsubscribeError);
                console.error(error);
            },
        },
        [bulkUnsubscribedIds],
    );

    const { status: pauseStatus } = useCancelablePromise(
        {
            promise: pausedId
                ? async () => {
                      await backend.workspace(workspace).automations().pauseAutomations([pausedId]);
                  }
                : null,
            onSuccess: () => {
                setPausedId(null);
                addSuccess(actionMessages.messagePauseSuccess);
            },
            onError: (error) => {
                setPausedId(null);
                addError(actionMessages.messagePauseError);
                console.error(error);
            },
        },
        [pausedId],
    );

    const { status: bulkPauseStatus } = useCancelablePromise(
        {
            promise:
                bulkPausedIds.length > 0
                    ? async () => {
                          await backend.workspace(workspace).automations().pauseAutomations(bulkPausedIds);
                      }
                    : null,
            onSuccess: () => {
                setBulkPausedIds([]);
                addSuccess(actionMessages.messageBulkPauseSuccess);
            },
            onError: (error) => {
                setBulkPausedIds([]);
                addError(actionMessages.messageBulkPauseError);
                console.error(error);
            },
        },
        [bulkPausedIds],
    );

    const { status: resumeStatus } = useCancelablePromise(
        {
            promise: resumedId
                ? async () => {
                      await backend.workspace(workspace).automations().resumeAutomations([resumedId]);
                  }
                : null,
            onSuccess: () => {
                setResumedId(null);
                addSuccess(actionMessages.messageResumeSuccess);
            },
            onError: (error) => {
                setResumedId(null);
                addError(actionMessages.messageResumeError);
                console.error(error);
            },
        },
        [resumedId],
    );

    const { status: bulkResumeStatus } = useCancelablePromise(
        {
            promise:
                bulkResumedIds.length > 0
                    ? async () => {
                          await backend.workspace(workspace).automations().resumeAutomations(bulkResumedIds);
                      }
                    : null,
            onSuccess: () => {
                setBulkResumedIds([]);
                addSuccess(actionMessages.messageBulkResumeSuccess);
            },
            onError: (error) => {
                setBulkResumedIds([]);
                addError(actionMessages.messageBulkResumeError);
                console.error(error);
            },
        },
        [bulkResumedIds],
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

    const pauseAutomation = useCallback(async (automationId: string) => {
        setPausedId(automationId);
    }, []);

    const bulkPauseAutomations = useCallback(async (automationIds: string[]) => {
        setBulkPausedIds(automationIds);
    }, []);

    const resumeAutomation = useCallback(async (automationId: string) => {
        setResumedId(automationId);
    }, []);

    const bulkResumeAutomations = useCallback(async (automationIds: string[]) => {
        setBulkResumedIds(automationIds);
    }, []);

    const isLoading = useMemo(() => {
        return (
            deleteStatus === "loading" ||
            bulkDeleteStatus === "loading" ||
            unsubscribeStatus === "loading" ||
            bulkUnsubscribeStatus === "loading" ||
            pauseStatus === "loading" ||
            bulkPauseStatus === "loading" ||
            resumeStatus === "loading" ||
            bulkResumeStatus === "loading"
        );
    }, [
        deleteStatus,
        bulkDeleteStatus,
        unsubscribeStatus,
        bulkUnsubscribeStatus,
        pauseStatus,
        bulkPauseStatus,
        resumeStatus,
        bulkResumeStatus,
    ]);

    return {
        isLoading,
        deleteAutomation,
        bulkDeleteAutomations,
        unsubscribeFromAutomation,
        bulkUnsubscribeFromAutomations,
        pauseAutomation,
        bulkPauseAutomations,
        resumeAutomation,
        bulkResumeAutomations,
    };
};
