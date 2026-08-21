// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IAgent, type IAgentInstruction, idRef } from "@gooddata/sdk-model";

import { convertAgentPatchToBackend, convertAgentToBackend } from "../AgentConverter.js";

const rule: IAgentInstruction = {
    title: "Sales",
    content: "Show both Total Sales and Total Net Sales.",
    strategy: "ALWAYS",
    isDisabled: false,
};

const agent = (instructions?: IAgentInstruction[]): IAgent => ({
    ref: idRef("agent1"),
    name: "Agent",
    ...(instructions ? { instructions } : {}),
});

describe("convertAgentToBackend — instructions", () => {
    it("sends the instructions as an attribute", () => {
        expect(convertAgentToBackend(agent([rule])).data.attributes?.instructions).toEqual([rule]);
    });

    it("sends an empty array when there are none, so a save clears what the backend holds", () => {
        expect(convertAgentToBackend(agent()).data.attributes?.instructions).toEqual([]);
        expect(convertAgentToBackend(agent([])).data.attributes?.instructions).toEqual([]);
    });

    it("keeps an undefined isDisabled undefined", () => {
        const [converted] = convertAgentToBackend(agent([{ ...rule, isDisabled: undefined }])).data
            .attributes!.instructions!;
        expect(converted.isDisabled).toBeUndefined();
    });
});

describe("convertAgentPatchToBackend — instructions", () => {
    it("omits the field when the patch does not carry it, leaving stored instructions alone", () => {
        const attributes = convertAgentPatchToBackend({ ref: idRef("agent1"), enabled: true }).data
            .attributes;
        expect(attributes).not.toHaveProperty("instructions");
    });

    it("sends the list when the patch carries one", () => {
        const attributes = convertAgentPatchToBackend({
            ref: idRef("agent1"),
            instructions: [rule],
        }).data.attributes;
        expect(attributes?.instructions).toEqual([rule]);
    });
});
