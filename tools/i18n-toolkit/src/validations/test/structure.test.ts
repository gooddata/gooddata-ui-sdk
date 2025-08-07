// (C) 2020-2025 GoodData Corporation

import { LocalesStructure } from "../../schema/localization.js";
import { getStructureCheck } from "../structure.js";
import { describe, it, expect } from "vitest";
import { suppressConsole } from "@gooddata/util";

type Scenario = [string, LocalesStructure, string | null];

describe("validate structure tests", () => {
    const scenarios: Scenario[] = [
        [
            "basic format with required only",
            { "message.id": { value: "This is value", comment: "This is comment" } },
            null,
        ],
        ["basic format with string", { "message.id": "This is value" }, null],
        [
            "basic format with all props",
            {
                "message.id": {
                    value: "This is value",
                    comment: "This is comment",
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
                    translate: false,
                    test: 2,
                } as any,
            },
            `Structure of localizations is not correct, see: [{"value":"This is value","comment":"This is comment","translate":false,"test":2}]`,
        ],
        [
            "basic format with missing comment",
            {
                "message.id": {
                    value: "This is value",
                } as any,
            },
            `Structure of localizations is not correct, see: [{"value":"This is value"}]`,
        ],
        [
            "basic format with missing value",
            {
                "message.id": {
                    comment: "",
                } as any,
            },
            `Structure of localizations is not correct, see: [{"comment":""}]`,
        ],
    ];

    it.each(scenarios)("validate %s", async (_: any, structure: any, err: any) => {
        if (err) {
            await expect(
                suppressConsole(() => getStructureCheck([["en-US.json", structure]]), "error", [
                    {
                        type: "startsWith",
                        value: "✘",
                    },
                ]),
            ).rejects.toThrowError(err);
        } else {
            await expect(getStructureCheck([["en-US.json", structure]])).resolves.not.toThrow();
        }
    });
});
