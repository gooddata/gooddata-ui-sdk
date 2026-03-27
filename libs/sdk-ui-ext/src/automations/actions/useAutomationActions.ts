// (C) 2025-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { type MessageDescriptor } from "react-intl";

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
        promiseTriggerAutomation,
    } = useAutomationService(scope);

    const actionMessages = useMemo(() => getActionMessages(type), [type]);

    const resetState = useCallback(() => {
        setState(getAutomationActionsEmptyState());
    }, []);

    const createActionSuccessHandler = useCallback(
        (message: MessageDescriptor) => () => {
            resetState();
            addSuccess(message);
        },
        [addSuccess, resetState],
    );

    const createActionErrorHandler = useCallback(
        (message: MessageDescriptor) => (error: unknown) => {
            resetState();
            addError(message);
            console.error(error);
        },
        [addError, resetState],
    );

    const { status: deleteStatus } = useCancelablePromise(
        {
            promise: state.deletedAutomation
                ? async () => {
                      await promiseDeleteAutomation(state.deletedAutomation!);
                  }
                : null,
            onSuccess: createActionSuccessHandler(actionMessages.messageDeleteSuccess),
            onError: createActionErrorHandler(actionMessages.messageDeleteError),
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
            onSuccess: createActionSuccessHandler(actionMessages.messageBulkDeleteSuccess),
            onError: createActionErrorHandler(actionMessages.messageBulkDeleteError),
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
            onSuccess: createActionSuccessHandler(actionMessages.messageUnsubscribeSuccess),
            onError: createActionErrorHandler(actionMessages.messageUnsubscribeError),
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
            onSuccess: createActionSuccessHandler(actionMessages.messageBulkUnsubscribeSuccess),
            onError: createActionErrorHandler(actionMessages.messageBulkUnsubscribeError),
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
            onSuccess: createActionSuccessHandler(actionMessages.messagePauseSuccess),
            onError: createActionErrorHandler(actionMessages.messagePauseError),
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
            onSuccess: createActionSuccessHandler(actionMessages.messageBulkPauseSuccess),
            onError: createActionErrorHandler(actionMessages.messageBulkPauseError),
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
            onSuccess: createActionSuccessHandler(actionMessages.messageResumeSuccess),
            onError: createActionErrorHandler(actionMessages.messageResumeError),
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
            onSuccess: createActionSuccessHandler(actionMessages.messageBulkResumeSuccess),
            onError: createActionErrorHandler(actionMessages.messageBulkResumeError),
        },
        [state.bulkResumedAutomations],
    );

    const { status: triggerStatus } = useCancelablePromise(
        {
            promise: state.triggeredAutomation
                ? async () => {
                      await promiseTriggerAutomation(state.triggeredAutomation!);
                  }
                : null,
            onSuccess: createActionSuccessHandler(actionMessages.messageTriggerSuccess),
            onError: createActionErrorHandler(actionMessages.messageTriggerError),
        },
        [state.triggeredAutomation],
    );

    // Action methods
    const actions = useMemo(
        () => ({
            deleteAutomation: (automation: IAutomationMetadataObject) => {
                setState((prev) => ({ ...prev, deletedAutomation: automation }));
            },
            bulkDeleteAutomations: (automations: Array<IAutomationMetadataObject>) => {
                setState((prev) => ({ ...prev, bulkDeletedAutomations: automations }));
            },
            unsubscribeFromAutomation: (automation: IAutomationMetadataObject) => {
                setState((prev) => ({ ...prev, unsubscribedAutomation: automation }));
            },
            bulkUnsubscribeFromAutomations: (automations: Array<IAutomationMetadataObject>) => {
                setState((prev) => ({ ...prev, bulkUnsubscribedAutomations: automations }));
            },
            pauseAutomation: (automation: IAutomationMetadataObject) => {
                setState((prev) => ({ ...prev, pausedAutomation: automation }));
            },
            bulkPauseAutomations: (automations: Array<IAutomationMetadataObject>) => {
                setState((prev) => ({ ...prev, bulkPausedAutomations: automations }));
            },
            resumeAutomation: (automation: IAutomationMetadataObject) => {
                setState((prev) => ({ ...prev, resumedAutomation: automation }));
            },
            bulkResumeAutomations: (automations: Array<IAutomationMetadataObject>) => {
                setState((prev) => ({ ...prev, bulkResumedAutomations: automations }));
            },
            triggerAutomation: (automation: IAutomationMetadataObject) => {
                setState((prev) => ({ ...prev, triggeredAutomation: automation }));
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
            bulkResumeStatus === "loading" ||
            triggerStatus === "loading"
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
        triggerStatus,
    ]);

    return {
        isLoading,
        ...actions,
    };
};
