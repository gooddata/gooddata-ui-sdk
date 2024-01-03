// (C) 2020-2022 GoodData Corporation

import { LocalesStructure } from "../../schema/localization.js";
import { getStructureCheck } from "../structure.js";
import { describe, it, expect } from "vitest";

type Scenario = [string, LocalesStructure, string | null];

describe("validate structure tests", () => {
    const scenarios: Scenario[] = [
        [
            "basic format with required only",
            { "message.id": { value: "This is value", comment: "This is comment", limit: 0 } },
            null,
        ],
        ["basic format with string", { "message.id": "This is value" }, null],
        [
            "basic format with all props",
            {
                "message.id": {
                    value: "This is value",
                    comment: "This is comment",
                    limit: 0,
                    translate: false,
                },
            },
            null,
        ],
        [
            "basic format with more props",
            {
                "message.id": {
                    value: "This is value",
                    comment: "This is comment",
                    limit: 0,
                    translate: false,
                    test: 2,
                } as any,
            },
            `Structure of localizations is not correct, see: [{"value":"This is value","comment":"This is comment","limit":0,"translate":false,"test":2}]`,
        ],
        [
            "basic format with missing comment and limit",
            {
                "message.id": {
                    value: "This is value",
                } as any,
            },
            `Structure of localizations is not correct, see: [{"value":"This is value"}]`,
        ],
        [
            "basic format with missing limit",
            {
                "message.id": {
                    value: "This is value",
                    comment: "",
                } as any,
            },
            `Structure of localizations is not correct, see: [{"value":"This is value","comment":""}]`,
        ],
        [
            "basic format with missing value",
            {
                "message.id": {
                    comment: "",
                    limit: 0,
                } as any,
            },
            `Structure of localizations is not correct, see: [{"comment":"","limit":0}]`,
        ],
    ];

    it.each(scenarios)("validate %s", async (_: any, structure: any, err: any) => {
        if (err) {
            await expect(getStructureCheck([["en-US.json", structure]])).rejects.toThrowError(err);
        } else {
            await expect(getStructureCheck([["en-US.json", structure]])).resolves.not.toThrow();
        }
    });
});
