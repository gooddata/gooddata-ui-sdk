// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";
import Skeleton from "react-loading-skeleton";
import { connect } from "react-redux";

import { isAssistantMessage, isUserMessage } from "../model.js";
import { useCustomization } from "./CustomizationProvider.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";
import { useMessageScroller } from "./messages/MessageScroller.js";
import { UserMessageComponent } from "./messages/UserMessage.js";
import { asyncProcessSelector, messagesSelector } from "../store/messages/messagesSelectors.js";
import { type RootState } from "../store/types.js";
import { AssistantMessageComponent } from "./messages/AssistantMessage.js";

type MessagesComponentProps = {
    messages: ReturnType<typeof messagesSelector>;
    loading: ReturnType<typeof asyncProcessSelector>;
    initializing?: boolean;
};

function MessagesComponent({ messages, loading, initializing }: MessagesComponentProps) {
    const { scrollerRef } = useMessageScroller(messages);
    const { LandingScreenComponent } = useCustomization();
    const { isBigScreen, isSmallScreen, isFullscreen } = useFullscreenCheck();
    const intl = useIntl();

    const isLoading = loading === "loading" || loading === "clearing" || initializing;
    const isEmpty = !messages.length && !isLoading;

    return (
        <div
            className={cx("gd-gen-ai-chat__messages", {
                "gd-gen-ai-chat__messages--fullscreen": isFullscreen,
                "gd-gen-ai-chat__messages--big-screen": isBigScreen,
                "gd-gen-ai-chat__messages--small-screen": isSmallScreen,
                "gd-gen-ai-chat__messages--empty": isEmpty,
            })}
            ref={scrollerRef}
        >
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
