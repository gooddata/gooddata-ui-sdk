// (C) 2020-2025 GoodData Corporation

import { getHtmlSyntaxCheck } from "../htmlSyntax.js";
import { describe, it, expect } from "vitest";
import { suppressConsole } from "@gooddata/util";

type Scenario = [string, string, string | null];

describe("validate html message tests", () => {
    const scenarios: Scenario[] = [
        ["simple text", "This is message", null],
        ["simple html", "This is <b>message</b>", null],
        [
            "simple invalid html non sense",
            "This is <bmessage</b>",
            `Html format of localization is not correct, see: "This is <bmessage</b>"`,
        ],
    ];

    it.each(scenarios)("validate %s", async (_: any, msg: any, err: any) => {
        if (err) {
            await expect(
                suppressConsole(() => getHtmlSyntaxCheck([msg]), "error", [
                    { type: "startsWith", value: "✘" },
                ]),
            ).rejects.toThrowError(err);
        } else {
            await expect(getHtmlSyntaxCheck([msg])).resolves.not.toThrow();
        }
    });
});
