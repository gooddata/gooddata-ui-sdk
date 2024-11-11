// (C) 2024 GoodData Corporation

import React from "react";
import cx from "classnames";
import { AssistantMessage, isErrorContents } from "../../model.js";
import { AgentIcon } from "./AgentIcon.js";
import { MessageContents } from "./MessageContents.js";
import { defineMessage, injectIntl, WrappedComponentProps } from "react-intl";

type AssistantMessageProps = {
    message: AssistantMessage;
};

const labelMessage = defineMessage({ id: "gd.gen-ai.assistant-icon" });

const AssistantMessageComponentCore: React.FC<AssistantMessageProps & WrappedComponentProps> = ({
    message,
    intl,
}) => {
    const classNames = cx(
        "gd-gen-ai-chat__messages__message",
        "gd-gen-ai-chat__messages__message--assistant",
        message.cancelled && "gd-gen-ai-chat__messages__message--cancelled",
    );
    const hasError = message.content.some(isErrorContents);

    return (
        <div className={classNames}>
            <AgentIcon
                loading={!message.complete}
                error={hasError}
                cancelled={message.cancelled}
                aria-label={intl.formatMessage(labelMessage)}
            />
            <MessageContents
                useMarkdown
                content={message.content}
                isComplete={Boolean(message.complete || message.cancelled)}
                isCancelled={message.cancelled}
            />
        </div>
    );
};

export const AssistantMessageComponent = injectIntl(AssistantMessageComponentCore);
