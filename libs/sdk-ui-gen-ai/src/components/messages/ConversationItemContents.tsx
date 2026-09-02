// (C) 2024-2026 GoodData Corporation

import {
    type IChatConversationErrorContent,
    type IChatConversationLocalContent,
    type IChatConversationLocalItem,
    type TextContentObject,
} from "../../model.js";
import { useCustomization } from "../CustomizationContext.js";

import { ConversationToolCallContent } from "./conversationContents/ConversationToolCallContent.js";
import { ConversationToolResultContent } from "./conversationContents/ConversationToolResultContent.js";

type ConversationItemContentsProps = {
    message: IChatConversationLocalItem;
    references: TextContentObject[];
    role: "user" | "assistant" | "tool";
    isLoading: boolean;
    isLast?: boolean;
};

export function ConversationItemContents({ message, references, isLoading }: ConversationItemContentsProps) {
    const {
        MessageTextContentComponent,
        MessageErrorContentComponent,
        MessageReasoningContentComponent,
        MessageMultipartContentComponent,
    } = useCustomization();
    const content = message.content as IChatConversationLocalContent | IChatConversationErrorContent;

    if (content.type === "error") {
        return <MessageErrorContentComponent {...content} isLoading={isLoading} />;
    }

    if (content.type === "text") {
        return (
            <MessageTextContentComponent
                text={content.text}
                objects={[...(content.objects ?? []), ...references]}
                isLoading={isLoading}
            />
        );
    }

    if (content.type === "reasoning") {
        return (
            <MessageReasoningContentComponent
                summary={content.summary}
                objects={[...(content.objects ?? []), ...references]}
                isLoading={isLoading}
            />
        );
    }

    if (content.type === "multipart") {
        return (
            <MessageMultipartContentComponent
                message={message}
                parts={content.parts ?? []}
                references={references}
            />
        );
    }

    if (content.type === "toolCall") {
        return (
            <ConversationToolCallContent
                name={content.name}
                isLoading={isLoading}
                arguments={content.arguments}
            />
        );
    }

    if (content.type === "toolResult") {
        return <ConversationToolResultContent result={content.result} isLoading={isLoading} />;
    }

    return null;
}
