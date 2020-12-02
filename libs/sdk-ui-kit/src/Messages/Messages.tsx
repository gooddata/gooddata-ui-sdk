// (C) 2020 GoodData Corporation
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

    const handleMessageClose = useCallback((messageId: string) => {
        setShouldShowMore(true);
        onMessageClose(messageId);
    }, []);

    const handleShowMore = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            setShouldShowMore(!shouldShowMore);
        },
        [shouldShowMore],
    );

    const renderMessageWithShowMore = (message: IMessage): React.ReactNode => {
        const { showMore, showLess, errorDetail, text, type } = message;
        const contentClassNames = cx("gd-message-text-content", "s-message-text-content", type, {
            off: shouldShowMore,
            on: !shouldShowMore,
        });
        const showMoreLinkClassNames = cx(
            "gd-message-text-showmorelink",
            "s-message-text-showmorelink",
            type,
        );

        return (
            <div className="gd-message-text-showmore">
                <p className="gd-message-text-header">
                    <span
                        className="s-message-text-header-value"
                        dangerouslySetInnerHTML={{ __html: text }}
                    />
                    <span className={showMoreLinkClassNames} onClick={handleShowMore}>
                        {shouldShowMore ? showMore : showLess}
                    </span>
                </p>
                <div className={contentClassNames}>{errorDetail}</div>
            </div>
        );
    };

    return (
        <Overlay>
            <div className="gd-messages">
                <TransitionGroup>
                    <CSSTransition classNames="gd-message" timeout={220}>
                        <div>
                            {messages.map((message) => {
                                const { id, component, showMore, text, type, contrast, intensive } = message;
                                return (
                                    <div key={id}>
                                        <Message
                                            className={`gd-message-overlay gd-message-overlay${
                                                showMore && "-custom"
                                            }`}
                                            type={type}
                                            onClose={() => {
                                                handleMessageClose(id);
                                            }}
                                            contrast={contrast}
                                            intensive={intensive}
                                        >
                                            {component ||
                                                (showMore ? (
                                                    renderMessageWithShowMore(message)
                                                ) : (
                                                    <div
                                                        className="s-message-text-header-value"
                                                        dangerouslySetInnerHTML={{ __html: text }}
                                                    />
                                                ))}
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
