// (C) 2024 GoodData Corporation

import React from "react";
import { connect } from "react-redux";
import { asyncProcessSelector, RootState, messagesSelector } from "../store/index.js";
import { AssistantMessageComponent, UserMessageComponent } from "./messages/index.js";
import { EmptyState } from "./EmptyState.js";
import { isAssistantMessage, isUserMessage } from "../model.js";
import Skeleton from "react-loading-skeleton";

type MessagesComponentProps = {
    messages: ReturnType<typeof messagesSelector>;
    loading: ReturnType<typeof asyncProcessSelector>;
};

const MessagesComponent: React.FC<MessagesComponentProps> = ({ messages, loading }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const lastMessage = messages[messages.length - 1];
    React.useLayoutEffect(() => {
        // Last message will also change when it's loading state is updated
        scrollRef.current?.scrollTo({
            top: scrollRef.current?.scrollHeight,
            behavior: "smooth",
        });
    }, [lastMessage]);

    return (
        <div className="gd-gen-ai-chat__messages" ref={scrollRef}>
            <div className="gd-gen-ai-chat__messages__scroll">
                {!messages.length && !loading ? <EmptyState /> : null}
                {loading === "loading" || loading === "clearing" ? <Skeleton count={3} height="2em" /> : null}
                {loading !== "loading" && loading !== "clearing"
                    ? messages.map((message) => {
                          if (isUserMessage(message)) {
                              return <UserMessageComponent key={message.localId} message={message} />;
                          }

                          if (isAssistantMessage(message)) {
                              return <AssistantMessageComponent key={message.localId} message={message} />;
                          }

                          return assertNever(message);
                      })
                    : null}
            </div>
        </div>
    );
};

const assertNever = (value: never): never => {
    throw new Error(`Unhandled message role: ${value}`);
};

const mapStateToProps = (state: RootState): MessagesComponentProps => ({
    messages: messagesSelector(state),
    loading: asyncProcessSelector(state),
});

export const Messages = connect(mapStateToProps)(MessagesComponent);
