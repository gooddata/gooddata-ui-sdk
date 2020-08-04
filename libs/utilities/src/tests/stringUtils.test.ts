// (C) 2007-2020 GoodData Corporation
import { randomString, shortenText, simplifyText, parseStringToArray, hashCodeString } from "../stringUtils";

describe("#randomString", () => {
    it("should generate alphanumeric string with correct length", () => {
        expect(randomString(10)).toEqual(expect.stringMatching(/^[0-9a-zA-Z]{10}$/));
    });
});

describe("#shortenText", () => {
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

describe("#simplifyText", () => {
    it("should simplify text", () => {
        expect(simplifyText("")).toEqual("");
        expect(simplifyText(123)).toEqual("123");
        expect(simplifyText(" - ")).toEqual("___");
        expect(simplifyText("123456")).toEqual("123456");
        expect(simplifyText("Too long")).toEqual("too_long");
        expect(simplifyText(null)).toEqual("");
    });
});

describe("parseStringToArray", () => {
    it("should parse string to array correctly", () => {
        const tagsConfigs = [
            // valid are empty [] and a-zA-Z0-9 separated by comma [asdf], [asdf,qwer], [asdf,2]
            { tag: "[]", result: [] },
            { tag: "[asdf]", result: ["asdf"] },
            { tag: "[asdf,qwer]", result: ["asdf", "qwer"] },
            { tag: "[asdf,2]", result: ["asdf", "2"] },
            // invalid
            { tag: "[asdf", result: null },
            { tag: "asdf]", result: null },
            { tag: "[asdf, qwer]", result: null },
            { tag: "[asdf#]", result: null },
            { tag: "[asdf?]", result: null },
            { tag: "[asdf&]", result: null },
        ];

        tagsConfigs.forEach((tagConfig) => {
            expect(parseStringToArray(tagConfig.tag)).toEqual(tagConfig.result);
        });
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
