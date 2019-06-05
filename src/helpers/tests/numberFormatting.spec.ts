// (C) 2019 GoodData Corporation
import { formatNumberEscaped } from "../numberFormatting";

describe("formatNumberEscaped", () => {
    it.each([
        ["# <hr />", "42 &lt;hr /&gt;"],
        ["[>=0]big;[<0]small", "big"],
        ["[color=009900] #", "[color=009900] 42"],
    ])("should properly escape HTML entities in format '%s'", (format: string, expected: string) => {
        const actual = formatNumberEscaped(42, format);
        expect(actual).toEqual(expected);
    });
});
