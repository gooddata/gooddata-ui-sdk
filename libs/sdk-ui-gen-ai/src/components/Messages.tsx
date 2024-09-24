// (C) 2024 GoodData Corporation

import React from "react";
import { useSelector } from "react-redux";
import { agentLoadingSelector, visibleMessagesSelector } from "../store/index.js";
import {
    AssistantTextMessageComponent,
    SystemMessageComponent,
    UserTextMessageComponent,
    AssistantCancelledMessageComponent,
} from "./messages/index.js";
import { AgentState } from "./messages/AgentState.js";
import {
    isAssistantErrorMessage,
    isAssistantSearchCreateMessage,
    isAssistantTextMessage,
    isAssistantCancelledMessage,
    isUserTextMessage,
    isSystemTextMessage,
} from "../model.js";
import { EmptyState } from "./EmptyState.js";
import { AssistantErrorMessageComponent } from "./messages/AssistantErrorMessage.js";
import { AssistantSearchCreateMessageComponent } from "./messages/AssistantSearchCreateMessage.js";

export const Messages = () => {
    const messages = useSelector(visibleMessagesSelector);
    const loading = useSelector(agentLoadingSelector);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const lastMessage = messages[messages.length - 1];
    React.useLayoutEffect(() => {
        // If either last message or loading state changes, scroll to the bottom
        scrollRef.current?.scrollTo({
            top: scrollRef.current?.scrollHeight,
            behavior: "smooth",
        });
    }, [lastMessage, loading]);

    return (
        <div className="gd-gen-ai-chat__messages" ref={scrollRef}>
            <div className="gd-gen-ai-chat__messages__scroll">
                {!messages.length ? <EmptyState /> : null}
                {messages.map((message) => {
                    if (isAssistantTextMessage(message)) {
                        return <AssistantTextMessageComponent key={message.id} message={message} />;
                    }

                    if (isAssistantErrorMessage(message)) {
                        return <AssistantErrorMessageComponent key={message.id} message={message} />;
                    }

                    if (isAssistantSearchCreateMessage(message)) {
                        return <AssistantSearchCreateMessageComponent key={message.id} message={message} />;
                    }

                    if (isUserTextMessage(message)) {
                        return <UserTextMessageComponent key={message.id} message={message} />;
                    }

                    if (isAssistantCancelledMessage(message)) {
                        return <AssistantCancelledMessageComponent key={message.id} message={message} />;
                    }

                    if (isSystemTextMessage(message)) {
                        return <SystemMessageComponent key={message.id} message={message} />;
                    }

                    return assertNever(message);
                })}
                {loading ? <AgentState /> : null}
            </div>
        </div>
    );
};

const assertNever = (value: never): never => {
    throw new Error(`Unhandled message role: ${value}`);
};
