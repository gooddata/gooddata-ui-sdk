// (C) 2020-2025 GoodData Corporation

import { getIntlMessageFormatCheck } from "../messageFormat.js";
import { describe, expect, it, vi, beforeAll, afterAll, MockInstance } from "vitest";

type Scenario = [string, string, string | null];

describe("validate ICU message tests", () => {
    let consoleErrorMock: MockInstance;
    beforeAll(() => {
        consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
        consoleErrorMock.mockRestore();
    });

    const scenarios: Scenario[] = [
        ["simple text", "This is message", null],
        ["simple text with marks", "This is <strong>message</strong>", null],
        ["simple text with ICU", "The is {count} {count, plural, one {one} other {mores}}.", null],
        [
            "simple text with invalid ICU keyword",
            "The is {count} {count, plural, one {one} othr {mores}.",
            `Intl format of localization is not correct, see: "The is {count} {count, plural, one {one} othr {mores}."`,
        ],
        [
            "simple text with invalid ICU }",
            "The is {count} {count, plural, one {one} other {mores}.",
            `Intl format of localization is not correct, see: "The is {count} {count, plural, one {one} other {mores}."`,
        ],
    ];

    it.each(scenarios)("validate %s", async (_: any, msg: any, err: any) => {
        if (err) {
            await expect(getIntlMessageFormatCheck([msg])).rejects.toThrowError(err);
        } else {
            await expect(getIntlMessageFormatCheck([msg])).resolves.not.toThrow();
        }
    });
});
