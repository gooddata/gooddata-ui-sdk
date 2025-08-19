// (C) 2024-2025 GoodData Corporation

import React from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { MessageContents } from "./MessageContents.js";
import { UserMessage } from "../../model.js";

type UserMessageProps = {
    message: UserMessage;
    isLast?: boolean;
};

export const UserMessageComponent: React.FC<UserMessageProps> = ({ message, isLast }) => {
    const intl = useIntl();

    const classNames = cx(
        "gd-gen-ai-chat__messages__message",
        "gd-gen-ai-chat__messages__message--user",
        message.cancelled && "gd-gen-ai-chat__messages__message--cancelled",
    );

    return (
        <div className={classNames}>
            <span className="gd-gen-ai-chat__visually__hidden">
                {intl.formatMessage({ id: "gd.gen-ai.message.label.user" })}
            </span>
            <MessageContents
                useMarkdown
                content={message.content}
                isLastMessage={isLast}
                messageId={message.localId}
            />
        </div>
    );
};
