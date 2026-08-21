// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type JsonApiAgentOutWithLinks } from "@gooddata/api-client-tiger";

import { convertAgent } from "../AgentConverter.js";

function agentOut(instructions?: unknown): JsonApiAgentOutWithLinks {
    return {
        id: "agent1",
        type: "agent",
        attributes: { name: "Agent", ...(instructions === undefined ? {} : { instructions }) },
    } as JsonApiAgentOutWithLinks;
}

describe("convertAgent — instructions", () => {
    it("maps instructions across", () => {
        const converted = convertAgent(
            agentOut([{ title: "Sales", content: "Show net too.", strategy: "ALWAYS", isDisabled: false }]),
        );
        expect(converted.instructions).toEqual([
            { title: "Sales", content: "Show net too.", strategy: "ALWAYS", isDisabled: false },
        ]);
    });

    it("normalizes nullable title and isDisabled to undefined", () => {
        const [converted] = convertAgent(
            agentOut([{ title: null, content: "rule", strategy: "AUTO", isDisabled: null }]),
        ).instructions!;
        expect(converted.title).toBeUndefined();
        expect(converted.isDisabled).toBeUndefined();
        expect(converted.strategy).toEqual("AUTO");
    });

    it("leaves instructions undefined when the backend omits or empties the list", () => {
        expect(convertAgent(agentOut()).instructions).toBeUndefined();
        expect(convertAgent(agentOut([])).instructions).toBeUndefined();
    });
});
