// (C) 2024-2025 GoodData Corporation

import type { IGenAIChatEvaluation } from "@gooddata/sdk-backend-spi";
import type { IGenAIChatInteraction } from "@gooddata/sdk-model";

import {
    type Contents,
    type Message,
    makeAssistantMessage,
    makeChangeAnalysisContents,
    makeErrorContents,
    makeReasoningContents,
    makeRoutingContents,
    makeSearchContents,
    makeSemanticSearchContents,
    makeTextContents,
    makeUserMessage,
    makeVisualizationContents,
} from "../../../model.js";

/**
 * Options for processing interactions to messages.
 */
export type InteractionsToMessagesOptions = {
    /**
     * Whether to show reasoning in the message contents.
     * Controlled by the EnableGenAIReasoningVisibility feature flag.
     */
    showReasoning?: boolean;
};

/**
 * Converts messages history to a message.
 */
export const interactionsToMessages = (
    interactions: IGenAIChatInteraction[],
    options: InteractionsToMessagesOptions = {},
): Message[] => {
    return interactions.flatMap((interaction) => {
        const messages: Message[] = [];

        if (interaction.question) {
            // User question
            messages.push(makeUserMessage([makeTextContents(interaction.question, [])]));
        }

        const assistantMessageContents: Contents[] = processContents(interaction, undefined, options);

        if (assistantMessageContents.length) {
            messages.push(
                makeAssistantMessage(
                    assistantMessageContents,
                    interaction.interactionFinished,
                    interaction.chatHistoryInteractionId,
                    interaction.userFeedback,
                ),
            );
        }

        return messages;
    });
};

export const processContents = (
    item: IGenAIChatEvaluation | IGenAIChatInteraction,
    arrived?: boolean,
    options: InteractionsToMessagesOptions = {},
): Contents[] => {
    const { showReasoning = false } = options;
    const contents: Contents[] = [];

    if (showReasoning && item.reasoning?.steps && item.reasoning.steps.length > 0) {
        contents.push(
            makeReasoningContents(
                item.reasoning.steps.map((step) => ({
                    title: step.title,
                    thoughts: step.thoughts?.map((thought) => ({ text: thought.text })),
                })),
            ),
        );
    } else if (!showReasoning && item.routing?.reasoning) {
        contents.push(makeRoutingContents(item.routing.reasoning, item.routing.useCase));
    }

    let primaryText: string | undefined;
    if (showReasoning) {
        const textResponse = item.textResponse?.trim();
        const reasoningAnswer = item.reasoning?.answer?.trim();
        primaryText = reasoningAnswer || textResponse || undefined;
        const hasSemanticSearch = Boolean(item.semanticSearch);
        const hasFoundObjects = Boolean(item.foundObjects?.reasoning);
        const hasVisualizations = Boolean(item.createdVisualizations?.reasoning);
        const shouldRenderStandaloneText = !hasSemanticSearch && !hasFoundObjects && !hasVisualizations;

        if (shouldRenderStandaloneText && primaryText) {
            contents.push(makeTextContents(primaryText, []));
        }
    } else if (item.textResponse) {
        contents.push(makeTextContents(item.textResponse, []));
    }

    if (item.semanticSearch) {
        const semanticSearch =
            showReasoning && primaryText
                ? { ...item.semanticSearch, reasoning: primaryText }
                : item.semanticSearch;
        contents.push(makeSemanticSearchContents(semanticSearch));
    } else if (item.foundObjects?.reasoning) {
        const reasoning = showReasoning && primaryText ? primaryText : item.foundObjects.reasoning;
        contents.push(makeSearchContents(reasoning, item.foundObjects.objects));
    }

    if (item.createdVisualizations?.reasoning) {
        const reasoning = showReasoning && primaryText ? primaryText : item.createdVisualizations.reasoning;
        contents.push(
            makeVisualizationContents(
                reasoning,
                item.createdVisualizations.objects?.map((obj) => ({
                    ...obj,
                    ...(arrived
                        ? {
                              statusReportPending: true,
                          }
                        : {}),
                })),
            ),
        );
    }

    if (item.changeAnalysisParams) {
        contents.push(makeChangeAnalysisContents(item.changeAnalysisParams));
    }

    if (item.errorResponse) {
        contents.push(makeErrorContents(item.errorResponse));
    }

    return contents;
};
