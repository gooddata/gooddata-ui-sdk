// (C) 2020 GoodData Corporation
import { createDefaultDateFormatter } from "../defaultDateFormatter";

describe("createDefaultDateFormatter", () => {
    // monthIndex in a date constructor is from 0 (January) to 11 (December)
    const scenarios: Array<[Date, string, string]> = [
        [new Date(2020, 10, 15), "MM/dd/yyyy", "11/15/2020"],
        [new Date(2020, 10, 15), "dd/MM/yyyy", "15/11/2020"],
        [new Date(2020, 10, 15), "dd-MM-yyyy", "15-11-2020"],
        [new Date(2020, 10, 15), "yyyy-MM-dd", "2020-11-15"],
        [new Date(2020, 10, 15), "M/d/yy", "11/15/20"],
        [new Date(2020, 10, 15), "dd.MM.yyyy", "15.11.2020"],
    ];

    it.each(scenarios)("should format (%s, %s) as %s", (value, dateFormat, expected) => {
        const formatter = createDefaultDateFormatter(dateFormat);
        const actual = formatter(value);
        expect(actual).toBe(expected);
    });

    it("should throw on invalid dateFormat", () => {
        expect(() =>
            createDefaultDateFormatter("surely this is not a dateFormat")(new Date(2020, 10, 15)),
        ).toThrow();
    });
});
