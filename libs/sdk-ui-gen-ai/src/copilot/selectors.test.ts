// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { selectCopilotGenerationPending, selectCopilotStatus } from "./selectors.js";
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
});
