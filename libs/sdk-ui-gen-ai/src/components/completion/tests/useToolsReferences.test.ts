// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    type IChatConversationToolCallContent,
    type IChatConversationToolResultContent,
} from "@gooddata/sdk-backend-spi";

import { type IChatMessagesGroup } from "../../utils/groupUtility.js";
import { useToolsReferences } from "../useToolsReferences.js";

describe("useToolsReferences", () => {
    function toolResult(result: unknown, callId = "tool-call-id"): IChatConversationToolResultContent {
        return {
            type: "toolResult",
            callId,
            result: result as object,
        };
    }

    function toolCall(callId: string, name: string): IChatConversationToolCallContent {
        return {
            type: "toolCall",
            callId,
            name,
        } as any;
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

        const { result } = renderHook(() => useToolsReferences([group]));

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

        const { result } = renderHook(() => useToolsReferences([group as never]));

        expect(result.current).toEqual([]);
    });

    it("should ignore system/error messages and keep first non-empty title for duplicate reference", () => {
        const group = {
            type: "reasoning",
            messages: [
                {
                    role: "assistant",
                    content: {
                        type: "system",
                        text: "System info",
                    },
                },
                {
                    role: "assistant",
                    content: {
                        type: "error",
                        message: "Error info",
                    },
                },
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
                        ],
                    }),
                },
                {
                    role: "tool",
                    content: toolResult({
                        objects: [
                            {
                                id: "m.id",
                                type: "metric",
                                title: "",
                                description: "",
                            },
                        ],
                    }),
                },
            ],
        } as IChatMessagesGroup;

        const { result } = renderHook(() => useToolsReferences([group]));

        expect(result.current).toEqual([{ type: "metric", id: "m.id", title: "Revenue" }]);
    });

    it("should extract references from get_dashboard_context tool result", () => {
        const group = {
            type: "reasoning",
            messages: [
                {
                    role: "assistant",
                    content: toolCall("call-1", "get_dashboard_context"),
                },
                {
                    role: "tool",
                    content: toolResult(
                        {
                            dashboard: {
                                id: "dash-id",
                                title: "Dashboard Title",
                                widgets: [
                                    {
                                        widget_type: "insight",
                                        visualization_id: "vis-1",
                                        title: "Insight Title",
                                    },
                                    {
                                        widget_type: "visualization_switcher",
                                        active_visualization_id: "vis-active",
                                        title: "Switcher Title",
                                        visualization_ids: ["vis-2"],
                                        visualizations: [
                                            {
                                                visualization_id: "vis-3",
                                                title: "Vis 3 Title",
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                        "call-1",
                    ),
                },
            ],
        } as IChatMessagesGroup;

        const { result } = renderHook(() => useToolsReferences([group]));

        expect(result.current).toEqual([
            { type: "dashboard", id: "dash-id", title: "Dashboard Title" },
            { type: "visualization", id: "vis-1", title: "Insight Title" },
            { type: "visualization", id: "vis-active", title: "Switcher Title" },
            { type: "visualization", id: "vis-2", title: "vis-2" },
            { type: "visualization", id: "vis-3", title: "Vis 3 Title" },
        ]);
    });

    it("should extract references from get_object_with_children tool result", () => {
        const group = {
            type: "reasoning",
            messages: [
                {
                    role: "assistant",
                    content: toolCall("call-2", "get_object_with_children"),
                },
                {
                    role: "tool",
                    content: toolResult(
                        {
                            parent: {
                                id: "parent-id",
                                type: "metric",
                                title: "Parent Metric",
                            },
                            children: [
                                {
                                    id: "child-id",
                                    type: "attribute",
                                    title: "Child Attribute",
                                },
                            ],
                        },
                        "call-2",
                    ),
                },
            ],
        } as IChatMessagesGroup;

        const { result } = renderHook(() => useToolsReferences([group]));

        expect(result.current).toEqual([
            { type: "metric", id: "parent-id", title: "Parent Metric" },
            { type: "attribute", id: "child-id", title: "Child Attribute" },
        ]);
    });

    it("should default title to id if title is missing", () => {
        const group = {
            type: "reasoning",
            messages: [
                {
                    role: "tool",
                    content: toolResult({
                        objects: [
                            {
                                id: "obj-1",
                                type: "metric",
                                description: "",
                            },
                        ],
                    }),
                },
            ],
        } as IChatMessagesGroup;

        const { result } = renderHook(() => useToolsReferences([group]));

        expect(result.current).toEqual([{ type: "metric", id: "obj-1", title: "obj-1" }]);
    });

    it("should correctly map tool results to tool calls by callId", () => {
        const group = {
            type: "reasoning",
            messages: [
                {
                    role: "assistant",
                    content: toolCall("call-1", "get_dashboard_context"),
                },
                {
                    role: "tool",
                    content: toolResult(
                        {
                            dashboard: {
                                id: "dash-id",
                                title: "Dashboard Title",
                            },
                        },
                        "call-wrong",
                    ),
                },
            ],
        } as IChatMessagesGroup;

        const { result } = renderHook(() => useToolsReferences([group]));

        expect(result.current).toEqual([]);
    });
});
