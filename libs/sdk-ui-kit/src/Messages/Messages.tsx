// (C) 2020-2022 GoodData Corporation
import React, { useState, useCallback } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import noop from "lodash/noop.js";
import cx from "classnames";

import { Message } from "./Message.js";
import { IMessage, IMessagesProps } from "./typings.js";
import { Overlay } from "../Overlay/index.js";
import { Typography } from "../Typography/index.js";

/**
 * @internal
 */
export const Messages: React.FC<IMessagesProps> = ({ messages = [], onMessageClose = noop }) => {
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
                <TransitionGroup>
                    <CSSTransition classNames="gd-message" timeout={220}>
                        <div>
                            {messages.map((message) => {
                                const {
                                    id,
                                    component: Component,
                                    showMore,
                                    type,
                                    contrast,
                                    intensive,
                                } = message;
                                const isExpanded = expandedMessageIds.includes(message.id);
                                return (
                                    <div key={id}>
                                        <Message
                                            className={cx(
                                                `gd-message-overlay`,
                                                !showMore && "gd-message-overlay",
                                                showMore && "gd-message-overlay-custom",
                                            )}
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
                                                                    old.filter(
                                                                        (expandedId) => expandedId !== id,
                                                                    ),
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
                    </CSSTransition>
                </TransitionGroup>
            </div>
        </Overlay>
    );
};

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

    return (
        <div className="gd-message-text-showmore">
            <Typography tagName="p" className="gd-message-text-header">
                <MessageElement message={message} type="span" />
                <span className={showMoreLinkClassNames} onClick={handleShowMore}>
                    {shouldShowMore ? showMore : showLess}
                </span>
            </Typography>
            <div className={contentClassNames}>{errorDetail}</div>
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

const MessageElement: React.FC<MessageElementProps> = ({ message, type }) => {
    const { text, node } = message;
    const Component = type;

    if (node) {
        return <Component className="s-message-text-header-value">{node}</Component>;
    }

    return (
        <Component className="s-message-text-header-value" dangerouslySetInnerHTML={{ __html: text || "" }} />
    );
};
