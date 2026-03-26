// (C) 2024-2026 GoodData Corporation

import {
    type IChatConversationErrorContent,
    type IChatConversationLocalContent,
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
} from "../../model.js";
import { ConversationErrorContent } from "./conversationContents/ConversationErrorContent.js";
import { ConversationKdaContent } from "./conversationContents/ConversationKdaContent.js";
import { ConversationReasoningContent } from "./conversationContents/ConversationReasoningContent.js";
import { ConversationSearchContent } from "./conversationContents/ConversationSearchContent.js";
import { ConversationTextContent } from "./conversationContents/ConversationTextContent.js";
import { ConversationToolCallContent } from "./conversationContents/ConversationToolCallContent.js";
import { ConversationToolResultContent } from "./conversationContents/ConversationToolResultContent.js";
import { ConversationVisualizationContent } from "./conversationContents/ConversationVisualizationContent.js";
import { ConversationWhatIfContent } from "./conversationContents/ConversationWhatIfContent.js";

type ConversationItemContentsProps = {
    message: IChatConversationLocalItem;
    role: "user" | "assistant" | "tool";
    isLoading: boolean;
    isLast?: boolean;
};

export function ConversationItemContents({ message, isLoading, isLast }: ConversationItemContentsProps) {
    const content = message.content as IChatConversationLocalContent | IChatConversationErrorContent;

    if (content.type === "error") {
        return <ConversationErrorContent useMarkdown message={content.message} isLoading={isLoading} />;
    }

    if (content.type === "text") {
        return (
            <ConversationTextContent
                useMarkdown
                text={content.text}
                objects={content.objects ?? []}
                isLoading={isLoading}
            />
        );
    }

    if (content.type === "reasoning") {
        return (
            <ConversationReasoningContent
                useMarkdown
                summary={content.summary}
                objects={content.objects ?? []}
                isLoading={isLoading}
            />
        );
    }

    if (content.type === "multipart") {
        return (
            <>
                {content.parts?.map((part: IChatConversationMultipartLocalPart, index) => {
                    if (part.type === "text") {
                        return (
                            <ConversationTextContent
                                useMarkdown
                                key={index}
                                text={part.text}
                                objects={part.objects}
                            />
                        );
                    }
                    if (part.type === "visualization") {
                        return (
                            <ConversationVisualizationContent
                                useMarkdown
                                key={index}
                                message={message}
                                part={part}
                                visualization={part.visualization}
                                showSuggestions={isLast}
                            />
                        );
                    }
                    if (part.type === "searchResults") {
                        return (
                            <ConversationSearchContent
                                key={index}
                                results={part.searchResults}
                                relationships={part.relationships}
                                keywords={part.keywords}
                            />
                        );
                    }
                    if (part.type === "kda") {
                        return <ConversationKdaContent key={index} kda={part.kda} />;
                    }
                    if (part.type === "whatIf") {
                        return <ConversationWhatIfContent key={index} whatIf={part.whatIf} />;
                    }
                    // Add more multipart types if needed
                    return null;
                })}
            </>
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
