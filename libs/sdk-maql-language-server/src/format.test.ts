// (C) 2022-2026 GoodData Corporation

import { dedent } from "ts-dedent";
import { describe, expect, it } from "vitest";
import { type FormattingOptions, Position, Range, TextEdit } from "vscode-languageserver";

import { format, formatRange } from "./format.js";

describe("MAQL automatic formatting tests", () => {
    const options: FormattingOptions = {
        tabSize: 1, // tabSize of one for easier verification
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: false,
    };

    it("applyTextEdits works as expected - if failing test suite is INVALID", () => {
        const query = "select \n sum({fact/1})";
        const expected = "SELECT\nSUM({fact/1});";
        const edits = [
            TextEdit.replace(Range.create(0, 0, 0, 6), "SELECT"),
            TextEdit.replace(Range.create(0, 6, 1, 2), "\n"),
            TextEdit.replace(Range.create(1, 2, 1, 4), "SUM"),
            TextEdit.insert(Position.create(1, 15), ";"),
        ];
        const result = applyTextEdits(query, edits);
        expect(result).toEqual(expected);
    });

    it("insertNewLine option", () => {
        const query = "SELECT SUM({fact/1});";
        const expected = "SELECT SUM({fact/1});\n";
        const edits = format(query, { ...options, insertFinalNewline: true });
        const result = applyTextEdits(query, edits);
        expect(result).toEqual(expected);
    });

    it.each([
        [
            "no extra spaces at the end of query",
            dedent`
            SELECT SUM({fact/1})    `,
            dedent`
            SELECT SUM({fact/1})`,
        ],
        [
            "logical operators start on new lines",
            dedent`
            SELECT SUM({fact/1})
             WHERE {fact/r} > 100 AND {fact/r} < 500 OR{fact/r} BETWEEN 1000 AND 2000`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {fact/r} > 100
             AND {fact/r} < 500
             OR {fact/r} BETWEEN 1000 AND 2000`,
        ],
        [
            "subselect starts on a new line",
            dedent`
            SELECT SUM(SELECT {fact/price} * {fact/quantity}
             WHERE {label/status} = "Delivered")`,
            dedent`
            SELECT SUM(
              SELECT {fact/price} * {fact/quantity}
               WHERE {label/status} = "Delivered")`,
        ],
        [
            "each statement has its own line",
            dedent`
            SELECT SUM({fact/1}) BY ALL OTHER FOR Previous({attribute/date.year}) WHERE TRUE USING {attribute/a} WITH PF`,
            dedent`
            SELECT SUM({fact/1})
             BY ALL OTHER
             FOR Previous({attribute/date.year})
             WHERE TRUE
             USING {attribute/a}
             WITH PF`,
        ],
        [
            "format NOT LIKE expression",
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/values} NOT   LIKE  "%3"`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/values} NOT LIKE "%3"`,
        ],
        [
            "format NOT BETWEEN expression",
            dedent`
            SELECT SUM({fact/1})
             WHERE {fact/1} NOT   BETWEEN  14  AND   444`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {fact/1} NOT BETWEEN 14 AND 444`,
        ],
        [
            "format IN expression",
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/values} IN( )`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/values} IN ()`,
        ],
        [
            "format IN expression",
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/values} IN("value1" ,"value2","value3")`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/values} IN (
              "value1",
              "value2",
              "value3")`,
        ],
        [
            "format numeric IN expression",
            dedent`
            SELECT SUM({fact/1})
             WHERE {fact/numbers} IN(88210921 ,36027988,64534767)`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {fact/numbers} IN (
              88210921,
              36027988,
              64534767)`,
        ],
        [
            "format IN expression with a comment placed before comma",
            dedent`
            SELECT SUM(FACT)
             WHERE {label/values} IN("value1"  # value 1 comment
             ,"value2","value3")`,
            dedent`
            SELECT SUM(FACT)
             WHERE {label/values} IN (
              "value1" # value 1 comment
              ,
              "value2",
              "value3")`,
        ],
        [
            "apply indentation",
            dedent`
            SELECT SUM({fact/1})
            WHERE TRUE`,
            dedent`
            SELECT SUM({fact/1})
             WHERE TRUE`,
        ],
        [
            "apply indentation for function",
            dedent`
            SELECT CORREL(
            {fact/1},
            {fact/2})`,
            dedent`
            SELECT CORREL(
              {fact/1},
              {fact/2})`,
        ],
        [
            "trim trailing whitespace",
            dedent`
            SELECT SUM({fact/1})  ` + "\n  ",
            dedent`
            SELECT SUM({fact/1})` + "\n",
        ],
        [
            "insert whitespace for relational operators",
            dedent`
            SELECT AVG({fact/income})
             WHERE {fact/height}<=200
             AND {fact/age}<=65
             AND {label/country.code}="US"`,
            dedent`
            SELECT AVG({fact/income})
             WHERE {fact/height} <= 200
             AND {fact/age} <= 65
             AND {label/country.code} = "US"`,
        ],
        [
            "insert whitespace for arithmetic operators",
            dedent`
            SELECT 5+2-13*4/2`,
            dedent`
            SELECT 5 + 2 - 13 * 4 / 2`,
        ],
        [
            "remove extra whitespace",
            dedent`
            SELECT  SUM({fact/1})
             WHERE   {fact/budget} >   10000`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {fact/budget} > 10000`,
        ],
        [
            "keywords to uppercase",
            dedent`
            select sum({fact/1})`,
            dedent`
            SELECT SUM({fact/1})`,
        ],
        [
            "transformation function to CamelCase",
            dedent`
            SELECT SUM({fact/1})
             FOR nExTpErIoD({label/date.day})`,
            dedent`
            SELECT SUM({fact/1})
             FOR NextPeriod({label/date.day})`,
        ],
        [
            "case expression",
            dedent`
            SELECT CASE WHEN {fact/1} < 100 THEN 1, WHEN {fact/1} < 1000 THEN 2 ELSE 3 END`,
            dedent`
            SELECT CASE
              WHEN {fact/1} < 100 THEN 1,
              WHEN {fact/1} < 1000 THEN 2
              ELSE 3
             END`,
        ],
        [
            "if expression",
            dedent`
            SELECT IF {fact/1} < 100 THEN 1 ELSE 2 END`,
            dedent`
            SELECT IF {fact/1} < 100 THEN 1
              ELSE 2
             END`,
        ],
        [
            "if expression alternative is not changed",
            dedent`
            SELECT
             IF {fact/1} < 100
              THEN 1
              ELSE 2
             END`,
            dedent`
            SELECT
             IF {fact/1} < 100
              THEN 1
              ELSE 2
             END`,
        ],
        [
            "ilike expression",
            dedent`
            SELECT SUM({fact/1}) WHERE {label/test}ILIKE "value"`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/test} ILIKE "value"`,
        ],
        [
            "like expression",
            dedent`
            SELECT SUM({fact/1}) WHERE {label/test}LIKE "value"`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/test} LIKE "value"`,
        ],
        [
            "between expression",
            dedent`
            SELECT SUM({fact/1}) WHERE {label/test}BETWEEN "Alabama"AND "Alaska"`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/test} BETWEEN "Alabama" AND "Alaska"`,
        ],
        [
            "not in expression",
            dedent`
            SELECT SUM({fact/1}) WHERE {label/test}NOT IN ("Midwest")`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/test} NOT IN (
              "Midwest")`,
        ],
        [
            "in expression",
            dedent`
            SELECT SUM({fact/1}) WHERE {label/test}IN ("Midwest")`,
            dedent`
            SELECT SUM({fact/1})
             WHERE {label/test} IN (
              "Midwest")`,
        ],
        [
            "date time aggregation function",
            dedent`
            select sum({fact/o_totalprice})
             where {label/o_orderdatetime.day} = max(select {label/o_orderdatetime.day} by {dataset/orders})`,
            dedent`
            SELECT SUM({fact/o_totalprice})
             WHERE {label/o_orderdatetime.day} = MAX(
              SELECT {label/o_orderdatetime.day}
               BY {dataset/orders})`,
        ],
        [
            "two parameter max function",
            dedent`
            select max( {fact/o_totalprice},{dataset/orders} )`,
            dedent`
            SELECT MAX({fact/o_totalprice}, {dataset/orders})`,
        ],
        [
            "last value function",
            dedent`
            SELECT last_value( sum( {fact/price} ) ) order by {label/datetime.day} within {label/orders}`,
            dedent`
            SELECT LAST_VALUE(SUM({fact/price}))
             ORDER BY {label/datetime.day}
             WITHIN {label/orders}`,
        ],
        [
            "last value function no within",
            dedent`
            SELECT last_value( sum( {fact/price} ) ) order by {label/datetime.day}`,
            dedent`
            SELECT LAST_VALUE(SUM({fact/price}))
             ORDER BY {label/datetime.day}`,
        ],
        [
            "datetime add and datetime diff functions",
            dedent`
            SELECT datetime_diff( DATEtIME_AdD( {label/date.day} , 66 ), "2012-03-14" )`,
            dedent`
            SELECT DATETIME_DIFF(DATETIME_ADD({label/date.day}, 66), "2012-03-14")`,
        ],
        [
            "for each clause",
            dedent`
            SELECT {fact/price} FOR EACH {label/datetime.day}`,
            dedent`
            SELECT {fact/price}
             FOR EACH {label/datetime.day}`,
        ],
    ])("%s", (_desc, query, expected) => {
        const edits = format(query, options);
        const result = applyTextEdits(query, edits);
        expect(result).toEqual(expected);
    });

    describe("range formatting", () => {
        it.each([
            [
                "capitalize only SELECT",
                dedent`
                select sum({fact/1})`,
                Range.create(0, 0, 0, 6),
                dedent`
                SELECT sum({fact/1})`,
            ],
            [
                "capitalize only selected function",
                dedent`
                select sum({fact/1})
                 for previousperiod({label/day})`,
                Range.create(1, 6, 1, 18),
                dedent`
                select sum({fact/1})
                 for PreviousPeriod({label/day})`,
            ],
            [
                "fix indent on one line only",
                dedent`
                SELECT SUM({fact/1})
                BY {label/a}
                WITHOUT PF`,
                Range.create(0, 20, 1, 8),
                dedent`
                SELECT SUM({fact/1})
                 BY {label/a}
                WITHOUT PF`,
            ],
            [
                "fix only selected token",
                dedent`
                SELECT SUM({fact/1})
                where TRUE`,
                Range.create(1, 0, 1, 5),
                dedent`
                SELECT SUM({fact/1})
                WHERE TRUE`,
            ],
        ])("%s", (_desc, query, range, expected) => {
            const edits = formatRange(query, range, options);
            const result = applyTextEdits(query, edits);
            expect(result).toEqual(expected);
        });
    });
});

function applyTextEdits(query: string, edits: TextEdit[]): string {
    const lines = query.split("\n");
    const offsets = lines.reduce(
        (acc: number[], line, idx) => {
            const prev = acc[idx] + 1; // plus newline
            acc.push(prev + line.length);
            return acc;
        },
        [0],
    );
    const edited: string[] = [];
    let pos = 0;
    edits.sort((a, b) => {
        const aStart = a.range.start;
        const bStart = b.range.start;
        return aStart.line === bStart.line ? aStart.character - bStart.character : aStart.line - bStart.line;
    });
    edits.forEach((edit) => {
        const start = offsets[edit.range.start.line] + edit.range.start.character;
        edited.push(query.substring(pos, start));
        edited.push(edit.newText);
        pos = offsets[edit.range.end.line] + edit.range.end.character;
    });
    edited.push(query.substring(pos, query.length));
    return edited.join("");
}
