// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { type CatalogItem } from "@gooddata/sdk-model";

import {
    agentSwitchingActiveSelector,
    catalogItemsSelector,
} from "../store/chatWindow/chatWindowSelectors.js";
import {
    asyncProcessSelector,
    conversationMessagesSelector,
    conversationSelector,
} from "../store/messages/messagesSelectors.js";

import { ChatSkeleton } from "./ChatSkeleton.js";
import { parseReferences } from "./completion/references.js";
import { useCustomization } from "./CustomizationContext.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";
import { ItemsGroup } from "./messages/ItemsGroup.js";
import { useMessageScroller } from "./messages/MessageScroller.js";
import { SystemItemComponent } from "./messages/SystemItem.js";
import { ToolItemComponent } from "./messages/ToolItem.js";
import { groupMessages } from "./utils/groupUtility.js";

type MessagesComponentProps = {
    initializing?: boolean;
};

export function Messages({ initializing }: MessagesComponentProps) {
    const loading = useSelector(asyncProcessSelector);
    const conversation = useSelector(conversationSelector);
    const conversationMessages = useSelector(conversationMessagesSelector);
    const catalogItems = useSelector(catalogItemsSelector);
    const agentSwitchingActive = useSelector(agentSwitchingActiveSelector);

    const { scrollerRef } = useMessageScroller(conversationMessages);
    const { LandingScreenComponent } = useCustomization();
    const { isBigScreen, isSmallScreen, isFullscreen } = useFullscreenCheck();
    const intl = useIntl();

    const isLoading = loading === "loading" || loading === "clearing" || initializing;
    const isEmpty = !conversationMessages.length && !isLoading;

    return (
        <div
            className={cx("gd-gen-ai-chat__messages", {
                "gd-gen-ai-chat__messages--fullscreen": isFullscreen,
                "gd-gen-ai-chat__messages--big-screen": isBigScreen,
                "gd-gen-ai-chat__messages--small-screen": isSmallScreen,
                "gd-gen-ai-chat__messages--empty": isEmpty,
                "gd-gen-ai-chat__messages--agent-switching": agentSwitchingActive,
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
                {isLoading ? <ChatSkeleton /> : null}
                {isLoading ? null : (
                    <ConversationMessages
                        catalogItems={catalogItems}
                        conversation={conversation}
                        messages={conversationMessages}
                    />
                )}
            </div>
        </div>
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
    const { UserMessageComponent, AssistantMessageComponent } = useCustomization();

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
                                    return (
                                        <UserMessageComponent
                                            key={message.localId}
                                            groups={groups}
                                            message={message}
                                            isLast={isLast}
                                        />
                                    );
                                case "assistant":
                                    return (
                                        <AssistantMessageComponent
                                            key={message.localId}
                                            groups={groups}
                                            message={message}
                                            isLast={isLast}
                                        />
                                    );
                                case "tool":
                                    return (
                                        <ToolItemComponent
                                            key={message.localId}
                                            groups={groups}
                                            message={message}
                                            isLast={isLast}
                                        />
                                    );
                                case "system":
                                    return (
                                        <SystemItemComponent
                                            key={message.localId}
                                            groups={groups}
                                            message={message}
                                        />
                                    );
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
