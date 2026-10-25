// (C) 2007-2026 GoodData Corporation

import { type ComponentProps, type ReactNode, useCallback } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { NonContextToastsInterop } from "@gooddata/sdk-ui-kit";

import { hideMessage } from "../actions/messages_actions.js";
import { type IMessage } from "../models/message.js";
import { displayedMessagesSelector } from "../selectors/messages_selector.js";
import { type AppDispatch, type IAppState } from "../store/types.js";

export function Messages() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const messages = useSelector((state: IAppState) => displayedMessagesSelector(state).messages);

    const onDismissMessage = useCallback(
        (messageId: string) => {
            dispatch(hideMessage(messageId));
        },
        [dispatch],
    );

    function formatMessage({ text: id, values }: IMessage): { text: string; node?: ReactNode } {
        if (!id) {
            return { text: "" };
        }
        const formatted = intl.formatMessage({ id }, { ...values, b: bold });
        return typeof formatted === "string" ? { text: formatted } : { text: "", node: formatted };
    }

    const localizedMessages = messages
        .map((message: IMessage) => ({ ...message, ...formatMessage(message) }))
        .map((message) => {
            const errorDetails = message.errorDetails || undefined;
            if (errorDetails) {
                const errorDetail = intl.formatMessage({ id: errorDetails.id }, errorDetails.values);
                return {
                    ...message,
                    showMore: intl.formatMessage({ id: "messages.showMore" }),
                    showLess: intl.formatMessage({ id: "messages.showLess" }),
                    errorDetail,
                };
            }
            return message;
        });

    return (
        <NonContextToastsInterop
            // the runtime message shape matches the ui-kit toast contract; the repo model is wider
            messages={
                localizedMessages as unknown as ComponentProps<typeof NonContextToastsInterop>["messages"]
            }
            onDismissMessage={onDismissMessage}
        />
    );
}

function bold(chunks: ReactNode) {
    return <strong>{chunks}</strong>;
}
