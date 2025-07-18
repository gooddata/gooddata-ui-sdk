// (C) 2024-2025 GoodData Corporation

import { useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import { useIntl } from "react-intl";

import { asyncProcessSelector, messagesSelector } from "../store/index.js";
import { isAssistantMessage, isUserMessage } from "../model.js";

import { AssistantMessageComponent, UserMessageComponent } from "./messages/index.js";
import { EmptyState } from "./EmptyState.js";

type MessagesComponentProps = {
    initializing?: boolean;
};

export function Messages({ initializing }: MessagesComponentProps) {
    const intl = useIntl();
    const messages = useSelector(messagesSelector);
    const loading = useSelector(asyncProcessSelector);

    const { scrollerRef } = useMessageScroller(messages);
    const isLoading = loading === "loading" || loading === "clearing" || initializing;
    const isEmpty = !messages.length && !isLoading;

    return (
        <div className="gd-gen-ai-chat__messages" ref={scrollerRef}>
            <div
                className="gd-gen-ai-chat__messages__scroll"
                role="log"
                aria-relevant={isEmpty || isLoading ? undefined : "additions"}
                aria-label={intl.formatMessage({ id: "gd.gen-ai.messages.label" })}
            >
                {isEmpty ? <EmptyState /> : null}
                {isLoading ? <Skeleton count={3} height="2em" /> : null}
                {!isLoading
                    ? messages.map((message, index) => {
                          const isLast = index === messages.length - 1;

                          if (isUserMessage(message)) {
                              return (
                                  <UserMessageComponent
                                      key={message.localId}
                                      message={message}
                                      isLast={isLast}
                                  />
                              );
                          }

                          if (isAssistantMessage(message)) {
                              return (
                                  <AssistantMessageComponent
                                      key={message.localId}
                                      message={message}
                                      isLast={isLast}
                                  />
                              );
                          }

                          return assertNever(message);
                      })
                    : null}
            </div>
        </div>
    );
}

function useMessageScroller(messages: ReturnType<typeof messagesSelector>) {
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    const lastMessage = messages[messages.length - 1];
    useLayoutEffect(() => {
        // Last message will also change when it's loading state is updated
        scrollerRef.current?.scrollTo({
            top: scrollerRef.current?.scrollHeight,
            behavior: "smooth",
        });
    }, [lastMessage]);

    return {
        scrollerRef,
    };
}

const assertNever = (value: never): never => {
    throw new Error(`Unhandled message role: ${value}`);
};
