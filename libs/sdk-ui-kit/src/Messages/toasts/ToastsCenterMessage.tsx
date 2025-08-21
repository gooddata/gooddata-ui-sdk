// (C) 2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { v4 as uuid } from "uuid";

import { Message } from "../Message.js";
import { IMessage } from "../typings.js";

export function ToastsCenterMessage({ message, onRemove }: { message: IMessage; onRemove: () => void }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const { component: Component, type, contrast, intensive } = message;

    return (
        <Message
            className="gd-message-overlay"
            type={type}
            onClose={onRemove}
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
                        handleShowMore={() => setIsExpanded((wasExpanded) => !wasExpanded)}
                    />
                    <MessageSimple message={message} />
                </>
            )}
        </Message>
    );
}

type MessageWithShowMoreProps = {
    message: IMessage;
    shouldShowMore: boolean;
    handleShowMore: (e: React.MouseEvent<HTMLElement>) => void;
};

export function MessageWithShowMore({ message, shouldShowMore, handleShowMore }: MessageWithShowMoreProps) {
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

export function MessageSimple({ message }: MessageSimpleProps) {
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

export function MessageElement({ message, type }: MessageElementProps) {
    const { text, node } = message;
    const Component = type;

    if (node) {
        return <Component className="s-message-text-header-value">{node}</Component>;
    }

    return (
        <Component className="s-message-text-header-value" dangerouslySetInnerHTML={{ __html: text || "" }} />
    );
}

/**
 * @internal
 */
export function ToastMessageList({
    messages,
    onRemoveMessage,
}: {
    messages: IMessage[];
    onRemoveMessage?: (id: string) => void;
}) {
    return (
        <>
            {messages.map((message) => (
                <ToastsCenterMessage
                    key={message.id}
                    message={message}
                    onRemove={() => onRemoveMessage?.(message.id)}
                />
            ))}
        </>
    );
}
