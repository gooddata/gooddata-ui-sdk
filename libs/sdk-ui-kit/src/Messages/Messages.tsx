// (C) 2020-2022 GoodData Corporation
import React, { useState, useCallback } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import noop from "lodash/noop";
import cx from "classnames";

import { Message } from "./Message";
import { IMessage, IMessagesProps } from "./typings";
import { Overlay } from "../Overlay";

/**
 * @internal
 */
export const Messages: React.FC<IMessagesProps> = ({ messages = [], onMessageClose = noop }) => {
    const [shouldShowMore, setShouldShowMore] = useState<boolean>(true);

    const handleMessageClose = useCallback(
        (messageId: string) => {
            setShouldShowMore(true);
            onMessageClose(messageId);
        },
        [onMessageClose],
    );

    const handleShowMore = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            setShouldShowMore(!shouldShowMore);
        },
        [shouldShowMore],
    );

    return (
        <Overlay>
            <div className="gd-messages">
                <TransitionGroup>
                    <CSSTransition classNames="gd-message" timeout={220}>
                        <div>
                            {messages.map((message) => {
                                const { id, component, showMore, type, contrast, intensive } = message;
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
                                            {component || (
                                                <>
                                                    <MessageWithShowMore
                                                        message={message}
                                                        shouldShowMore={shouldShowMore}
                                                        handleShowMore={handleShowMore}
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
            <p className="gd-message-text-header">
                <MessageElement message={message} type="span" />
                <span className={showMoreLinkClassNames} onClick={handleShowMore}>
                    {shouldShowMore ? showMore : showLess}
                </span>
            </p>
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
