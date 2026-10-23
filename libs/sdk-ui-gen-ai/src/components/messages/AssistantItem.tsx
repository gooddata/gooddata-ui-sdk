// (C) 2024-2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { insightTitle } from "@gooddata/sdk-model";

import {
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    type TextContentObject,
} from "../../model.js";
import { interactionIntelligenceEnabledSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { isClarificationQuestionsItem } from "../../utils.js";
import { replaceReferences } from "../completion/references.js";
import { useToolsReferences } from "../completion/useToolsReferences.js";
import { useCustomization } from "../CustomizationContext.js";
import { useInteractionIntelligenceTotals } from "../intelligence/data/useInteractionIntelligenceTotals.js";
import { GenAiInteractionIntelligence } from "../intelligence/GenAiInteractionIntelligence.js";
import { InteractionIntelligenceTrigger } from "../intelligence/InteractionIntelligenceTrigger.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";
import { removeMarkdown } from "../utils/markdownUtils.js";

import { AssistantItemSuggestions } from "./AssistantItemSuggestions.js";
import { ReasoningIcon } from "./contents/ReasoningIcon.js";
import { ConversationItemContents } from "./ConversationItemContents.js";
import { getItemState } from "./itemState.js";

type AssistantItemProps = {
    groups: IChatMessagesGroup[];
    message: IChatConversationLocalItem;
    isLast?: boolean;
};

export function AssistantItemComponent({ message, groups, isLast }: AssistantItemProps) {
    const intl = useIntl();
    const group = groups[groups.length - 1];

    const messageState = getItemState(message);
    const references = useToolsReferences(groups);
    const { FeedbackComponent } = useCustomization();
    const [isInteractionIntelligenceOpen, setIsInteractionIntelligenceOpen] = useState(false);
    const interactionIntelligenceEnabled = useSelector(interactionIntelligenceEnabledSelector);
    const showInteractionIntelligence =
        interactionIntelligenceEnabled && !!message.responseId && message.content.type !== "reasoning";
    const interactionIntelligenceTotals = useInteractionIntelligenceTotals(
        showInteractionIntelligence ? message.responseId : "",
    );
    // The trigger only renders once its totals exist, so this is what actually shares the actions
    // row with feedback — a message with no trace keeps its feedback exactly as before.
    const hasInteractionIntelligenceTrigger = showInteractionIntelligence && !!interactionIntelligenceTotals;

    const classNames = cx(
        "gd-gen-ai-chat__messages__conversation",
        "gd-gen-ai-chat__messages__conversation--assistant",
        `gd-gen-ai-chat__messages__conversation--${message.content.type}`,
        messageState === "cancelled" && "gd-gen-ai-chat__messages__conversation--cancelled",
        isLast && "gd-gen-ai-chat__messages__conversation--isLast",
    );

    //NOTE: For now we want to hide all tool calls
    if (message.content.type === "toolCall" || message.content.type === "toolResult") {
        return null;
    }
    //NOTE: For now we want to hide all reasoning messages without summary
    if (message.content.type === "reasoning" && !message.content.summary) {
        return null;
    }
    //NOTE: For now remove feedback on clarification questions that are filled
    const isFilledClarificationQuestion = isClarificationQuestionsItem(message) && message.filled;

    return (
        <div
            className={classNames}
            data-state={messageState}
            data-testid="gen-ai-conversation-assistant-message"
        >
            <span className="gd-gen-ai-chat__visually__hidden">
                {intl.formatMessage({ id: "gd.gen-ai.message.label.assistant" })}
            </span>
            <ReasoningIcon content={message.content} />
            <ConversationItemContents
                role="assistant"
                message={message}
                groups={groups}
                references={references}
                isLoading={messageState === "loading"}
                isLast={isLast}
            />
            <AssistantItemSuggestions
                type="followUp"
                message={message}
                showSuggestions
                references={references}
            />
            <div className="gd-gen-ai-chat__conversation__item__actions">
                {group.type === "assistant" &&
                message.content.type !== "reasoning" &&
                message.content.type !== "skillsActivated" &&
                !isFilledClarificationQuestion ? (
                    <FeedbackComponent
                        group={group}
                        message={message}
                        isLast={Boolean(isLast)}
                        isComplete={Boolean(message.complete)}
                        isHidden={Boolean(hasInteractionIntelligenceTrigger && !isLast)}
                    />
                ) : null}
                {showInteractionIntelligence ? (
                    <InteractionIntelligenceTrigger
                        totals={interactionIntelligenceTotals}
                        isOpen={isInteractionIntelligenceOpen}
                        onToggle={() => setIsInteractionIntelligenceOpen((current) => !current)}
                    />
                ) : null}
            </div>
            {showInteractionIntelligence && isInteractionIntelligenceOpen ? (
                <GenAiInteractionIntelligence
                    responseId={message.responseId}
                    onClose={() => setIsInteractionIntelligenceOpen(false)}
                />
            ) : null}
            <AssistantItemSuggestions type="actions" message={message} showSuggestions={isLast} />
            <AssistantItemAnnouncement message={message} references={references} isLast={isLast} />
        </div>
    );
}

type AssistantItemAnnouncementProps = {
    message: IChatConversationLocalItem;
    references: TextContentObject[];
    isLast?: boolean;
};

function AssistantItemAnnouncement({ message, references, isLast }: AssistantItemAnnouncementProps) {
    if (!isLast) {
        return null;
    }

    const isStreamedAnswer = getItemState(message) === "complete" && message.streaming === false;

    return (
        <span className="gd-gen-ai-chat__visually__hidden" aria-live="polite" aria-atomic="true">
            {isStreamedAnswer ? getAnswerText(message.content, references) : ""}
        </span>
    );
}

function getAnswerText(content: IChatConversationLocalItem["content"], references: TextContentObject[]) {
    const parts: (IChatConversationMultipartLocalPart | typeof content)[] =
        content.type === "multipart" ? (content.parts ?? []) : [content];
    return parts
        .map((part) => {
            if (part.type === "text") {
                return removeMarkdown(replaceReferences(part.text, [...(part.objects ?? []), ...references]));
            }
            if (part.type === "visualization" && part.visualization) {
                return insightTitle(part.visualization);
            }
            return undefined;
        })
        .filter(Boolean)
        .join(" ");
}
