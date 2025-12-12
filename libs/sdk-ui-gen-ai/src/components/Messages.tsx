// (C) 2024-2025 GoodData Corporation

import { useIntl } from "react-intl";
import Skeleton from "react-loading-skeleton";
import { connect } from "react-redux";

import { isAssistantMessage, isUserMessage } from "../model.js";
import { useCustomization } from "./CustomizationProvider.js";
import { AssistantMessageComponent, UserMessageComponent } from "./messages/index.js";
import { useMessageScroller } from "./messages/MessageScroller.js";
import { type RootState, asyncProcessSelector, messagesSelector } from "../store/index.js";

type MessagesComponentProps = {
    messages: ReturnType<typeof messagesSelector>;
    loading: ReturnType<typeof asyncProcessSelector>;
    initializing?: boolean;
};

function MessagesComponent({ messages, loading, initializing }: MessagesComponentProps) {
    const { scrollerRef } = useMessageScroller(messages);
    const { LandingScreenComponent } = useCustomization();
    const intl = useIntl();
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
                {isEmpty ? <LandingScreenComponent /> : null}
                {isLoading ? <Skeleton count={3} height="2em" /> : null}
                {isLoading
                    ? null
                    : messages.map((message, index) => {
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
                      })}
            </div>
        </div>
    );
}

const assertNever = (value: never): never => {
    throw new Error(`Unhandled message role: ${value}`);
};

const mapStateToProps = (state: RootState): MessagesComponentProps => ({
    messages: messagesSelector(state),
    loading: asyncProcessSelector(state),
});

export const Messages: any = connect(mapStateToProps)(MessagesComponent);
