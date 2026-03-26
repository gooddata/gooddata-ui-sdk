// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import Skeleton from "react-loading-skeleton";
import { connect } from "react-redux";

import { type CatalogItem } from "@gooddata/sdk-model";

import { isAssistantMessage, isUserMessage } from "../model.js";
import { parseReferences } from "./completion/references.js";
import { useCustomization } from "./CustomizationProvider.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";
import { AssistantItemComponent } from "./messages/AssistantItem.js";
import { ItemsGroup } from "./messages/ItemsGroup.js";
import { useMessageScroller } from "./messages/MessageScroller.js";
import { UserItemComponent } from "./messages/UserItem.js";
import { UserMessageComponent } from "./messages/UserMessage.js";
import { groupMessages } from "./utils/groupUtility.js";
import {
    asyncProcessSelector,
    conversationMessagesSelector,
    conversationSelector,
    messagesSelector,
} from "../store/messages/messagesSelectors.js";
import { type RootState } from "../store/types.js";
import { AssistantMessageComponent } from "./messages/AssistantMessage.js";
import { ToolItemComponent } from "./messages/ToolItem.js";
import { catalogItemsSelector } from "../store/chatWindow/chatWindowSelectors.js";

type MessagesComponentProps = {
    messages: ReturnType<typeof messagesSelector>;
    conversationMessages: ReturnType<typeof conversationMessagesSelector>;
    conversation: ReturnType<typeof conversationSelector>;
    catalogItems: ReturnType<typeof catalogItemsSelector>;
    loading: ReturnType<typeof asyncProcessSelector>;
    initializing?: boolean;
};

function MessagesComponent({
    conversationMessages,
    conversation,
    catalogItems,
    messages,
    loading,
    initializing,
}: MessagesComponentProps) {
    const { scrollerRef } = useMessageScroller(conversation ? conversationMessages : messages);
    const { LandingScreenComponent } = useCustomization();
    const { isBigScreen, isSmallScreen, isFullscreen } = useFullscreenCheck();
    const intl = useIntl();

    const isLoading = loading === "loading" || loading === "clearing" || initializing;
    const isEmpty = (conversation ? !conversationMessages.length : !messages.length) && !isLoading;

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
                {isLoading ? null : (
                    <>
                        {conversation ? (
                            <ConversationMessages
                                catalogItems={catalogItems}
                                conversation={conversation}
                                messages={conversationMessages}
                            />
                        ) : (
                            <ThreadMessages messages={messages} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

interface IThreadMessagesProps {
    messages: ReturnType<typeof messagesSelector>;
}

function ThreadMessages({ messages }: IThreadMessagesProps) {
    return (
        <>
            {messages.map((message, index) => {
                const isLast = index === messages.length - 1;

                if (isUserMessage(message)) {
                    return <UserMessageComponent key={message.localId} message={message} isLast={isLast} />;
                }

                if (isAssistantMessage(message)) {
                    return (
                        <AssistantMessageComponent key={message.localId} message={message} isLast={isLast} />
                    );
                }

                return assertNever(message);
            })}
        </>
    );
}

interface IConversationMessagesProps {
    conversation: ReturnType<typeof conversationSelector>;
    messages: ReturnType<typeof conversationMessagesSelector>;
    catalogItems?: CatalogItem[];
}

function ConversationMessages({ messages, catalogItems }: IConversationMessagesProps) {
    const currentMessages = useMemo(() => {
        return messages.map((item) => {
            return {
                ...item,
                content: parseReferences(item.content, catalogItems ?? []),
            };
        });
    }, [messages, catalogItems]);
    const groups = useMemo(() => groupMessages(currentMessages), [currentMessages]);

    return (
        <>
            {groups.map((group, gi) => {
                const previousGroup = groups[gi - 1];
                const isLastGroup = gi === groups.length - 1;

                return (
                    <ItemsGroup key={gi} previousGroup={previousGroup} group={group}>
                        {group.messages.map((message, mi) => {
                            const isLast = isLastGroup && mi === group.messages.length - 1;
                            switch (message.role) {
                                case "user":
                                    return <UserItemComponent message={message} isLast={isLast} />;
                                case "assistant":
                                    return (
                                        <AssistantItemComponent
                                            group={group}
                                            message={message}
                                            isLast={isLast}
                                        />
                                    );
                                case "tool":
                                    return <ToolItemComponent message={message} isLast={isLast} />;
                                default:
                                    return assertNever(message.role);
                            }
                        })}
                    </ItemsGroup>
                );
            })}
        </>
    );
}

const assertNever = (value: never): never => {
    throw new Error(`Unhandled message role: ${value}`);
};

const mapStateToProps = (state: RootState): MessagesComponentProps => ({
    messages: messagesSelector(state),
    loading: asyncProcessSelector(state),
    conversation: conversationSelector(state),
    conversationMessages: conversationMessagesSelector(state),
    catalogItems: catalogItemsSelector(state),
});

export const Messages: any = connect(mapStateToProps)(MessagesComponent);
