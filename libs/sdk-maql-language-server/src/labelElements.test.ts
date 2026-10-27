// (C) 2021-2026 GoodData Corporation

// oxlint-disable typescript-eslint/require-array-sort-compare

import { dedent } from "ts-dedent";
import { describe, expect, it } from "vitest";

import type { IPosition } from "@gooddata/maql-antlr4ts";
import { type TigerObjectType, tigerIdTypeToObjectType } from "@gooddata/sdk-backend-tiger";

import { LabelContext, findLabelContext, labelElementsFinder } from "./labelElements.js";
import { MaqlMetric } from "./parseMaql.js";
import { AntlrRange, type IMaqlObject, type IMaqlString } from "./tokenRanges.js";

const bogusRange = new AntlrRange(-1, -1);

function createLabelContext(
    labels: [string, string, AntlrRange?][] = [],
    strings: [string, AntlrRange?][] = [],
    timeMacros: [string, string, AntlrRange?][] = [],
): LabelContext {
    const lc = new LabelContext();
    labels.forEach((label) => lc.addLabel(label[0], label[1], label[2] ?? bogusRange));
    strings.forEach((string) => lc.addString(string[0], string[1] ?? bogusRange));
    timeMacros.forEach((tm) => lc.addTimeMacro(tm[0], tm[1], tm[2] ?? bogusRange));
    return lc;
}

describe.each([
    [
        "empty WHERE condition (no context)",
        "select count({label/ex}) where ",
        pos(0, 31),
        createLabelContext(),
    ],
    [
        "equality operator context",
        "select count({label/ex}) where {label/1} = ",
        pos(0, 43),
        createLabelContext([["label", "1"]]),
    ],
    [
        "equality operator context, switched order",
        "select count({label/ex}) where = {label/1}",
        pos(0, 31),
        createLabelContext([["label", "1"]]),
    ],
    [
        "IN keyword context",
        "select count({label/ex}) where {label/1} IN (",
        pos(0, 41),
        createLabelContext([["label", "1"]]),
    ],
    [
        "NOT IN keyword context",
        "select count({label/ex}) where {label/1} NOT IN (",
        pos(0, 45),
        createLabelContext([["label", "1"]]),
    ],
    [
        "computed attribute IN keyword context",
        "select count({label/ex}) where {computed_attribute/1} IN (",
        pos(0, 58),
        createLabelContext([["computed_attribute", "1"]]),
    ],
    [
        "computed attribute equality operator context",
        "select count({label/ex}) where {computed_attribute/1} = ",
        pos(0, 56),
        createLabelContext([["computed_attribute", "1"]]),
    ],
    [
        "IN keyword context with values present",
        'select count({label/ex}) where {label/1} IN ("kokos",  ,"banana")',
        pos(0, 50),
        createLabelContext([["label", "1"]], [["kokos"], ["banana"]]),
    ],
    [
        "BETWEEN keyword context, caret after AND",
        'select count({label/ex}) where {label/1} BETWEEN "k" AND ',
        pos(0, 53),
        createLabelContext([["label", "1"]], [["k"]]),
    ],
    [
        "BETWEEN keyword context, caret after BETWEEN",
        'select count({label/ex}) where {label/1} BETWEEN  AND "n"',
        pos(0, 49),
        createLabelContext([["label", "1"]], [["n"]]),
    ],
    [
        "CASE expression context with equality operator",
        dedent`
        select count({label/ex})
            where case
                when {label/day} = "Monday" then {label/1},
                when {label/day} = "Tuesday" then {label/2}
                else {label/3}
            end = `,
        pos(5, 6),
        createLabelContext([
            ["label", "1"],
            ["label", "2"],
            ["label", "3"],
        ]),
    ],
    [
        "CASE expression context, caret at inner WHEN condition",
        dedent`
        select count({label/ex})
            where case
                when {label/1} = "" then {label/ex2},
                when {label/ex1} = "Tuesday" then {label/ex3}
                else {label/ex4}
            end like "Ap%"`,
        pos(2, 24),
        createLabelContext([["label", "1"]], [[""]]),
    ],
    [
        "IF ELSE expression context with equality operator",
        dedent`
        SELECT COUNT({label/ex1})
            WHERE IF {label/ex2} > "11"
                    THEN {label/1}
                ELSE IF {label/ex3} < "222"
                    THEN {label/2}
                ELSE {label/3}
            END = `,
        pos(6, 6),
        createLabelContext([
            ["label", "1"],
            ["label", "2"],
            ["label", "3"],
        ]),
    ],
    [
        "IF expression, caret in condition",
        "select if {label/1} =  then count({label/ex1}) else count({label/ex2}) end",
        pos(0, 22),
        createLabelContext([["label", "1"]]),
    ],
    [
        "equality operator context with caret inside if expression",
        dedent`
        SELECT COUNT({label/ex1})
        WHERE {label/1} = IF {label/ex2} < "222"
        THEN `,
        pos(2, 5),
        createLabelContext([["label", "1"]]),
    ],
    [
        "subselect context, inner select",
        dedent`
        select (
            select count({label/ex1}) where {label/1} >
         ) where {label/ex2} > "231"`,
        pos(2, 0),
        createLabelContext([["label", "1"]]),
    ],
    [
        "subselect context, outer select",
        dedent`
        select (
        select count({label/ex1}) where {label/ex2} > "221"
        ) where {label/1} > `,
        pos(2, 18),
        createLabelContext([["label", "1"]]),
    ],
    [
        "subselect context, inner select, with line comment",
        dedent`
        select (
        select count({label/ex1}) where {label/1} >
        # insert string after this comment

        ) where {label/ex2} > "231"`,
        pos(3),
        createLabelContext([["label", "1"]]),
    ],
    [
        "equality operator context with time macro",
        "select count({label/ex}) where {label/date.day} = PREVIOUS(DAY)",
        pos(0, 43),
        createLabelContext([["label", "date.day"]], undefined, [["PREVIOUS", "DAY"]]),
    ],
])(
    "label context at caret position",
    (description: string, query: string, position: IPosition, expected: LabelContext) => {
        const metric = new MaqlMetric(query);
        const actual = findLabelContext(metric, position);
        describe(`${description}`, () => {
            testContextsEqualIgnoreRange(actual, expected);
        });
    },
);

describe("findLabelContext queries with string in place", () => {
    describe("unterminated string", () => {
        const metric = new MaqlMetric('SELECT AVG({fact/1}) WHERE {label/1} LIKE "2016');
        const expected = createLabelContext([["label", "1"]], [["2016"]]);
        const actual = findLabelContext(metric, pos(0, metric.length));
        testContextsEqualIgnoreRange(actual, expected);
    });

    describe("string already in place", () => {
        const metric = new MaqlMetric('SELECT AVG({fact/1}) WHERE {label/2} LIKE "2016"');
        const expected = createLabelContext([["label", "2"]], [["2016"]]);
        const actual = findLabelContext(metric, pos(0, metric.length - 1));
        testContextsEqualIgnoreRange(actual, expected);
    });
});

describe("LabelContext.addLabel", () => {
    it("addresses a computed attribute by its Tiger type so the elements query can resolve it", () => {
        const lc = new LabelContext().addLabel("computed_attribute", "ca1", bogusRange);

        expect(lc.labels).toHaveLength(1);
        expect(lc.labels[0]).toMatchObject({
            actualType: "computedAttribute",
            tigerType: "computedAttribute",
            id: "ca1",
            ref: { type: "computedAttribute", identifier: "ca1" },
        });
    });

    it("ignores object types that carry no elements", () => {
        const lc = new LabelContext()
            .addLabel("fact", "f1", bogusRange)
            .addLabel("metric", "m1", bogusRange)
            .addLabel("bogus", "b1", bogusRange);

        expect(lc.labels).toHaveLength(0);
    });
});

describe("labelElementsFinder with a computed attribute", () => {
    it("pairs the computed attribute with the compared string", () => {
        const metric = new MaqlMetric('SELECT COUNT({label/ex1}) WHERE {computed_attribute/1} IN ("a", "b")');
        const pairs = labelElementsFinder(metric).map(([object, string]) => [object.ref, string.string]);

        expect(pairs).toEqual([
            [{ type: "computedAttribute", identifier: "1" }, "a"],
            [{ type: "computedAttribute", identifier: "1" }, "b"],
        ]);
    });
});

describe("object without id", () => {
    const metric = new MaqlMetric("select count({label1})");
    const expected = createLabelContext();
    const actual = findLabelContext(metric, pos(1, metric.length)); // should not fail
    testContextsEqualIgnoreRange(actual, expected);
});

describe("invalid time macro", () => {
    const metric = new MaqlMetric("select count({label/1}) where {label/date.year} = THIS - 1");
    const expected = createLabelContext([["label", "date.year"]]);
    const actual = findLabelContext(metric, pos(0, 49)); // should not fail
    testContextsEqualIgnoreRange(actual, expected);
});

function testContextsEqualIgnoreRange(actual: LabelContext, expected: LabelContext): void {
    const expectedLabelNames = expected.labels.map((label) => `${label.actualType}/${label.id}`).sort();
    const expectedStrings = expected.strings.map((string) => string.string).sort();
    it(`has expected labels: [${expectedLabelNames.join(", ")}]`, () => {
        expect(actual.labels.map((label) => label.ref).sort()).toEqual(
            expected.labels.map((label) => label.ref).sort(),
        );
    });
    it(`has expected strings: [${expectedStrings.join(", ")}]`, () => {
        expect(actual.strings.map((string) => string.string).sort()).toEqual(expectedStrings);
    });
}

describe.each([
    [
        "equality operator query",
        'SELECT COUNT({label/ex1}) WHERE {label/1} = "banana"',
        [
            tuple(
                label("label", "1", new AntlrRange(2, 32, 2, 41)),
                maqlString("banana", new AntlrRange(2, 44, 2, 52)),
            ),
        ],
        "invalid equality operator query",
        "SELECT COUNT({label/ex1}) WHERE {label/1} = banana",
        [],
    ],
])(
    "findLabelStringPairs find correct pairs in %s",
    (_description: string, query: string, expected: [IMaqlObject, IMaqlString][]) => {
        const metric = new MaqlMetric(query);
        const actual = labelElementsFinder(metric);
        it("has expected label string pairs", () => {
            expect(actual.sort()).toEqual(expected.sort());
        });
    },
);

function pos(line: number, character: number = 0): IPosition {
    if (line < 0) {
        throw Error("Lines start at 0, got line " + line);
    }
    if (character < 0) {
        throw Error("Characters start at 0, got character " + character);
    }
    return { line: line + 1, character };
}

function label(type: TigerObjectType, id: string, range: AntlrRange): IMaqlObject {
    return {
        actualType: type,
        tigerType: type,
        id,
        ref: {
            type: tigerIdTypeToObjectType[type],
            identifier: id,
        },
        range,
    };
}

function maqlString(text: string, range: AntlrRange): IMaqlString {
    return {
        string: text,
        range,
    };
}

function tuple<A, B>(a: A, b: B): [A, B] {
    return [a, b];
}
