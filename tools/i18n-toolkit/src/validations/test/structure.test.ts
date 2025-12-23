// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { suppressConsole } from "@gooddata/util";

import { type LocalesStructure } from "../../schema/localization.js";
import { getStructureCheck } from "../structure.js";

type Scenario = [string, LocalesStructure, string | null];

describe("validate structure tests", () => {
    const scenarios: Scenario[] = [
        [
            "basic format with required only",
            { "message.id": { text: "This is value", crowdinContext: "This is comment" } },
            null,
        ],
        ["basic format with string", { "message.id": "This is value" }, null],
        [
            "basic format with all props",
            {
                "message.id": {
                    text: "This is value",
                    crowdinContext: "This is comment",
                    translate: false,
                },
            },
            null,
        ],
        [
            "basic format with more props",
            {
                "message.id": {
                    text: "This is value",
                    crowdinContext: "This is comment",
                    translate: false,
                    limit: 2,
                } as any,
            },
            `Structure of localizations is not correct`,
        ],
        [
            "basic format with missing comment",
            {
                "message.id": {
                    text: "This is value",
                } as any,
            },
            `Structure of localizations is not correct`,
        ],
        [
            "basic format with missing value",
            {
                "message.id": {
                    crowdinContext: "",
                } as any,
            },
            `Structure of localizations is not correct`,
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

    it("includes file in error message", async () => {
        const structure = {
            "message.id": {
                text: "This is value",
            } as any,
        };
        await expect(
            suppressConsole(() => getStructureCheck([["/path/to/en-US.json", structure]]), "error", [
                { type: "startsWith", value: "✘" },
            ]),
        ).rejects.toThrowError(/File: \/path\/to\/en-US\.json/);
    });
});
