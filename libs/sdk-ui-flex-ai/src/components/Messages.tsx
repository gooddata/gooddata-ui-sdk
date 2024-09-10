// (C) 2024 GoodData Corporation

import React from "react";
import { useSelector } from "react-redux";
import { agentLoadingSelector, visibleMessagesSelector } from "../store/index.js";
import { AssistantMessageComponent, SystemMessageComponent, UserMessageComponent } from "./messages/index.js";
import { AgentState } from "./messages/AgentState.js";

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
        <div className="gd-flex-ai-chat__messages" ref={scrollRef}>
            <div className="gd-flex-ai-chat__messages__scroll">
                {messages.map((message) => {
                    switch (message.role) {
                        case "user":
                            return <UserMessageComponent key={message.id} message={message} />;
                        case "system":
                            return <SystemMessageComponent key={message.id} message={message} />;
                        case "assistant":
                            return <AssistantMessageComponent key={message.id} message={message} />;
                        default:
                            return assertNever(message);
                    }
                })}
                {loading ? <AgentState /> : null}
            </div>
        </div>
    );
};

const assertNever = (value: never): never => {
    throw new Error(`Unhandled message role: ${value}`);
};
