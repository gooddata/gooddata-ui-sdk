// (C) 2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { getAutomationActionsEmptyState } from "../constants.js";
import { getActionMessages } from "../messages.js";
import {
    type AutomationsScope,
    type AutomationsType,
    type IAutomationActions,
    type IAutomationActionsState,
} from "../types.js";
import { useAutomationService } from "../useAutomationService.js";

/**
 * Hook for automation actions using useCancelablePromise
 */
export const useAutomationActions = (type: AutomationsType, scope: AutomationsScope): IAutomationActions => {
    const [state, setState] = useState<IAutomationActionsState>(getAutomationActionsEmptyState());
    const { addSuccess, addError } = useToastMessage();
    const {
        promiseDeleteAutomation,
        promiseDeleteAutomations,
        promiseUnsubscribeAutomation,
        promiseUnsubscribeAutomations,
        promisePauseAutomation,
        promisePauseAutomations,
        promiseResumeAutomation,
        promiseResumeAutomations,
    } = useAutomationService(scope);

    const actionMessages = useMemo(() => getActionMessages(type), [type]);

    const resetState = useCallback(() => {
        setState(getAutomationActionsEmptyState());
    }, []);

    const { status: deleteStatus } = useCancelablePromise(
        {
            promise: state.deletedAutomation
                ? async () => {
                      await promiseDeleteAutomation(state.deletedAutomation!);
                  }
                : null,
            onSuccess: () => {
                resetState();
                addSuccess(actionMessages.messageDeleteSuccess);
            },
            onError: (error) => {
                resetState();
                addError(actionMessages.messageDeleteError);
                console.error(error);
            },
        },
        [state.deletedAutomation],
    );

    const { status: bulkDeleteStatus } = useCancelablePromise(
        {
            promise:
                state.bulkDeletedAutomations.length > 0
                    ? async () => {
                          await promiseDeleteAutomations(state.bulkDeletedAutomations);
                      }
                    : null,
            onSuccess: () => {
                resetState();
                addSuccess(actionMessages.messageBulkDeleteSuccess);
            },
            onError: (error) => {
                resetState();
                addError(actionMessages.messageBulkDeleteError);
                console.error(error);
            },
        },
        [state.bulkDeletedAutomations],
    );

    const { status: unsubscribeStatus } = useCancelablePromise(
        {
            promise: state.unsubscribedAutomation
                ? async () => {
                      await promiseUnsubscribeAutomation(state.unsubscribedAutomation!);
                  }
                : null,
            onSuccess: () => {
                resetState();
                addSuccess(actionMessages.messageUnsubscribeSuccess);
            },
            onError: (error) => {
                resetState();
                addError(actionMessages.messageUnsubscribeError);
                console.error(error);
            },
        },
        [state.unsubscribedAutomation],
    );

    const { status: bulkUnsubscribeStatus } = useCancelablePromise(
        {
            promise:
                state.bulkUnsubscribedAutomations.length > 0
                    ? async () => {
                          await promiseUnsubscribeAutomations(state.bulkUnsubscribedAutomations);
                      }
                    : null,
            onSuccess: () => {
                resetState();
                addSuccess(actionMessages.messageBulkUnsubscribeSuccess);
            },
            onError: (error) => {
                resetState();
                addError(actionMessages.messageBulkUnsubscribeError);
                console.error(error);
            },
        },
        [state.bulkUnsubscribedAutomations],
    );

    const { status: pauseStatus } = useCancelablePromise(
        {
            promise: state.pausedAutomation
                ? async () => {
                      await promisePauseAutomation(state.pausedAutomation!);
                  }
                : null,
            onSuccess: () => {
                resetState();
                addSuccess(actionMessages.messagePauseSuccess);
            },
            onError: (error) => {
                resetState();
                addError(actionMessages.messagePauseError);
                console.error(error);
            },
        },
        [state.pausedAutomation],
    );

    const { status: bulkPauseStatus } = useCancelablePromise(
        {
            promise:
                state.bulkPausedAutomations.length > 0
                    ? async () => {
                          await promisePauseAutomations(state.bulkPausedAutomations);
                      }
                    : null,
            onSuccess: () => {
                resetState();
                addSuccess(actionMessages.messageBulkPauseSuccess);
            },
            onError: (error) => {
                resetState();
                addError(actionMessages.messageBulkPauseError);
                console.error(error);
            },
        },
        [state.bulkPausedAutomations],
    );

    const { status: resumeStatus } = useCancelablePromise(
        {
            promise: state.resumedAutomation
                ? async () => {
                      await promiseResumeAutomation(state.resumedAutomation!);
                  }
                : null,
            onSuccess: () => {
                resetState();
                addSuccess(actionMessages.messageResumeSuccess);
            },
            onError: (error) => {
                resetState();
                addError(actionMessages.messageResumeError);
                console.error(error);
            },
        },
        [state.resumedAutomation],
    );

    const { status: bulkResumeStatus } = useCancelablePromise(
        {
            promise:
                state.bulkResumedAutomations.length > 0
                    ? async () => {
                          await promiseResumeAutomations(state.bulkResumedAutomations);
                      }
                    : null,
            onSuccess: () => {
                resetState();
                addSuccess(actionMessages.messageBulkResumeSuccess);
            },
            onError: (error) => {
                resetState();
                addError(actionMessages.messageBulkResumeError);
                console.error(error);
            },
        },
        [state.bulkResumedAutomations],
    );

    // Action methods
    const actions = useMemo(
        () => ({
            deleteAutomation: async (automation: IAutomationMetadataObject) => {
                setState((prev) => ({ ...prev, deletedAutomation: automation }));
            },
            bulkDeleteAutomations: async (automations: Array<IAutomationMetadataObject>) => {
                setState((prev) => ({ ...prev, bulkDeletedAutomations: automations }));
            },
            unsubscribeFromAutomation: async (automation: IAutomationMetadataObject) => {
                setState((prev) => ({ ...prev, unsubscribedAutomation: automation }));
            },
            bulkUnsubscribeFromAutomations: async (automations: Array<IAutomationMetadataObject>) => {
                setState((prev) => ({ ...prev, bulkUnsubscribedAutomations: automations }));
            },
            pauseAutomation: async (automation: IAutomationMetadataObject) => {
                setState((prev) => ({ ...prev, pausedAutomation: automation }));
            },
            bulkPauseAutomations: async (automations: Array<IAutomationMetadataObject>) => {
                setState((prev) => ({ ...prev, bulkPausedAutomations: automations }));
            },
            resumeAutomation: async (automation: IAutomationMetadataObject) => {
                setState((prev) => ({ ...prev, resumedAutomation: automation }));
            },
            bulkResumeAutomations: async (automations: Array<IAutomationMetadataObject>) => {
                setState((prev) => ({ ...prev, bulkResumedAutomations: automations }));
            },
        }),
        [],
    );

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
        ...actions,
    };
};
