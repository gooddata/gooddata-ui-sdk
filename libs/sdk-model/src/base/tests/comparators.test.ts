// (C) 2021 GoodData Corporation
import identity from "lodash/identity.js";
import { dateStringComparatorFactory, stringComparatorFactory } from "../comparators.js";

describe("stringComparatorFactory", () => {
    it.each`
        a            | b            | expected
        ${"a"}       | ${"a"}       | ${0}
        ${"a"}       | ${"b"}       | ${-1}
        ${"b"}       | ${"a"}       | ${1}
        ${"a"}       | ${undefined} | ${-1}
        ${undefined} | ${"b"}       | ${1}
        ${undefined} | ${undefined} | ${0}
    `("should compare $a and $b as $expected", ({ a, b, expected }) => {
        const comparator = stringComparatorFactory<string | undefined>(identity);
        expect(comparator("asc")(a, b)).toEqual(expected);
    });
});

describe("dateStringComparatorFactory", () => {
    it.each`
        a                        | b                        | expected
        ${"2018-10-12 12:00:00"} | ${"2018-10-12 12:00:00"} | ${0}
        ${"2018-10-12 12:00:00"} | ${"2020-10-12 12:00:00"} | ${-1}
        ${"2020-10-12 12:00:00"} | ${"2018-10-12 12:00:00"} | ${1}
        ${"2018-10-12 12:00:00"} | ${undefined}             | ${-1}
        ${undefined}             | ${"2020-10-12 12:00:00"} | ${1}
        ${undefined}             | ${undefined}             | ${0}
    `("should compare $a and $b as $expected", ({ a, b, expected }) => {
        const comparator = dateStringComparatorFactory<string | undefined>(identity);
        expect(Math.sign(comparator("asc")(a, b))).toEqual(expected);
    });
});
