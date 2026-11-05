// (C) 2024-2026 GoodData Corporation

import { useSelector } from "react-redux";

import {
    type IChatConversationErrorContent,
    type IChatConversationLocalContent,
    type IChatConversationLocalItem,
    type TextContentObject,
} from "../../model.js";
import { agentsSelector } from "../../store/messages/messagesSelectors.js";
import { useCustomization } from "../CustomizationContext.js";
import { type IChatMessagesGroup, getReasoningDurationMs } from "../utils/groupUtility.js";

import { ConversationClarifyingAnswersContent } from "./conversationContents/ConversationClarifyingAnswersContent.js";
import { ConversationSkillActivatedContent } from "./conversationContents/ConversationSkillActivatedContent.js";
import { ConversationToolCallContent } from "./conversationContents/ConversationToolCallContent.js";
import { ConversationToolResultContent } from "./conversationContents/ConversationToolResultContent.js";

type ConversationItemContentsProps = {
    message: IChatConversationLocalItem;
    groups: IChatMessagesGroup[];
    references: TextContentObject[];
    role: "user" | "assistant" | "tool";
    isLoading: boolean;
    isLast?: boolean;
};

export function ConversationItemContents({
    message,
    groups,
    references,
    isLoading,
    isLast,
}: ConversationItemContentsProps) {
    const {
        MessageTextContentComponent,
        MessageErrorContentComponent,
        MessageReasoningContentComponent,
        MessageMultipartContentComponent,
    } = useCustomization();
    const agents = useSelector(agentsSelector);
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
        const groupIndex = groups.findIndex((group) =>
            group.messages.some((m) => m.localId === message.localId),
        );
        const durationMs = getReasoningDurationMs(groups[groupIndex - 1], groups[groupIndex]);

        const foundAgent = agents?.find((a) => a.id === message.agentId);
        const agent = message.agentId ? { id: message.agentId, name: foundAgent?.title } : undefined;

        return (
            <MessageReasoningContentComponent
                summary={content.summary}
                objects={[...(content.objects ?? []), ...references]}
                durationMs={durationMs}
                agent={agent}
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
                isLast={isLast}
            />
        );
    }

    if (content.type === "clarifyingAnswers") {
        return (
            <ConversationClarifyingAnswersContent
                useMarkdown
                groups={groups}
                message={message}
                answers={content.answers}
                objects={[...(content.objects ?? []), ...references]}
                isLast={isLast}
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

    if (content.type === "skillsActivated") {
        return <ConversationSkillActivatedContent skills={content.skills} isLoading={isLoading} />;
    }

    return null;
}
