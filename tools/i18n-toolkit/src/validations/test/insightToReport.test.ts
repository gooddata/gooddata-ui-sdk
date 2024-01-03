// (C) 2020-2022 GoodData Corporation

import { getInsightToReportCheck } from "../insightToReport.js";
import { LocalesStructure } from "../../schema/localization.js";
import { describe, it, expect, vi } from "vitest";

type Scenario = [string, LocalesStructure, string | null];

let returnValue: LocalesStructure;
vi.mock("../../utils", () => ({
    readFile: () => Promise.resolve(Buffer.from(JSON.stringify(returnValue))),
}));

describe("validate insight to report", () => {
    const scenarios: Scenario[] = [
        [
            "valid simple localisation",
            {
                "message.id": { value: "This is message", comment: "This is comment", limit: 0 },
            },
            null,
        ],
        [
            "invalid localisation with string",
            {
                "message.id": "Test",
            },
            `File "en-US.json" is not valid because contains string messages instead of objects, see: ["message.id"]`,
        ],
        [
            "invalid localisation with insight inside value",
            {
                "message.id": {
                    value: "This is message contains Insight word.",
                    comment: "This is comment",
                    limit: 0,
                },
            },
            `Localization keys does not contain "|insight" suffix, see: ["message.id"]`,
        ],
        [
            "invalid localisation with insight inside value and valid pipe, missing report pipe",
            {
                "message.id|insight": {
                    value: "This is message contains Insight word.",
                    comment: "This is comment",
                    limit: 0,
                },
            },
            `Some keys missing in localisation file, missing keys: ["message.id|report"]`,
        ],
        [
            "invalid localisation with report inside value and valid pipe, missing insight pipe",
            {
                "message.id|report": {
                    value: "This is message contains Report word.",
                    comment: "This is comment",
                    limit: 0,
                },
            },
            `Some keys missing in localisation file, missing keys: ["message.id|insight"]`,
        ],
        [
            "valid full localisation",
            {
                "message.id|insight": {
                    value: "This is message contains Insight word.",
                    comment: "This is comment",
                    limit: 0,
                },
                "message.id|report": {
                    value: "This is message contains Report word.",
                    comment: "This is comment",
                    limit: 0,
                },
            },
            `Translation is enable for report keys, use translate=false, invalid keys: ["message.id|report"]`,
        ],
        [
            "valid full localisation",
            {
                "message.id|insight": {
                    value: "This is message contains Insight word.",
                    comment: "This is comment",
                    limit: 0,
                },
                "message.id|report": {
                    value: "This is message contains Report word.",
                    comment: "This is comment",
                    limit: 0,
                    translate: false,
                },
            },
            null,
        ],
    ];

    it.each(scenarios)("validate %s", async (_: any, locales: any, err: any) => {
        returnValue = locales;
        if (err) {
            await expect(getInsightToReportCheck([["en-US.json", locales]])).rejects.toThrowError(err);
        } else {
            await expect(getInsightToReportCheck([["en-US.json", locales]])).resolves.not.toThrow();
        }
    });
});
