// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type AiConversationItemResponse } from "@gooddata/api-client-tiger";
import {
    type IChatConversationMultipartContent,
    type IChatConversationWhatIfContent,
} from "@gooddata/sdk-backend-spi";

import { convertChatConversationItemFromBackend } from "../genAIConvertor.js";

describe("genAIConvertor", () => {
    const dateNormalizer = vi.fn((val) => val);

    describe("convertWhatIf", () => {
        it("should correctly convert AiWhatIfScenario to IChatWhatIfDefinition", () => {
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-id",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "whatIf",
                            whatIf: {
                                includeBaseline: true,
                                scenarios: [
                                    {
                                        label: "Scenario 1",
                                        adjustments: [
                                            {
                                                metricId: "metric-1",
                                                metricType: "metric",
                                                scenarioMaql: "SELECT {metric-1} * 1.1",
                                            },
                                            {
                                                metricId: "metric-2",
                                                metricType: "fact", // Should be converted to fact (actually kept as is if not metric, but in code it says (a.metricType === 'metric' ? 'measure' : a.metricType))
                                                scenarioMaql: "SELECT {metric-2} * 1.2",
                                            },
                                        ],
                                    },
                                ],
                                visualizationRef: "",
                            },
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], dateNormalizer);
            const whatIfPart = (converted.content as IChatConversationMultipartContent)
                .parts[0] as IChatConversationWhatIfContent;

            expect(whatIfPart.type).toBe("whatIf");
            expect(whatIfPart.whatIf).toEqual({
                includeBaseline: true,
                scenarios: [
                    {
                        label: "Scenario 1",
                        adjustments: [
                            {
                                scenarioMaql: "SELECT {metric-1} * 1.1",
                                ref: {
                                    identifier: "metric-1",
                                    type: "measure",
                                },
                            },
                            {
                                scenarioMaql: "SELECT {metric-2} * 1.2",
                                ref: {
                                    identifier: "metric-2",
                                    type: "fact",
                                },
                            },
                        ],
                    },
                ],
            });
        });
    });
});
