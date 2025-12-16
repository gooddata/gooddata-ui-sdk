// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { suppressConsole } from "@gooddata/util";

import { type LocalesStructure } from "../../schema/localization.js";
import { getHtmlSyntaxCheck } from "../htmlSyntax.js";

type Scenario = [string, string, string | null];

function createLocalizations(
    value: string,
    key = "test.key",
    file = "test.json",
): Array<[string, LocalesStructure]> {
    return [[file, { [key]: value }]];
}

describe("validate html message tests", () => {
    const scenarios: Scenario[] = [
        ["simple text", "This is message", null],
        ["simple html", "This is <b>message</b>", null],
        [
            "simple invalid html non sense",
            "This is <bmessage</b>",
            `Html format of localizations is not correct`,
        ],
    ];

    it.each(scenarios)("validate %s", async (_: any, msg: any, err: any) => {
        if (err) {
            await expect(
                suppressConsole(() => getHtmlSyntaxCheck(createLocalizations(msg)), "error", [
                    { type: "startsWith", value: "✘" },
                ]),
            ).rejects.toThrowError(err);
        } else {
            await expect(getHtmlSyntaxCheck(createLocalizations(msg))).resolves.not.toThrow();
        }
    });

    it("includes key and file in error message", async () => {
        const localizations = createLocalizations(
            "This is <bmessage</b>",
            "my.html.key",
            "/path/to/en-US.json",
        );
        await expect(
            suppressConsole(() => getHtmlSyntaxCheck(localizations), "error", [
                { type: "startsWith", value: "✘" },
            ]),
        ).rejects.toThrowError(/Key: "my\.html\.key"/);
    });
});
