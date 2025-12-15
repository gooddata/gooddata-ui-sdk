// (C) 2025 GoodData Corporation

import { type ReactNode, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

import { type ReasoningContents } from "../../model.js";

type ReasoningDropdownProps = {
    children: ReactNode;
    isComplete: boolean;
    lastReasoningStepTitle: string | undefined;
};

export function ReasoningDropdown({ children, isComplete, lastReasoningStepTitle }: ReasoningDropdownProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const intl = useIntl();

    const thoughtProcessText = intl.formatMessage({ id: "gd.gen-ai.routing.thinking-process" });
    const thinkingText = intl.formatMessage({ id: "gd.gen-ai.state.thinking" });
    const displayText = isComplete
        ? thoughtProcessText
        : lastReasoningStepTitle
          ? lastReasoningStepTitle + "..."
          : thinkingText + "...";

    // Announce reasoning intent changes to screen readers.
    // The parent log has aria-relevant="additions" which only announces new elements,
    // but we want to announce text updates (e.g., "Thinking..." → "Creating a visualization...")
    const liveRegionText = isComplete ? undefined : displayText;

    return (
        <div
            className={cx("gd-gen-ai-chat__thought-process-dropdown", {
                "gd-gen-ai-chat__thought-process-dropdown--loading": !isComplete,
            })}
        >
            {/* Visually hidden live region to announce reasoning intent changes */}
            <span className="gd-gen-ai-chat__visually__hidden" aria-live="polite" aria-atomic="true">
                {liveRegionText}
            </span>
            <UiButton
                onClick={() => setIsExpanded(!isExpanded)}
                accessibilityConfig={{ ariaExpanded: isExpanded }}
                iconBefore={isExpanded ? "navigateDown" : "navigateRight"}
                iconBeforeSize={12}
                label={displayText}
                variant="tertiary"
            />
            {isExpanded ? (
                <div className="gd-gen-ai-chat__thought-process-dropdown__content">
                    <div className="gd-gen-ai-chat__thought-process-dropdown__timeline" />
                    <div className="gd-gen-ai-chat__thought-process-dropdown__body">{children}</div>
                </div>
            ) : null}
        </div>
    );
}

/**
 * Gets the title of the last reasoning step across all reasoning items.
 */
export function getLastReasoningStepTitle(reasoningItems: ReasoningContents[]): string | undefined {
    // Iterate from the end to find the last step with a title
    for (let i = reasoningItems.length - 1; i >= 0; i--) {
        const steps = reasoningItems[i].steps;
        if (steps?.length) {
            // Find the last step with a non-empty title
            for (let j = steps.length - 1; j >= 0; j--) {
                if (steps[j].title) {
                    return steps[j].title;
                }
            }
        }
    }
    return undefined;
}
