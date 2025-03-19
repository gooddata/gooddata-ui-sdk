// (C) 2024 GoodData Corporation

import { IGenAIChatInteraction } from "@gooddata/sdk-model";
import {
    Contents,
    makeAssistantMessage,
    makeErrorContents,
    makeRoutingContents,
    makeSearchContents,
    makeTextContents,
    makeUserMessage,
    makeVisualizationContents,
    Message,
} from "../../../model.js";
import { IGenAIChatEvaluation } from "@gooddata/sdk-backend-spi";

/**
 * Converts messages history to a message.
 */
export const interactionsToMessages = (interactions: IGenAIChatInteraction[]): Message[] => {
    return interactions.flatMap((interaction) => {
        const messages: Message[] = [];

        if (interaction.question) {
            // User question
            messages.push(makeUserMessage([makeTextContents(interaction.question)]));
        }

        const assistantMessageContents: Contents[] = processContents(interaction);

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

export const processContents = (item: IGenAIChatEvaluation | IGenAIChatInteraction): Contents[] => {
    const contents: Contents[] = [];

    if (item.routing?.reasoning) {
        contents.push(makeRoutingContents(item.routing.reasoning, item.routing.useCase));
    }

    if (item.textResponse) {
        contents.push(makeTextContents(item.textResponse));
    }

    if (item.foundObjects?.reasoning) {
        contents.push(makeSearchContents(item.foundObjects.reasoning, item.foundObjects.objects));
    }

    if (item.createdVisualizations?.reasoning) {
        contents.push(
            makeVisualizationContents(
                item.createdVisualizations.reasoning,
                item.createdVisualizations.objects,
            ),
        );
    }

    if (item.errorResponse) {
        contents.push(makeErrorContents(item.errorResponse));
    }

    return contents;
};
