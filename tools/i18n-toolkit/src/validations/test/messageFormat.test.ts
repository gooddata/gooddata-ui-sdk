// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { suppressConsole } from "@gooddata/util";

import { type LocalesStructure } from "../../schema/localization.js";
import { getIntlMessageFormatCheck } from "../messageFormat.js";

type Scenario = [string, string, string | null];

function createLocalizations(
    value: string,
    key = "test.key",
    file = "test.json",
): Array<[string, LocalesStructure]> {
    return [[file, { [key]: value }]];
}

describe("validate ICU message tests", () => {
    const scenarios: Scenario[] = [
        ["simple text", "This is message", null],
        ["simple text with marks", "This is <strong>message</strong>", null],
        ["simple text with ICU", "The is {count} {count, plural, one {one} other {mores}}.", null],
        [
            "simple text with invalid ICU keyword",
            "The is {count} {count, plural, one {one} othr {mores}.",
            `Intl format of localizations is not correct`,
        ],
        [
            "simple text with invalid ICU }",
            "The is {count} {count, plural, one {one} other {mores}.",
            `Intl format of localizations is not correct`,
        ],
    ];

    it.each(scenarios)("validate %s", async (_: any, msg: any, err: any) => {
        if (err) {
            await expect(
                suppressConsole(() => getIntlMessageFormatCheck(createLocalizations(msg)), "error", [
                    {
                        type: "startsWith",
                        value: "✘",
                    },
                ]),
            ).rejects.toThrowError(err);
        } else {
            await expect(getIntlMessageFormatCheck(createLocalizations(msg))).resolves.not.toThrow();
        }
    });

    it("includes key and file in error message", async () => {
        const localizations = createLocalizations(
            "The is {count} {count, plural, one {one} othr {mores}.",
            "my.translation.key",
            "/path/to/en-US.json",
        );
        await expect(
            suppressConsole(() => getIntlMessageFormatCheck(localizations), "error", [
                {
                    type: "startsWith",
                    value: "✘",
                },
            ]),
        ).rejects.toThrowError(/Key: "my\.translation\.key"/);
    });

    it("collects all errors before throwing", async () => {
        const localizations: Array<[string, LocalesStructure]> = [
            [
                "en-US.json",
                {
                    "error.one": "Invalid {count, plural, one {one} othr {mores}.",
                    "valid.key": "This is valid",
                    "error.two": "Another invalid {missing",
                },
            ],
        ];
        await expect(
            suppressConsole(() => getIntlMessageFormatCheck(localizations), "error", [
                {
                    type: "startsWith",
                    value: "✘",
                },
            ]),
        ).rejects.toThrowError(/error\.one[\s\S]*error\.two/);
    });
});
