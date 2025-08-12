// (C) 2020-2025 GoodData Corporation
import React, { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import noop from "lodash/noop.js";
import cx from "classnames";

import { Message } from "./Message.js";
import { IMessage, IMessagesProps } from "./typings.js";
import { Overlay } from "../Overlay/index.js";
import { useIntl } from "react-intl";

/**
 * @internal
 */
export const Messages: React.FC<IMessagesProps> = ({
    messages = [],
    onMessageClose = noop,
    regionEnabled = false,
}) => {
    const label = useMessagesLabel(messages);

    const [expandedMessageIds, setExpandedMessageIds] = useState<string[]>([]);

    const handleMessageClose = useCallback(
        (messageId: string) => {
            setExpandedMessageIds((old) => old.filter((expandedId) => expandedId !== messageId));
            onMessageClose(messageId);
        },
        [onMessageClose],
    );

    return (
        <Overlay>
            <div
                className="gd-messages"
                role={regionEnabled ? "region" : undefined}
                aria-label={regionEnabled ? label : undefined}
            >
                {messages.map((message) => {
                    const { id, component: Component, type, contrast, intensive } = message;
                    const isExpanded = expandedMessageIds.includes(message.id);
                    return (
                        <div key={id}>
                            <Message
                                className="gd-message-overlay"
                                type={type}
                                onClose={() => handleMessageClose(id)}
                                contrast={contrast}
                                intensive={intensive}
                            >
                                {Component ? (
                                    <Component />
                                ) : (
                                    <>
                                        <MessageWithShowMore
                                            message={message}
                                            shouldShowMore={!isExpanded}
                                            handleShowMore={() => {
                                                if (isExpanded) {
                                                    setExpandedMessageIds((old) =>
                                                        old.filter((expandedId) => expandedId !== id),
                                                    );
                                                } else {
                                                    setExpandedMessageIds((old) => [...old, id]);
                                                }
                                            }}
                                        />
                                        <MessageSimple message={message} />
                                    </>
                                )}
                            </Message>
                        </div>
                    );
                })}
            </div>
        </Overlay>
    );
};

function useMessagesLabel(messages: IMessage[]) {
    const { formatMessage } = useIntl();

    const numTotal = messages.length;
    const numErrors = messages.filter((message) => message.type === "error").length;
    const numWarnings = messages.filter((message) => message.type === "warning").length;
    const numSuccess = messages.filter((message) => message.type === "success").length;
    const numProgress = messages.filter((message) => message.type === "progress").length;

    if (numTotal === 0) {
        return formatMessage({ id: "messages.accessibility.noMessages" });
    }

    const errorMessage = formatMessage({ id: "messages.accessibility.partial.error" }, { count: numErrors });
    const warningMessage = formatMessage(
        { id: "messages.accessibility.partial.warning" },
        { count: numWarnings },
    );
    const successMessage = formatMessage(
        { id: "messages.accessibility.partial.success" },
        { count: numSuccess },
    );
    const progressMessage = formatMessage(
        { id: "messages.accessibility.partial.progress" },
        { count: numProgress },
    );

    return formatMessage(
        { id: "messages.accessibility.label" },
        {
            count: numTotal,
            partial: [
                numErrors && errorMessage,
                numWarnings && warningMessage,
                numSuccess && successMessage,
                numProgress && progressMessage,
            ]
                .filter(Boolean)
                .join(", "),
        },
    );
}

type MessageWithShowMoreProps = {
    message: IMessage;
    shouldShowMore: boolean;
    handleShowMore: (e: React.MouseEvent<HTMLElement>) => void;
};

const MessageWithShowMore: React.FC<MessageWithShowMoreProps> = ({
    message,
    shouldShowMore,
    handleShowMore,
}) => {
    const { showMore, showLess, errorDetail, type } = message;

    if (!showMore) {
        return null;
    }

    const contentClassNames = cx("gd-message-text-content", "s-message-text-content", type, {
        off: shouldShowMore,
        on: !shouldShowMore,
    });
    const showMoreLinkClassNames = cx("gd-message-text-showmorelink", "s-message-text-showmorelink", type);

    const accessibilityId = uuid();
    return (
        <div className="gd-message-text-showmore">
            <MessageElement message={message} type="span" />
            <button
                aria-expanded={shouldShowMore ? "false" : "true"}
                aria-controls={accessibilityId}
                className={showMoreLinkClassNames}
                onClick={handleShowMore}
            >
                {shouldShowMore ? showMore : showLess}
            </button>
            <div id={accessibilityId} className={contentClassNames}>
                {errorDetail}
            </div>
        </div>
    );
};

type MessageSimpleProps = {
    message: IMessage;
};

const MessageSimple: React.FC<MessageSimpleProps> = ({ message }) => {
    const { showMore } = message;

    if (showMore) {
        return null;
    }

    return <MessageElement message={message} type="div" />;
};

type MessageElementProps = {
    message: IMessage;
    type: "div" | "span";
};

export const MessageElement: React.FC<MessageElementProps> = ({ message, type }) => {
    const { text, node } = message;
    const Component = type;

    if (node) {
        return <Component className="s-message-text-header-value">{node}</Component>;
    }

    return (
        <Component className="s-message-text-header-value" dangerouslySetInnerHTML={{ __html: text || "" }} />
    );
};
