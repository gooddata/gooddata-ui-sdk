// (C) 2007-2022 GoodData Corporation
import {
    randomString,
    shortenText,
    simplifyText,
    parseStringToArray,
    hashCodeString,
} from "../stringUtils.js";

describe("randomString", () => {
    it("should generate alphanumeric string with correct length", () => {
        expect(randomString(10)).toEqual(expect.stringMatching(/^[0-9a-zA-Z]{10}$/));
    });
});

describe("shortenText", () => {
    it("should shorten text to maximum length and add ellipsis", () => {
        const shortened = shortenText("Lorem ipsum dolor sit amet", { maxLength: 11 });
        expect(shortened).toEqual("Lorem ipsum…");
    });

    it("should NOT shorten text when maxLength is not passed", () => {
        const shortened = shortenText("Lorem ipsum dolor sit amet");
        expect(shortened).toEqual("Lorem ipsum dolor sit amet");
    });

    it("should NOT shorten text when text is shorter than maxLength", () => {
        const shortened = shortenText("Lorem ipsum dolor sit amet", { maxLength: 100 });
        expect(shortened).toEqual("Lorem ipsum dolor sit amet");
    });
});

describe("simplifyText", () => {
    const Scenarios: Array<[string | number | null, string]> = [
        ["", ""],
        [123, "123"],
        [" - ", "___"],
        ["123456", "123456"],
        ["Text with space", "text_with_space"],
        [null, ""],
    ];

    it.each(Scenarios)("should simply '%s' correctly", (input, expected) => {
        expect(simplifyText(input)).toEqual(expected);
    });
});

describe("parseStringToArray", () => {
    const Scenarios: Array<[string, string[] | null]> = [
        ["[]", []],
        ["[asdf]", ["asdf"]],
        ["[asdf,qwer]", ["asdf", "qwer"]],
        ["[asdf,2]", ["asdf", "2"]],
        ["[asdf movie,qwer]", ["asdf movie", "qwer"]],
        // invalid
        ["[asdf tbg, qas tpas]", null],
        ["[asdf", null],
        ["asdf]", null],
        ["[asdf, qwer]", null],
        ["[asdf#]", null],
        ["[asdf?]", null],
        ["[asdf&]", null],
    ];

    it.each(Scenarios)("should parse %s correctly", (input, expected) => {
        expect(parseStringToArray(input)).toEqual(expected);
    });
});

describe("hashCodeString", () => {
    it("should return hash code from string", () => {
        const hashCode = hashCodeString("userId123");
        expect(hashCode).toBe(318677548);
    });

    it("should return 0 when string is empty", () => {
        const hashCode = hashCodeString("");
        expect(hashCode).toBe(0);
    });
});
