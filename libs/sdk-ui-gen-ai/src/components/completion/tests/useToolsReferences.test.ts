// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IChatConversationToolResultContent } from "@gooddata/sdk-backend-spi";

import { type IChatMessagesGroup } from "../../utils/groupUtility.js";
import { useToolsReferences } from "../useToolsReferences.js";

describe("useToolsReferences", () => {
    function toolResult(result: unknown): IChatConversationToolResultContent {
        return {
            type: "toolResult",
            callId: "tool-call-id",
            result: result as object,
        };
    }

    it("should extract and merge references from parsed_objects, objects and data.metrics", () => {
        const group = {
            type: "reasoning",
            messages: [
                {
                    role: "tool",
                    content: toolResult({
                        parsed_objects: [
                            {
                                object_id: "m.id",
                                object_type: "metric",
                                raw_match: "{metric/m.id}",
                            },
                        ],
                        objects: [
                            {
                                id: "m.id",
                                type: "metric",
                                title: "Revenue",
                                description: "",
                            },
                            {
                                id: "d.id",
                                type: "attribute",
                                final_type: "dashboard",
                                title: "Executive Overview",
                                description: "",
                            },
                        ],
                        data: {
                            metrics: [
                                {
                                    id: "f.id",
                                    type: "fact",
                                    attributes: { title: "Fact title" },
                                },
                            ],
                        },
                    }),
                },
            ],
        } as IChatMessagesGroup;

        const { result } = renderHook(() => useToolsReferences([undefined, group]));

        expect(result.current).toEqual([
            { type: "metric", id: "m.id", title: "Revenue" },
            { type: "dashboard", id: "d.id", title: "Executive Overview" },
            { type: "fact", id: "f.id", title: "Fact title" },
        ]);
    });

    it("should ignore non-toolResult and string tool result payload", () => {
        const group = {
            type: "reasoning",
            messages: [
                {
                    role: "assistant",
                    content: {
                        type: "text",
                        text: "Hello",
                        objects: [],
                    },
                },
                {
                    role: "tool",
                    content: toolResult("plain text result"),
                },
            ],
        };

        const { result } = renderHook(() => useToolsReferences([undefined as never, group as never]));

        expect(result.current).toEqual([]);
    });
});
