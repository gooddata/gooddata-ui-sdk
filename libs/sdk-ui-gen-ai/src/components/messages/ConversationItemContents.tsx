// (C) 2024-2026 GoodData Corporation

import { useIntl } from "react-intl";

import {
    type IChatConversationErrorContent,
    type IChatConversationLocalContent,
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    type TextContentObject,
} from "../../model.js";
import { loadWhatIfScenarios } from "../../whatIf/whatIfMapping.js";

import { ConversationAlertProposalContent } from "./conversationContents/ConversationAlertProposalContent.js";
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
    references: TextContentObject[];
    role: "user" | "assistant" | "tool";
    isLoading: boolean;
    isLast?: boolean;
};

export function ConversationItemContents({ message, references, isLoading }: ConversationItemContentsProps) {
    const intl = useIntl();
    const content = message.content as IChatConversationLocalContent | IChatConversationErrorContent;

    if (content.type === "error") {
        return (
            <ConversationErrorContent
                useMarkdown
                message={content.message}
                traceId={content.traceId}
                code={content.code}
                reason={content.reason}
                isLoading={isLoading}
            />
        );
    }

    if (content.type === "text") {
        return (
            <ConversationTextContent
                useMarkdown
                text={content.text}
                objects={[...(content.objects ?? []), ...references]}
                isLoading={isLoading}
            />
        );
    }

    if (content.type === "reasoning") {
        return (
            <ConversationReasoningContent
                useMarkdown
                summary={content.summary}
                objects={[...(content.objects ?? []), ...references]}
                isLoading={isLoading}
            />
        );
    }

    if (content.type === "multipart") {
        const whatIf = loadWhatIfScenarios(content);

        return (
            <>
                {content.parts?.map((part: IChatConversationMultipartLocalPart, index) => {
                    if (part.type === "text") {
                        return (
                            <ConversationTextContent
                                useMarkdown
                                key={index}
                                text={part.text}
                                objects={[...(part.objects ?? []), ...references]}
                            />
                        );
                    }
                    if (part.type === "alertProposal") {
                        return (
                            <ConversationAlertProposalContent
                                key={index}
                                message={message}
                                part={part}
                                alertProposal={part.alertProposal}
                                objects={[...(part.objects ?? []), ...references]}
                            />
                        );
                    }
                    if (part.type === "visualization" && !whatIf) {
                        return part.visualization ? (
                            <ConversationVisualizationContent
                                key={index}
                                message={message}
                                part={part}
                                visualization={part.visualization}
                            />
                        ) : (
                            <div key={index} className="gd-gen-ai-chat__messages__content--error">
                                {intl.formatMessage({ id: "gd.gen-ai.visualization.unavailable" })}
                            </div>
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
                        return (
                            <ConversationWhatIfContent
                                key={index}
                                message={message}
                                part={part}
                                whatIf={whatIf}
                            />
                        );
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
