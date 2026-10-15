// (C) 2026 GoodData Corporation

import { describe, expectTypeOf, it } from "vitest";

import { type AgentCustomSkill } from "./index.js";

describe("AgentCustomSkill", () => {
    it("accepts both Publisher skill ids", () => {
        expectTypeOf<"report_builder">().toExtend<AgentCustomSkill>();
        expectTypeOf<"document_builder">().toExtend<AgentCustomSkill>();
    });
});
