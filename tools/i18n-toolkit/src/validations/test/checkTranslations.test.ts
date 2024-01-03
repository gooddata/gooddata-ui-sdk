// (C) 2020-2022 GoodData Corporation

import { checkTranslations } from "../usage/checkTranslations.js";
import { UsageResult } from "../../data.js";
import { LocalesStructure } from "../../schema/localization.js";
import { describe, it, expect } from "vitest";

describe("check translations", () => {
    it("valid, extracted and loaded are same", () => {
        const { uncontrolled, results } = checkTranslations(
            [TestJsonBasic],
            [PatternAll],
            createExtracted(["ok.key", "fail.key"]),
            {},
        );

        expect(uncontrolled).toEqual([]);
        expect(results.length).toEqual(1);
        checkResults(results[0], {
            files: ["defaults/en-US/test.json"],
            identifier: "/.+/",
            extracted: 2,
            loaded: 2,
        });
    });

    it("invalid, only 1 extracted message, but loaded 2", () => {
        const { uncontrolled, results } = checkTranslations(
            [TestJsonBasic],
            [PatternAll],
            createExtracted(["ok.key"]),
            {},
        );

        expect(uncontrolled).toEqual([]);
        expect(results.length).toEqual(1);
        checkResults(results[0], {
            files: ["defaults/en-US/test.json"],
            identifier: "/.+/",
            extracted: 1,
            loaded: 2,
            unused: 1,
            unusedMessages: ["fail.key"],
        });
    });

    it("invalid, extracted 3 message, but loaded 2", () => {
        const { uncontrolled, results } = checkTranslations(
            [TestJsonBasic],
            [PatternAll],
            createExtracted(["ok.key", "fail.key", "fail.key1"]),
            {},
        );

        expect(uncontrolled).toEqual([]);
        expect(results.length).toEqual(1);
        checkResults(results[0], {
            files: ["defaults/en-US/test.json"],
            identifier: "/.+/",
            extracted: 3,
            loaded: 2,
            missing: 1,
            missingMessages: ["fail.key1"],
        });
    });

    it("valid with filtered, extracted and loaded are same", () => {
        const { uncontrolled, results } = checkTranslations(
            [TestJsonBasicWithIgnore],
            [PatternOkAndFail_Filtered],
            createExtracted(["ok.key", "fail.key"]),
            {},
        );

        expect(uncontrolled).toEqual([]);
        expect(results.length).toEqual(1);
        checkResults(results[0], {
            files: ["defaults/en-US/test.json"],
            identifier: "/^ok\\./,/^fail\\./",
            extracted: 2,
            loaded: 2,
        });
    });

    it("valid with filtered, extracted and loaded are same and there is uncontrolled message", () => {
        const { uncontrolled, results } = checkTranslations(
            [TestJsonBasicWithIgnore],
            [PatternOkAndFail_Filtered],
            createExtracted(["ok.key", "fail.key", "ignore.key1"]),
            {},
        );

        expect(uncontrolled).toEqual(["ignore.key1"]);
        expect(results.length).toEqual(1);
        checkResults(results[0], {
            files: ["defaults/en-US/test.json"],
            identifier: "/^ok\\./,/^fail\\./",
            extracted: 2,
            loaded: 2,
        });
    });

    it("valid with filtered, extracted and loaded are same and there are ignored messages", () => {
        const { uncontrolled, results } = checkTranslations(
            [TestJsonBasicWithIgnore],
            [PatternOkAndFail_Filtered, PatternIgnore],
            createExtracted(["ok.key", "fail.key", "ignored.key1"]),
            {},
        );

        expect(uncontrolled).toEqual([]);
        expect(results.length).toEqual(2);
        checkResults(results[0], {
            files: ["defaults/en-US/test.json"],
            identifier: "/^ok\\./,/^fail\\./",
            extracted: 2,
            loaded: 2,
        });
        checkResults(results[1], {
            files: ["defaults/en-US/test.json"],
            identifier: "/^ignored\\./",
            ignore: true,
            extracted: 1,
            loaded: 3,
            ignored: 3,
            ignoredMessages: ["ignored.key1", "ignored.key2", "ignored.key3"],
        });
    });

    it("valid, extracted and loaded are same and there are ignored messages", () => {
        const { uncontrolled, results } = checkTranslations(
            [TestJsonBasicWithIgnore],
            [PatternAll, PatternIgnore],
            createExtracted(["ok.key", "fail.key"]),
            {},
        );

        expect(uncontrolled).toEqual([]);
        expect(results.length).toEqual(2);
        checkResults(results[0], {
            files: ["defaults/en-US/test.json"],
            identifier: "/.+/",
            extracted: 2,
            loaded: 2,
        });
        checkResults(results[1], {
            files: ["defaults/en-US/test.json"],
            identifier: "/^ignored\\./",
            ignore: true,
            loaded: 3,
            ignored: 3,
            ignoredMessages: ["ignored.key1", "ignored.key2", "ignored.key3"],
        });
    });

    it("invalid, extracted more messages than loaded", () => {
        const { uncontrolled, results } = checkTranslations(
            [TestJsonBasic],
            [PatternAll, PatternIgnore],
            createExtracted(["ok.key", "fail.key", "ignored.key1", "ignored.key2", "ignored.key3"]),
            {},
        );

        expect(uncontrolled).toEqual([]);
        expect(results.length).toEqual(2);
        checkResults(results[0], {
            files: ["defaults/en-US/test.json"],
            identifier: "/.+/",
            extracted: 5,
            loaded: 2,
            missing: 3,
            missingMessages: ["ignored.key1", "ignored.key2", "ignored.key3"],
        });
        checkResults(results[1], {
            files: ["defaults/en-US/test.json"],
            identifier: "/^ignored\\./",
            ignore: true,
        });
    });

    it("valid, extracted and loaded are same because of ignored messages for all", () => {
        const { uncontrolled, results } = checkTranslations(
            [TestJsonBasicWithIgnore, TestJsonBasicWithIgnore2],
            [PatternAll, PatternIgnore],
            createExtracted(["ok.key", "fail.key"]),
            {},
        );

        expect(uncontrolled).toEqual([]);
        expect(results.length).toEqual(2);
        checkResults(results[0], {
            files: ["defaults/en-US/test.json", "extended/en-US/test.json"],
            identifier: "/.+/",
            extracted: 2,
            loaded: 2,
        });
        checkResults(results[1], {
            files: ["defaults/en-US/test.json", "extended/en-US/test.json"],
            identifier: "/^ignored\\./",
            ignore: true,
            loaded: 3,
            ignored: 3,
            ignoredMessages: ["ignored.key1", "ignored.key2", "ignored.key3"],
        });
    });

    it("invalid, extracted and loaded are not same because of ignored messages for only extended/ directory", () => {
        const { uncontrolled, results } = checkTranslations(
            [TestJsonBasicWithIgnore, TestJsonBasicWithIgnore2],
            [PatternAll, PatternIgnoreOnlyExtended],
            createExtracted(["ok.key", "fail.key"]),
            {},
        );

        expect(uncontrolled).toEqual([]);
        expect(results.length).toEqual(2);
        checkResults(results[0], {
            files: ["defaults/en-US/test.json", "extended/en-US/test.json"],
            identifier: "/.+/",
            extracted: 2,
            loaded: 5,
            unused: 3,
            unusedMessages: ["ignored.key1", "ignored.key2", "ignored.key3"],
        });
        checkResults(results[1], {
            files: ["extended/en-US/test.json"],
            identifier: "/^ignored\\./",
            ignore: true,
            loaded: 3,
            ignored: 3,
            ignoredMessages: ["ignored.key1", "ignored.key2", "ignored.key3"],
        });
    });
});

function checkResults(
    result: UsageResult,
    {
        files,
        identifier,
        missingMessages = [],
        unusedMessages = [],
        ignoredMessages = [],
        ignore = undefined,
        loaded = 0,
        missing = 0,
        extracted = 0,
        unused = 0,
        ignored = 0,
    }: {
        missingMessages?: string[];
        unusedMessages?: string[];
        ignoredMessages?: string[];
        files: string[];
        identifier: string;
        ignore?: boolean;
        extracted?: number;
        loaded?: number;
        missing?: number;
        unused?: number;
        ignored?: number;
    },
) {
    expect(result.data.missingMessages).toEqual(missingMessages);
    expect(result.data.unusedMessages).toEqual(unusedMessages);
    expect(result.data.ignoredMessages).toEqual(ignoredMessages);

    expect(result.files).toEqual(files);
    expect(result.identifier).toEqual(identifier);
    expect(result.ignore).toEqual(ignore);

    expect(result.stats.extracted).toBe(extracted);
    expect(result.stats.loaded).toBe(loaded);
    expect(result.stats.missing).toBe(missing);
    expect(result.stats.unused).toBe(unused);
    expect(result.stats.ignored).toBe(ignored);
}

function createExtracted(arr: string[]) {
    return arr.reduce((prev, item) => ({ ...prev, [item]: true }), {} as Record<string, any>);
}

//FILES

const TestJsonBasic: [string, LocalesStructure] = [
    "defaults/en-US/test.json",
    {
        "ok.key": { value: "OK", comment: "", limit: 0 },
        "fail.key": { value: "FAIL", comment: "", limit: 0 },
    },
];

const TestJsonBasicWithIgnore: [string, LocalesStructure] = [
    "defaults/en-US/test.json",
    {
        ...TestJsonBasic[1],
        "ignored.key1": { value: "Ignore1", comment: "", limit: 0 },
        "ignored.key2": { value: "Ignore2", comment: "", limit: 0 },
        "ignored.key3": { value: "Ignore3", comment: "", limit: 0 },
    },
];

const TestJsonBasicWithIgnore2: [string, LocalesStructure] = [
    "extended/en-US/test.json",
    {
        ...TestJsonBasic[1],
        "ignored.key1": { value: "Ignore1", comment: "", limit: 0 },
        "ignored.key2": { value: "Ignore2", comment: "", limit: 0 },
        "ignored.key3": { value: "Ignore3", comment: "", limit: 0 },
    },
];

//PATTERNS

const PatternAll = {
    pattern: [/.+/],
};

const PatternOkAndFail_Filtered = {
    pattern: [/^ok\./, /^fail\./],
    filterTranslationFile: true,
};

const PatternIgnore = {
    pattern: [/^ignored\./],
    ignore: true,
};

const PatternIgnoreOnlyExtended = {
    dir: /^extended/,
    pattern: [/^ignored\./],
    ignore: true,
};
