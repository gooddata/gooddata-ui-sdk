// (C) 2024 GoodData Corporation

import { IGenAIChatInteraction } from "@gooddata/sdk-model";
import {
    isAssistantErrorMessage,
    isAssistantSearchCreateMessage,
    isAssistantTextMessage,
    isSystemMessage,
    isUserMessage,
    Message,
} from "../../../model.js";

export const messagesToHistory = (messages: Message[]): IGenAIChatInteraction[] => {
    return messages.map((message) => {
        if (isUserMessage(message)) {
            return {
                role: "USER",
                content: [
                    {
                        text: message.content,
                        includeToChatContext: true,
                        userFeedback: "NONE" as const,
                    },
                ],
            };
        }

        if (isSystemMessage(message)) {
            throw new Error("TODO: implement system message conversion");
        }

        if (isAssistantTextMessage(message)) {
            return {
                role: "AI",
                content: [
                    {
                        text: message.content,
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
                        text: `ERROR: ${message.content}`,
                        includeToChatContext: true,
                        userFeedback: "NONE" as const,
                    },
                ],
            };
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
                    : (message.content.foundObjects ?? []).map((foundObject) => ({
                          foundObject,
                          includeToChatContext: true,
                          userFeedback: "NONE" as const,
                      })),
            };
        }

        return assertNever(message);
    });
};

const assertNever = (value: never): never => {
    throw new Error(`Unexpected object: ${value}`);
};
