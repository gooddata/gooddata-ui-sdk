// (C) 2021 GoodData Corporation

import { validateAgainstList } from "../securitySettings";

describe("validateAgainstList", () => {
    const Scenarios: Array<[boolean, string, string, any]> = [
        [false, "for undefined list", "https://example.com/plugin.js", undefined],
        [false, "for null list", "https://example.com/plugin.js", null],
        [false, "for number value as list", "https://example.com/plugin.js", 123],
        [false, "for boolean value as list", "https://example.com/plugin.js", true],
        [false, "for object value as list", "https://example.com/plugin.js", {}],
        [false, "for array value as list", "https://example.com/plugin.js", []],
        [false, "for empty string in list", "https://example.com/plugin.js", ""],
        [false, "for list with only whitespaces value", "https://example.com/plugin.js", "   "],
        [false, "for list with only semicolons", "https://example.com/plugin.js", ";;;"],
        [
            false,
            "for list with only semicolons and whitespace",
            "https://example.com/plugin.js",
            "; ;\n;\t;\r",
        ],
        [
            false,
            "when prefix does not match",
            "https://example.com/plugin.js",
            "https://example.com/pluginSource/",
        ],
        [
            false,
            "when prefix does not match any prefix from list",
            "https://example.com/plugin.js",
            "https://example.com/pluginSource/",
        ],
        [
            false,
            "when prefix does not match and there are empty entries",
            "https://example.com/plugin.js;https://sub.example.com/pluginSource",
            "https://my.example.com/plugin.js",
        ],
        [
            true,
            "when url starts with prefix from list",
            "https://example.com/plugin.js",
            "https://example.com",
        ],
        [
            true,
            "when url starts with prefix from list of multiple values",
            "https://sub.example.com/pluginSource/plugin.js",
            "https://example.com;https://sub.example.com/pluginSource",
        ],
    ];

    it.each(Scenarios)("should return %s %s", (expected, _desc, value, list) => {
        expect(validateAgainstList(value, list)).toEqual(expected);
    });
});
