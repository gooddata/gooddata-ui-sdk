// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { MessageDescriptor } from "react-intl";
import { v4 as uuid } from "uuid";

import { IToastMessageDefinition } from "../../types";
import { uiActions } from "../store";
import { selectToastMessages } from "../store/ui/uiSelectors";
import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider";

const DEFAULT_DURATION = 2500;

/**
 * @internal
 */
export type AddToastMessage = (
    message: MessageDescriptor,
    options?: Pick<IToastMessageDefinition, "duration" | "intensive" | "titleValues">,
) => string;

/**
 * Provides convenience functions to manipulate toast messages.
 *
 * @internal
 */
export function useToastMessages() {
    const dispatch = useDashboardDispatch();
    const toastMessages = useDashboardSelector(selectToastMessages);

    const removeMessage = useCallback(
        (id: string) => {
            dispatch(uiActions.removeToastMessage(id));
        },
        [dispatch],
    );

    const removeAllMessages = useCallback(() => {
        dispatch(uiActions.removeAllToastMessages());
    }, [dispatch]);

    const addMessage = useCallback(
        (message: IToastMessageDefinition): string => {
            const id = uuid();
            dispatch(
                uiActions.addToastMessage({
                    ...message,
                    id,
                }),
            );

            const duration = message.duration ?? DEFAULT_DURATION;
            if (duration) {
                setTimeout(() => {
                    removeMessage(id);
                }, duration);
            }

            return id;
        },
        [dispatch, removeMessage],
    );

    const addSuccess = useCallback<AddToastMessage>(
        (messageDescriptor, options = {}) => {
            return addMessage({
                type: "success",
                titleId: messageDescriptor.id,
                ...options,
            });
        },
        [addMessage],
    );

    const addProgress = useCallback<AddToastMessage>(
        (messageDescriptor, options = {}) => {
            return addMessage({
                type: "progress",
                titleId: messageDescriptor.id,
                ...options,
            });
        },
        [addMessage],
    );

    const addWarning = useCallback<AddToastMessage>(
        (messageDescriptor, options = {}) => {
            return addMessage({
                type: "warning",
                titleId: messageDescriptor.id,
                ...options,
            });
        },
        [addMessage],
    );

    const addError = useCallback<AddToastMessage>(
        (messageDescriptor, options = {}) => {
            return addMessage({
                type: "error",
                titleId: messageDescriptor.id,
                ...options,
            });
        },
        [addMessage],
    );

    return {
        toastMessages,
        removeMessage,
        removeAllMessages,
        addMessage,
        addSuccess,
        addProgress,
        addWarning,
        addError,
    };
}
