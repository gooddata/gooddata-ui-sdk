// (C) 2025-2026 GoodData Corporation

import { useSelector } from "react-redux";

import { type Contents, isReasoningContents } from "../../model.js";
import { ReasoningContentsComponent } from "./contents/ReasoningContents.js";
import { type AssistantMessageState } from "./messageState.js";
import { ReasoningDropdown, getLastReasoningStepTitle } from "./ReasoningDropdown.js";
import { settingsSelector } from "../../store/chatWindow/chatWindowSelectors.js";

interface IReasoningMessageProps {
    content: Contents[];
    messageState: AssistantMessageState;
}

export function ReasoningMessage({ content, messageState }: IReasoningMessageProps) {
    const settings = useSelector(settingsSelector);
    const isReasoningEnabled = Boolean(settings?.enableGenAIReasoningVisibility);

    const isComplete =
        messageState === "complete" || messageState === "cancelled" || messageState === "error";

    // Collect reasoning items for the dropdown
    const reasoningItems = content.filter(isReasoningContents);

    // Treat dropdown as "complete" once any real (non-reasoning) answer content exists
    const hasRenderedAnswer = content.some((item) => {
        if (item.type === "reasoning") return false;
        if (item.type === "routing") return false; // routing is hidden when reasoning FF is enabled

        if (item.type === "text" || item.type === "error") {
            return item.text.trim().length > 0;
        }

        // search / semanticSearch / visualization / changeAnalysis => all render meaningful output
        return true;
    });

    const isReasoningFinished = isComplete || hasRenderedAnswer;

    // Show dropdown when reasoning is enabled and (response is still streaming or contains reasoning items)
    const shouldShowDropdown = isReasoningEnabled && (!isReasoningFinished || reasoningItems.length > 0);

    if (!shouldShowDropdown) {
        return null;
    }

    // Count reasoning steps
    const totalReasoningSteps = reasoningItems.reduce((sum, item) => sum + (item.steps?.length ?? 0), 0);

    // Get the title of the last reasoning step
    const lastReasoningStepTitle = getLastReasoningStepTitle(reasoningItems);

    // Show placeholder when streaming and no reasoning yet
    const showThinkingPlaceholder = !isReasoningFinished && totalReasoningSteps === 0;

    return (
        <ReasoningDropdown
            isReasoningFinished={isReasoningFinished}
            lastReasoningStepTitle={lastReasoningStepTitle}
        >
            {/* Show placeholder while waiting for reasoning */}
            {showThinkingPlaceholder ? <div className="gd-gen-ai-chat__reasoning"></div> : null}
            {/* Show reasoning steps once available */}
            {reasoningItems.map((item, index) => (
                <ReasoningContentsComponent key={`reasoning-${index}`} content={item} />
            ))}
        </ReasoningDropdown>
    );
}
