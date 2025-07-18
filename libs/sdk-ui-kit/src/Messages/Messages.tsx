// (C) 2020-2025 GoodData Corporation
import { useState, useCallback, MouseEvent } from "react";
import { v4 as uuid } from "uuid";
import noop from "lodash/noop.js";
import cx from "classnames";

import { Message } from "./Message.js";
import { IMessage, IMessagesProps } from "./typings.js";
import { Overlay } from "../Overlay/index.js";

/**
 * @internal
 */
export function Messages({ messages = [], onMessageClose = noop }: IMessagesProps) {
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
            <div className="gd-messages">
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
}

type MessageWithShowMoreProps = {
    message: IMessage;
    shouldShowMore: boolean;
    handleShowMore: (e: MouseEvent<HTMLElement>) => void;
};

function MessageWithShowMore({ message, shouldShowMore, handleShowMore }: MessageWithShowMoreProps) {
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
}

type MessageSimpleProps = {
    message: IMessage;
};

function MessageSimple({ message }: MessageSimpleProps) {
    const { showMore } = message;

    if (showMore) {
        return null;
    }

    return <MessageElement message={message} type="div" />;
}

type MessageElementProps = {
    message: IMessage;
    type: "div" | "span";
};

function MessageElement({ message, type }: MessageElementProps) {
    const { text, node } = message;
    const Component = type;

    if (node) {
        return <Component className="s-message-text-header-value">{node}</Component>;
    }

    return (
        <Component className="s-message-text-header-value" dangerouslySetInnerHTML={{ __html: text || "" }} />
    );
}
