// (C) 2024-2025 GoodData Corporation

import React from "react";
import cx from "classnames";
import { useIntl } from "react-intl";

import { UserMessage } from "../../model.js";
import { MessageContents } from "./MessageContents.js";

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
        <section
            className={classNames}
            aria-label={intl.formatMessage({ id: "gd.gen-ai.message.label.user" })}
        >
            <MessageContents content={message.content} isLastMessage={isLast} messageId={message.localId} />
        </section>
    );
};
