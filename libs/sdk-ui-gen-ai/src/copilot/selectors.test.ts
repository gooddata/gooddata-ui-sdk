// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    selectCopilotGenerationPending,
    selectCopilotReasoningTitle,
    selectCopilotReplyThreadId,
    selectCopilotStatus,
} from "./selectors.js";
import { createCopilotState } from "./transitions.js";
import { CopilotBuildType, type ICopilotInteraction, type ICopilotSnapshot } from "./types.js";

const type = CopilotBuildType.Dashboard;
const create = { type, intent: "create" as const };
const edit = { type, intent: "edit" as const };
function state(
    overrides: Partial<ICopilotSnapshot> = {},
    interaction: Partial<ICopilotInteraction> = {},
): ICopilotSnapshot {
    const initial = createCopilotState();
    return { ...initial, ...overrides, interaction: { ...initial.interaction, ...interaction } };
}

describe("pure copilot progress selectors", () => {
    it("only presents reasoning from the scoped workflow owner, preserving unscoped queries", () => {
        const snapshot = state(
            {
                requests: [
                    {
                        revision: 1,
                        type,
                        objectId: "object",
                        threadId: "owner",
                        intent: "create",
                        responseFinished: true,
                        applicationIds: [],
                    },
                ],
            },
            { threadId: "other", reasoningTitle: "Other chat" },
        );
        const scope = { type, objectId: "object" };
        expect(selectCopilotReasoningTitle(snapshot)).toBe("Other chat");
        expect(selectCopilotReasoningTitle(snapshot, scope)).toBeUndefined();
        const foreground = { ...snapshot, interaction: { ...snapshot.interaction, threadId: "owner" } };
        expect(selectCopilotReasoningTitle(foreground, scope)).toBe("Other chat");
        expect(selectCopilotReasoningTitle(foreground, { type, objectId: "different" })).toBeUndefined();
        const superseded = {
            ...foreground,
            requests: snapshot.requests.map((request) => ({ ...request, superseded: true })),
        };
        expect(selectCopilotReasoningTitle(superseded, scope)).toBeUndefined();
        expect(selectCopilotStatus(superseded, scope)).toBe("idle");
        expect(selectCopilotGenerationPending(superseded, type)).toBe(false);
    });

    it("keeps startup reasoning available until a request owns generation", () => {
        const snapshot = state({ generation: type }, { threadId: "owner", reasoningTitle: "Starting" });
        expect(selectCopilotReasoningTitle(snapshot, { type })).toBe("Starting");
        const activated = state({}, { build: create, threadId: "owner", reasoningTitle: "Building" });
        expect(selectCopilotReasoningTitle(activated, { type })).toBe("Building");
    });

    it.each([
        [state(), false, "idle"],
        [state(), true, "idle"],
        [state({ generation: type }), false, "generating"],
        [state({ generation: type }), true, "generating"],
        [state({}, { pendingClarificationIds: ["unrelated"] }), false, "idle"],
        [state({}, { pendingClarificationIds: ["unrelated"] }), true, "idle"],
        [state({}, { build: create }), false, "building"],
        [state({}, { build: create }), true, "building"],
        [state({}, { build: edit }), false, "idle"],
        [state({}, { build: edit }), true, "building"],
        [state({ generation: type }, { build: create }), true, "building"],
        [state({ generation: type }, { pendingClarificationIds: ["q"] }), false, "waiting"],
        [state({}, { build: create, pendingClarificationIds: ["q"] }), false, "waiting"],
        [state({ generation: type }, { build: create, pendingClarificationIds: ["q"] }), false, "waiting"],
        [state({ generation: type }, { waitingForUserInput: true }), false, "waiting"],
        [state({}, { build: edit, waitingForUserInput: true }), true, "waiting"],
    ] as const)("derives progress without host builder presentation %#", (snapshot, isBuilder, expected) => {
        expect(selectCopilotStatus(snapshot, { type, isBuilder })).toBe(expected);
    });

    it("prioritizes scoped activated edits over foreground progress and keeps reasoning readable", () => {
        const snapshot = state(
            {
                generation: type,
                requests: [
                    {
                        revision: 1,
                        type,
                        objectId: "object",
                        awaitingClarification: true,
                        applicationIds: [],
                    },
                    { revision: 2, applicationIds: [] },
                ],
            },
            { reasoningTitle: "Planning" },
        );
        expect(selectCopilotStatus(snapshot, { type, objectId: "object", isEditing: true })).toBe("waiting");
        expect(snapshot.interaction.reasoningTitle).toBe("Planning");
        expect(
            selectCopilotStatus(
                {
                    ...snapshot,
                    requests: [
                        ...snapshot.requests,
                        {
                            revision: 3,
                            type,
                            objectId: "object",
                            applicationIds: [],
                        },
                    ],
                },
                { type, objectId: "object", isEditing: true },
            ),
        ).toBe("building");
        expect(selectCopilotStatus(snapshot, { type, objectId: "unrelated", isEditing: true })).toBe(
            "generating",
        );
    });

    it("only creation builds retain generation-pending intent", () => {
        expect(selectCopilotGenerationPending(state({}, { build: create }), type)).toBe(true);
        expect(selectCopilotGenerationPending(state({}, { build: edit }), type)).toBe(false);
    });

    it("replies to the newest scoped wait, excluding unrelated or still-applying requests", () => {
        const snapshot: ICopilotSnapshot<string> = {
            ...state({}, { threadId: "foreground" }),
            requests: [
                {
                    revision: 1,
                    type,
                    objectId: "object",
                    threadId: "clarification",
                    awaitingClarification: true,
                    applicationIds: [],
                },
                {
                    revision: 2,
                    type,
                    objectId: "object",
                    threadId: "reply",
                    responseFinished: true,
                    applicationIds: [],
                },
                {
                    revision: 3,
                    type,
                    objectId: "other",
                    threadId: "other",
                    responseFinished: true,
                    applicationIds: [],
                },
                {
                    revision: 4,
                    type: "visualization",
                    threadId: "visualization",
                    awaitingClarification: true,
                    applicationIds: [],
                },
                {
                    revision: 5,
                    type,
                    objectId: "object",
                    threadId: "applying",
                    responseFinished: true,
                    applicationIds: ["application"],
                },
            ],
        };
        expect(selectCopilotReplyThreadId(snapshot, { type, objectId: "object", isEditing: true })).toBe(
            "reply",
        );
        expect(selectCopilotReplyThreadId(snapshot, { type, objectId: "other", isEditing: true })).toBe(
            "other",
        );
        expect(selectCopilotReplyThreadId(snapshot, { type, objectId: "unrelated", isEditing: true })).toBe(
            "foreground",
        );
        expect(selectCopilotReplyThreadId(snapshot, { type, objectId: "object" })).toBe("foreground");
        expect(selectCopilotStatus(snapshot, { type, objectId: "object", isEditing: true })).toBe("building");
    });

    it("uses the local conversation when a waiting workflow has no server thread yet", () => {
        const snapshot = state(
            {
                requests: [
                    {
                        revision: 1,
                        type,
                        conversationId: "local",
                        intent: "create",
                        responseFinished: true,
                        applicationIds: [],
                    },
                ],
            },
            { threadId: "foreground" },
        );
        expect(selectCopilotReplyThreadId(snapshot, { type })).toBe("local");
        expect(selectCopilotStatus(snapshot, { type })).toBe("waiting");
    });
});
