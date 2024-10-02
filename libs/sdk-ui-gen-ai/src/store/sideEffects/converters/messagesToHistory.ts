// (C) 2024 GoodData Corporation

import { IGenAIChatInteraction } from "@gooddata/sdk-model";
import {
    isAssistantCancelledMessage,
    isAssistantErrorMessage,
    isAssistantSearchCreateMessage,
    isAssistantTextMessage,
    isSystemTextMessage,
    isUserTextMessage,
    Message,
} from "../../../model.js";

export const messagesToHistory = (messages: Message[]): IGenAIChatInteraction[] => {
    return messages
        .map((message): IGenAIChatInteraction | null => {
            if (isUserTextMessage(message)) {
                if (message.content.cancelled) {
                    // Do not send cancelled message to history
                    return null;
                }

                return {
                    role: "USER",
                    content: [
                        {
                            text: message.content.text,
                            includeToChatContext: true,
                            userFeedback: "NONE" as const,
                        },
                    ],
                };
            }

            if (isSystemTextMessage(message)) {
                // Server does not accept system messages
                return null;
            }

            if (isAssistantTextMessage(message)) {
                return {
                    role: "AI",
                    content: [
                        {
                            text: message.content.text,
                            includeToChatContext: true,
                            userFeedback: "NONE" as const,
                        },
                    ],
                };
            }

            if (isAssistantErrorMessage(message)) {
                return {
                    role: "AI",
                    content: [
                        {
                            // This is not localized, as it's an error for AI, not for the user
                            text: `ERROR: ${message.content.error ?? "Unknown error"}`,
                            includeToChatContext: true,
                            userFeedback: "NONE" as const,
                        },
                    ],
                };
            }

            if (isAssistantCancelledMessage(message)) {
                // Do not send cancelled message to history
                return null;
            }

            if (isAssistantSearchCreateMessage(message)) {
                const firstVis = message.content.createdVisualizations?.objects?.[0];

                // Chat hallucinates when you provide both createdVisualizations and foundObjects
                // So, deliver the first created vis and if none - deliver found objects
                return {
                    role: "AI",
                    content: firstVis
                        ? [
                              {
                                  createdVisualization: firstVis,
                                  includeToChatContext: true,
                                  userFeedback: "NONE" as const,
                              },
                          ]
                        : (message.content.foundObjects?.objects ?? []).map((foundObject) => ({
                              foundObject,
                              includeToChatContext: true,
                              userFeedback: "NONE" as const,
                          })),
                };
            }

            return assertNever(message);
        })
        .filter<IGenAIChatInteraction>((x): x is IGenAIChatInteraction => !!x);
};

const assertNever = (value: never): never => {
    throw new Error(`Unexpected object: ${value}`);
};
