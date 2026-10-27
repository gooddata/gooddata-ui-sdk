// (C) 2021-2026 GoodData Corporation

// oxlint-disable typescript-eslint/require-array-sort-compare

import { Vocabulary } from "antlr4ng";
import { describe, expect, it } from "vitest";
import { type CompletionItem, type CompletionItemKind, Range, TextEdit } from "vscode-languageserver";

import { MaqlLexer, escapeString } from "@gooddata/maql-antlr4ts";

import { LabelContext } from "../labelElements.js";
import { type ITigerMetadataObject, type LdmObjects } from "../metadata/model.js";
import { docs, labelElementsFunction, ldmObjects } from "../tests/metadata.test.helpers.js";
import { AntlrRange } from "../tokenRanges.js";

import { complete, resolve } from "./complete.js";
import { Kind, descriptions, ignoredTokens } from "./descriptions.js";

describe("completion resolve tests", () => {
    it("WHERE clause has documentation", async () => {
        const list = await complete("SELECT COUNT({label/id}) WHER");
        const items: CompletionItem[] = list.items;
        const whereItem = items.find((item) => item.label === "WHERE");
        expect(whereItem).not.toBe(undefined); // completions failure
        const resolved = whereItem ? await resolve(whereItem, docs) : undefined;
        expect(resolved?.documentation).not.toBe(undefined);
    });

    it("determine types of attribute / label", async () => {
        const list = await complete("SELECT COUNT(", undefined, ldmObjects);
        const items: CompletionItem[] = list.items;
        expect(items.length).not.toBe(0);

        const labels = items.filter((item) => item.label.indexOf("label") >= 0);
        expect(labels[0].label).toBe("label title");
        expect(labels[0].kind).toBe(13);
    });

    it("determine types of facts / metrics", async () => {
        const list = await complete("SELECT SUM(", undefined, ldmObjects);
        const items: CompletionItem[] = list.items;
        expect(items.length).not.toBe(0);

        const facts = items.filter((item) => item.label.indexOf("fact") >= 0);
        const metrics = items.filter((item) => item.label.indexOf("measure") >= 0);

        expect(facts[0].label).toBe("fact title");
        expect(facts[0].kind).toBe(5);
        expect(metrics[0].label).toBe("measure title");
        expect(metrics[0].kind).toBe(6);
    });

    it("determine types of parameters", async () => {
        const list = await complete("SELECT {parameter/", undefined, ldmObjects);
        const items: CompletionItem[] = list.items;
        const parameter = items.find((item) => item.label === "Top N");

        expect(parameter?.kind).toBe(Kind.Parameter);
        expect(parameter?.insertText).toBe("{parameter/topN}");
    });

    it("excludes non-numeric parameters from a numeric context", async () => {
        const list = await complete("SELECT POWER({parameter/", undefined, ldmObjects);
        const items: CompletionItem[] = list.items;

        expect(items.find((item) => item.label === "Top N")).not.toBe(undefined);
        expect(items.find((item) => item.label === "Scenario")).toBe(undefined);
    });

    it("shows parameter type badge and default derived from the definition", async () => {
        const list = await complete("SELECT {parameter/", undefined, ldmObjects);
        const items: CompletionItem[] = list.items;
        const numberParameter = items.find((item) => item.label === "Top N");
        const stringParameter = items.find((item) => item.label === "Scenario");

        expect(numberParameter?.labelDetails).toEqual({ description: "number" });
        expect(numberParameter?.detail).toBe(
            "ID: 'parameter/topN', Description: 'Top N parameter', Default: 10",
        );
        expect(stringParameter?.labelDetails).toEqual({ description: "string" });
        expect(stringParameter?.detail).toBe(
            `ID: 'parameter/scenario', Description: 'Scenario parameter', Default: "actual"`,
        );
    });
});

describe("operator completions", () => {
    it("base operator completions", () => {
        const baseOperators: string[] = ["+", "-", "*", "/"];
        const result = complete("SELECT 1 ");
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining(
                    baseOperators.map((op) => {
                        return expect.objectContaining(stringToCompletionItem(op, op + " "));
                    }),
                ),
            );
        });
    });

    it("percent operator completion is offered", () => {
        const result = complete("SELECT PERCENTILE({fact/1}, 95");
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining([expect.objectContaining(stringToCompletionItem("%", "%"))]),
            );
        });
    });

    it("all relational operators completions are offered", () => {
        const relationalOperators: string[] = ["=", "<>", ">", "<", ">=", "<="];
        const result = complete("SELECT 1 WHERE {metric/2} ");
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining(
                    relationalOperators.map((op) =>
                        expect.objectContaining(stringToCompletionItem(op, op + " ")),
                    ),
                ),
            );
        });
    });

    it("parentheses are offered after IN", () => {
        const result = complete("SELECT 1 WHERE {metric/2} IN ");
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual([expect.objectContaining(stringToCompletionItem("()"))]);
        });
    });
});

describe("keyword completions", () => {
    it("BY keyword", async () => {
        const list = await complete("SELECT {metric/2} ");
        const items = list.items;
        expect(items).toEqual(
            expect.arrayContaining([expect.objectContaining(stringToCompletionItem("BY"))]),
        );
    });

    it("ALL is suggested after BY", async () => {
        const list = await complete("SELECT {metric/2} BY ");
        const items = list.items;
        expect(items).toEqual(
            expect.arrayContaining([expect.objectContaining(stringToCompletionItem("ALL"))]),
        );
    });

    it("OTHER is suggested after BY ALL", async () => {
        const list = await complete("SELECT {metric/2} BY ALL ");
        const items = list.items;
        expect(items).toEqual(
            expect.arrayContaining([expect.objectContaining(stringToCompletionItem("OTHER"))]),
        );
    });

    it("PRECEDING | FOLLOWING keywords", async () => {
        const list = await complete("SELECT RUNSUM({metric/2}) ROWS BETWEEN 1 ");
        const items = list.items;
        expect(items).toEqual(
            expect.arrayContaining([
                expect.objectContaining(stringToCompletionItem("PRECEDING")),
                expect.objectContaining(stringToCompletionItem("FOLLOWING")),
            ]),
        );
    });
});

describe("function completions", () => {
    it("all functions are offered after SELECT", () => {
        const result = complete("SELECT ");
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            const insertTexts: string[] = items.map(
                (it) => it.insertText ?? `ERROR: insertText missing in  '${it.label}'`,
            );
            const funcname1 = [
                "SUM",
                "MIN",
                "MAX",
                "AVG",
                "MEDIAN",
                "VAR",
                "VARP",
                "STDEV",
                "STDEVP",
                "EXP",
                "LN",
                "SQRT",
                "ABS",
                "SIGN",
                "FLOOR",
                "CEIL",
                "CEILING",
                "APPROXIMATE_COUNT",
                "ROUND",
                "TRUNC",
                "LOG",
                "COUNT",
            ].map((func) => `${func}($1)$0`);
            const funcname2 = [
                "CORREL",
                "COVARP",
                "RSQ",
                "SLOPE",
                "INTERCEPT",
                "POWER",
                "ROUND",
                "TRUNC",
                "LOG",
                "COUNT",
                "PERCENTILE",
                "IFNULL",
            ].map((func) => `${func}($1, $2)$0`);
            const runfuncname = [
                "RUNSUM",
                "RUNMIN",
                "RUNMAX",
                "RUNAVG",
                "RUNVAR",
                "RUNVARP",
                "RUNSTDEV",
                "RUNSTDEVP",
            ].map((func) => `${func}($1)$0`);
            const rankfuncname = ["ROW_NUMBER", "RANK", "DENSE_RANK", "PERCENT_RANK", "CUME_DIST"].map(
                (func) => `${func}($1)$0`,
            );
            const allFunctions = funcname1.concat(funcname2, runfuncname, rankfuncname);
            const difference = allFunctions.filter((f) => !new Set(insertTexts).has(f));
            if (difference.length > 0) {
                // I did not find 'expect' that would show me the missing completions
                throw new Error(`Missing function completions:\n${difference.join("\n")}`);
            }
        });
    });
});

describe("object completions", () => {
    it("when no typed identifiers are available type snippet completions are offered", () => {
        const result = complete("SELECT ");
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(stringToCompletionItem("fact/$identifier")),
                    expect.objectContaining(stringToCompletionItem("metric/$identifier")),
                ]),
            );
        });
    });

    it("all typed identifiers are offered and snippets are not offered", () => {
        const result = complete("SELECT ", "SELECT ".length, ldmObjects);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining(stringToCompletionItem("fact/$identifier")),
                    expect.objectContaining(stringToCompletionItem("metric/$identifier")),
                ]),
            );
            expect(items).toEqual(
                expect.arrayContaining([
                    ...ldmObjects
                        .get("fact")
                        .map((ldmObject) =>
                            expect.objectContaining(
                                stringToCompletionItem(ldmObject.title, insertText(ldmObject)),
                            ),
                        ),
                    ...ldmObjects
                        .get("metric")
                        .map((ldmObject) =>
                            expect.objectContaining(
                                stringToCompletionItem(ldmObject.title, insertText(ldmObject)),
                            ),
                        ),
                ]),
            );
        });
    });

    it("object completions are offered after BY", () => {
        const result = complete("SELECT 1 BY ");
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(stringToCompletionItem("label/$identifier")),
                ]),
            );
        });
    });
});

describe("disabled completions", () => {
    it("completions are not offered inside a line comment", () => {
        const result = complete("SELECT {fact/1}\n# a comment", "SELECT {fact/1}\n# a comment".length);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual([]);
        });
    });

    it("completions are not offered inside a string", () => {
        const result = complete('SELECT 1 WHERE "hello world"', 'SELECT 1 WHERE "hello '.length);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual([]);
        });
    });
});

describe("completions with TextEdit", () => {
    it("SEL can be replaced by SELECT", () => {
        const result = complete("SEL", "SEL".length);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            const expectedItem = stringToCompletionItem("SELECT", "SELECT ", Range.create(0, 0, 0, 3));
            expect(items).toEqual(expect.arrayContaining([expect.objectContaining(expectedItem)]));
        });
    });

    it("'{' can be replaced by new object", () => {
        const result = complete("SELECT {", undefined, ldmObjects);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            const range = Range.create(0, 7, 0, 8);
            expect(items).toEqual(
                expect.arrayContaining(
                    ldmObjects
                        .get("metric")
                        .map((metric) =>
                            expect.objectContaining(
                                stringToCompletionItem(
                                    metric.title,
                                    `{${metric.tigerType}/${metric.id}}`,
                                    range,
                                ),
                            ),
                        ),
                ),
            );
        });
    });

    it("'{metric/measure' can be replaced by new object", () => {
        const result = complete("SELECT {metric/measure", undefined, ldmObjects);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            const range = Range.create(0, 7, 0, 22);
            expect(items).toEqual(
                expect.arrayContaining(
                    ldmObjects
                        .get("metric")
                        .map((metric) =>
                            expect.objectContaining(
                                stringToCompletionItem(
                                    metric.title,
                                    `{${metric.tigerType}/${metric.id}}`,
                                    range,
                                ),
                            ),
                        ),
                ),
            );
        });
    });

    it("'{metric}' can be replaced by new object", () => {
        const result = complete("SELECT {metric}", "SELECT {metric".length, ldmObjects);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            const range = Range.create(0, 7, 0, 15);
            expect(items).toEqual(
                expect.arrayContaining(
                    ldmObjects
                        .get("metric")
                        .map((metric) =>
                            expect.objectContaining(
                                stringToCompletionItem(
                                    metric.title,
                                    `{${metric.tigerType}/${metric.id}}`,
                                    range,
                                ),
                            ),
                        ),
                ),
            );
        });
    });
});

describe("caret is not at the end of the query", () => {
    it("correct completions are offered inside parentheses", () => {
        const result = complete("SELECT SUM()", "SELECT SUM(".length);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(stringToCompletionItem("fact/$identifier")),
                    expect.objectContaining(stringToCompletionItem("metric/$identifier")),
                ]),
            );
        });
    });
});

describe("edge cases", () => {
    it("completions are offered after a line comment", () => {
        const result = complete("SELECT {fact/1}\n# a comment\n", "SELECT {fact/1}\n# a comment\n".length);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).not.toEqual([]);
        });
    });

    it("request completions immediately after last token", () => {
        const result = complete("SELECT 1");
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining([expect.objectContaining(stringToCompletionItem("WHERE", "WHERE "))]),
            );
        });
    });

    it("completions are offered after invalid keyword inside a function", () => {
        const result = complete("SELECT SUM(metric)", "SELECT SUM(metric".length);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(stringToCompletionItem("metric/$identifier")),
                ]),
            );
        });
    });
});

describe("type checked completion tests", () => {
    it("offers label and attribute snippets after COUNT", () => {
        const result = complete("SELECT COUNT(");
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(stringToCompletionItem("label/$identifier")),
                ]),
            );
            expect(items).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining(stringToCompletionItem("fact/$identifier")),
                    expect.objectContaining(stringToCompletionItem("metric/$identifier")),
                ]),
            );
        });
    });

    it("offers label and dataset completions in second argument of COUNT", () => {
        const result = complete("SELECT COUNT({label/4}, ");
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(stringToCompletionItem("label/$identifier")),
                    expect.objectContaining(stringToCompletionItem("dataset/$identifier")),
                ]),
            );
            expect(items).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining(stringToCompletionItem("fact/$identifier")),
                    expect.objectContaining(stringToCompletionItem("metric/$identifier")),
                ]),
            );
        });
    });

    it("offers metrics and facts after SUM", () => {
        const result = complete("SELECT SUM(", undefined, ldmObjects);
        return result.then((list) => {
            const items: CompletionItem[] = list.items;
            expect(items).toEqual(
                expect.arrayContaining([
                    ...ldmObjects
                        .get("metric")
                        .map((ldmObject) =>
                            expect.objectContaining(
                                stringToCompletionItem(ldmObject.title, insertText(ldmObject)),
                            ),
                        ),
                    ...ldmObjects
                        .get("fact")
                        .map((ldmObject) =>
                            expect.objectContaining(
                                stringToCompletionItem(ldmObject.title, insertText(ldmObject)),
                            ),
                        ),
                ]),
            );
            expect(items).not.toEqual(
                expect.arrayContaining(
                    ldmObjects
                        .get("label")
                        .map((id) => expect.objectContaining(stringToCompletionItem(`${id.type}/${id.id}`))),
                ),
            );
        });
    });

    it("offers parameters in numeric contexts", async () => {
        const list = await complete("SELECT {parameter/", undefined, ldmObjects);
        expect(list.items).toEqual(
            expect.arrayContaining([
                expect.objectContaining(stringToCompletionItem("Top N", "{parameter/topN}")),
            ]),
        );
    });

    it("offers only date labels in FOR transformations", () => {
        const result = complete("SELECT 1 FOR Next(", undefined, ldmObjects);
        return result.then((list) => {
            expectDateObjects(list.items, ldmObjects);
        });
    });

    it("offers only date labels in DATETIME_ADD", () => {
        const result = complete("SELECT 1 WHERE DATETIME_ADD( , ,)", 28, ldmObjects);
        return result.then((list) => {
            expectDateObjects(list.items, ldmObjects);
        });
    });

    it("offers only date labels in DATETIME_DIFF", () => {
        const result = complete("SELECT DATETIME_DIFF({label/date.day}, ", undefined, ldmObjects);
        return result.then((list) => {
            expectDateObjects(list.items, ldmObjects);
        });
    });

    it("offers granularities in NEXT time macro", async () => {
        const result = await complete("SELECT NEXT()", 12, ldmObjects);
        const granularities = ["DAY", "WEEK", "MONTH", "DAYOFWEEK", "DAYOFMONTH"];
        expectInsertTexts(result.items, granularities, []);
    });
});

describe("completions disambiguation", () => {
    describe("NEXT, PREVIOUS disambiguation", () => {
        it("FOR transformation NEXT, PREVIOUS", () => {
            const result = complete("SELECT SUM({fact/1}) FOR ");
            return result.then((list) => {
                const timeTransformations = ["Next", "Previous"];
                expectInsertTexts(
                    list.items,
                    [
                        ...timeTransformations.map((tt) => `${tt}(date) -> date`),
                        ...timeTransformations.map((tt) => `${tt}(date, integer_literal) -> date`),
                    ],
                    [
                        ...timeTransformations.map((tt) => `${tt}(granularity) -> date`),
                        ...timeTransformations.map((tt) => `${tt}(granularity, integer_literal) -> date`),
                    ],
                );
            });
        });
        it("Time macros NEXT, PREVIOUS", () => {
            const result = complete("SELECT {metric/payment} WHERE {attribute/date} = ");
            return result.then((list) => {
                const timeMacros = ["NEXT", "PREVIOUS"];
                expectInsertTexts(
                    list.items,
                    [
                        ...timeMacros.map((tt) => `${tt}(granularity) -> date`),
                        ...timeMacros.map((tt) => `${tt}(granularity, integer_literal) -> date`),
                    ],
                    [
                        ...timeMacros.map((tt) => `${tt}(date) -> date`),
                        ...timeMacros.map((tt) => `${tt}(date, integer_literal) -> date`),
                    ],
                );
            });
        });
    });

    // Not disambiguated:
    describe.todo("numeric and attribute MIN, MAX", () => {});
    describe.todo("filter IN, TOP/BOTTOM IN", () => {});
});

describe("label elements tests", () => {
    it.each([
        ["LIKE completions", `SELECT AVG({fact/1}) WHERE {label/4} LIKE `, undefined, ["label", "4"]],
        [
            "LIKE completions with incomplete string",
            `SELECT AVG({fact/1}) WHERE {label/4} LIKE "Coco`,
            undefined,
            ["label", "4"],
            "Coco",
            Range.create(0, 42, 0, 47),
        ],
        [
            "LIKE completions with string in place",
            `SELECT AVG({fact/1}) WHERE {label/4} LIKE "Coco"`,
            `SELECT AVG({fact/1}) WHERE {label/4} LIKE "Coco`.length,
            ["label", "4"],
            "Coco",
            Range.create(0, 42, 0, 48),
        ],
        [
            "LIKE completions with string in place and caret in the middle of it",
            `SELECT AVG({fact/1}) WHERE {label/4} LIKE "Cocooned"`,
            `SELECT AVG({fact/1}) WHERE {label/4} LIKE "Coco`.length,
            ["label", "4"],
            "Coco",
            Range.create(0, 42, 0, 52),
        ],
        [
            "LIKE completions with element typed without quotes",
            `SELECT AVG({fact/1}) WHERE {label/4} LIKE Coco`,
            `SELECT AVG({fact/1}) WHERE {label/4} LIKE Coco`.length,
            ["label", "4"],
            "Coco",
            Range.create(0, 42, 0, 46),
        ],
        [
            "label element containing a double quote is parsed",
            'SELECT AVG({fact/1}) WHERE {label/special} = "hello \\"example\\"',
            undefined,
            ["label", "special"],
            'hello "example"',
            Range.create(0, 45, 0, 63),
        ],
        [
            "label element containing a newline is parsed",
            'SELECT AVG({fact/1}) WHERE {label/special} = "goodbye\nwo',
            undefined,
            ["label", "special"],
            "goodbye\nwo",
            Range.create(0, 45, 1, 2),
        ],
    ])(
        "%s",
        async (
            _name: string,
            query: string,
            offset: number | undefined,
            expectedLabel: string[],
            filter?: string | undefined,
            range?: Range,
        ) => {
            const list = await complete(query, offset, ldmObjects, labelElementsFunction);
            const items: CompletionItem[] = list.items;
            const context = new LabelContext();
            context.addLabel(expectedLabel[0], expectedLabel[1], new AntlrRange(-1, -1));
            const expectedElements: CompletionItem[] = (
                await labelElementsFunction(
                    context.labels,
                    context.strings.map((string) => string.string),
                    { filter: filter },
                )
            ).list.elements
                .map((elem) =>
                    stringToCompletionItem(elem.title || "", escapeString(elem.title || "", '"'), range),
                )
                .map((item) => expect.objectContaining(item));
            expect(items.sort()).toEqual(expectedElements.sort());
        },
    );

    it("completions offered inside IN expression do not replace commas", async () => {
        const query1 = `SELECT 1 WHERE {label/4} IN ("Apricot", , "Banana")`;
        const offset = `SELECT 1 WHERE {label/4} IN ("Apricot", `.length;
        const list = await complete(query1, offset, ldmObjects, labelElementsFunction);
        const items: CompletionItem[] = list.items;
        expect(items).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    textEdit: undefined,
                }),
            ]),
        );
        expect(items).not.toContainEqual(
            expect.objectContaining({
                label: "Apricot",
            }),
        );
        expect(items).not.toContainEqual(
            expect.objectContaining({
                label: "Banana",
            }),
        );
    });

    it("quotes in label element are escaped on insert", async () => {
        const query1 = `SELECT 1 WHERE {label/special} = "hello "`;
        const offset = query1.length - 1;
        const list = await complete(query1, offset, ldmObjects, labelElementsFunction);
        const items: CompletionItem[] = list.items;
        expect(items).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    insertText: '"hello \\"example\\" world"',
                }),
            ]),
        );
    });

    it("backslashes are correctly escaped", async () => {
        const query1 = `SELECT 1 WHERE {label/special} = "Middle"`;
        const offset = query1.length - 1;
        const list = await complete(query1, offset, ldmObjects, labelElementsFunction);
        const items: CompletionItem[] = list.items;
        expect(items).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    insertText: '"Middle-quoted\\\\\\"title"',
                }),
            ]),
        );
    });
});

describe("completion item sort text", () => {
    /**
     * Verifies that items are sorted according to the template
     * @param items - array of CompletionItem
     * @param template - array of Kind defines ordering
     */
    function verifyOrder(items: CompletionItem[], template: CompletionItemKind[]): void {
        const sortedItems = items.sort((a, b) =>
            (a.sortText ?? a.label).localeCompare(b.sortText ?? b.label),
        );
        const templateSortedItems = [...items].sort((a, b) => {
            const aIdx = template.findIndex((kind) => kind === a.kind);
            const bIdx = template.findIndex((kind) => kind === b.kind);
            if (aIdx === bIdx) {
                return (a.sortText ?? a.label).localeCompare(b.sortText ?? b.label);
            } else if (aIdx === -1) {
                return 1;
            } else if (bIdx === -1) {
                return -1;
            } else {
                return aIdx - bIdx;
            }
        });
        const k2t = (it: CompletionItem) => {
            const kind = it.kind;
            if (!kind) return "undefined";
            const obj: { [key in CompletionItemKind]?: string } = {
                [Kind.Dataset]: "Dataset",
                [Kind.Fact]: "Fact",
                [Kind.Metric]: "Metric",
                [Kind.Label]: "Label",
                [Kind.LabelElement]: "Label element",
                [Kind.Function]: "Function",
                [Kind.Keyword]: "Keyword",
                [Kind.Operator]: "Operator",
                [Kind.Snippet]: "Snippet",
            };
            return obj[kind] ?? `CompletionItemKind(${kind})`;
        };
        expect(sortedItems.map(k2t)).toEqual(templateSortedItems.map(k2t));
    }

    it.each([
        ["after IF: metrics > functions", "SELECT IF ", [Kind.Metric, Kind.Fact, Kind.Label, Kind.Function]],
        ["in SELECT: functions > metrics > facts ", "SELECT ", [Kind.Function, Kind.Metric, Kind.Fact]],
        ["in SUM: facts > metrics > functions", "SELECT SUM(", [Kind.Fact, Kind.Metric, Kind.Function]],
        [
            "after AND: attributes > metrics > facts",
            "SELECT 1 WHERE TRUE AND ",
            [Kind.Label, Kind.Metric, Kind.Fact],
        ],
        [
            "after NOT: attributes > metrics > facts",
            "SELECT 1 WHERE TRUE OR NOT ",
            [Kind.Label, Kind.Metric, Kind.Fact],
        ],
        ["in IFNULL: metrics > functions", "SELECT IFNULL(", [Kind.Metric, Kind.Function]],
        ["in VAR: facts > metrics", "SELECT VAR(", [Kind.Fact, Kind.Metric]],
        [
            "after WHERE: attributes > metrics > facts > functions",
            "SELECT 1 WHERE ",
            [Kind.Label, Kind.Metric, Kind.Fact, Kind.Function],
        ],
        [
            "after WITH PF EXCEPT: attributes > functions",
            "SELECT 1 WITH PF EXCEPT ",
            [Kind.Label, Kind.Function],
        ],
        [
            "after BY: datasets > attributes > keywords",
            "SELECT 1 BY ",
            [Kind.Dataset, Kind.Label, Kind.Keyword],
        ],
        ["in running functions: facts > metrics", "SELECT RUNSUM(", [Kind.Fact, Kind.Metric]],
        ["in arithmetic: facts > metrics", "SELECT 1 + ", [Kind.Fact, Kind.Metric]],
    ])("%s", async (_desc: string, query: string, template: CompletionItemKind[]) => {
        const list = await complete(query, undefined, ldmObjects);
        verifyOrder(list.items, template);
    });

    it("label elements >> other", async () => {
        const query = `SELECT AVG({fact/1}) WHERE {label/4} = `;
        const list = await complete(query, undefined, ldmObjects, labelElementsFunction);
        const template = [Kind.LabelElement];
        verifyOrder(list.items, template);
    });

    it("order by in last and first value does not suggest by all others", async () => {
        const query = `SELECT LAST_VALUE(SUM({fact/1})) ORDER `;
        const list = await complete(query);
        expect(list.items.length).toBe(1);
    });
});

function stringToCompletionItem(label: string, insertText?: string, range?: Range): CompletionItem {
    if (insertText) {
        if (range) {
            return { label: label, insertText: insertText, textEdit: TextEdit.replace(range, insertText) };
        } else {
            return { label: label, insertText: insertText };
        }
    } else {
        if (range) {
            return { label: label, textEdit: TextEdit.replace(range, label) };
        } else {
            return { label: label };
        }
    }
}

describe("all MAQL tokens either have custom descriptions or are not suggested", () => {
    const vocabulary = new Vocabulary(MaqlLexer.literalNames, MaqlLexer.symbolicNames);
    it.each(
        Array(vocabulary.maxTokenType)
            .fill(1)
            .map((v, i) => [vocabulary.getSymbolicName(v + i), v + i]),
    )(`%s token`, (_name: string | null, idx: number) => {
        const desc = descriptions.filter((desc) => desc.triggerTokenId === idx);
        // Token should either be ignored or have descriptions
        expect(ignoredTokens.has(idx) || desc.length > 0).toBe(true);
        expect(desc.map((desc) => desc.kind)).not.toContain(undefined);
    });
});

function insertText(ldmObject: ITigerMetadataObject): string {
    return `{${ldmObject.tigerType}/${ldmObject.id}}`;
}

function expectInsertTexts(items: CompletionItem[], shouldContain: string[], shouldNotContain: string[]) {
    const insertTexts: string[] = items.map((it) => it.label.toUpperCase());
    expect(insertTexts).toEqual(expect.arrayContaining(shouldContain.map((it) => it.toUpperCase())));
    const unexpectedInsertTexts = shouldNotContain
        .map((it) => it.toUpperCase())
        .filter((it) => insertTexts.includes(it));
    expect(unexpectedInsertTexts).toEqual([]);
}

function expectDateObjects(items: CompletionItem[], objects: LdmObjects) {
    expect(items).toEqual(
        expect.arrayContaining(
            objects
                .get("label", "date")
                .map((ldmObject) =>
                    expect.objectContaining(stringToCompletionItem(ldmObject.title, insertText(ldmObject))),
                ),
        ),
    );
    expect(items).not.toEqual(
        expect.arrayContaining(
            objects
                .get("label", "regular")
                .map((ldmObject) =>
                    expect.objectContaining(stringToCompletionItem(ldmObject.title, insertText(ldmObject))),
                ),
        ),
    );
}
