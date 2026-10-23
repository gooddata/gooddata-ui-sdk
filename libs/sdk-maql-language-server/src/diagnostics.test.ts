// (C) 2021-2026 GoodData Corporation

// oxlint-disable typescript-eslint/require-array-sort-compare

import { describe, expect, it } from "vitest";
import { type Diagnostic, DiagnosticSeverity, Position, Range } from "vscode-languageserver";

import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import {
    type DateAttributeGranularity,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogDateDataset,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { ErrorCodes } from "./constants.js";
import { validate } from "./diagnostics.js";
import { type ITigerMetadataObjectStub, type LabelElementsFunc, LdmObjects } from "./metadata/model.js";
import { labelElementsFunction, ldmObjects, mockLabelElements } from "./tests/metadata.test.helpers.js";

describe("lexer diagnostics", () => {
    it("valid simple query", () => {
        const query = "SELECT SUM({fact/1});";
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([]);
        });
    });

    it("misspelled select as selext", () => {
        const query = "SELEXT SUM({fact/1});";
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        message: "missing 'select' at 'SELEXT'",
                        range: {
                            start: Position.create(0, 0),
                            end: Position.create(0, 6),
                        },
                        code: ErrorCodes.UnspecifiedError,
                    }),
                ]),
            );
        });
    });

    it("misspelled select as selext and sum as sun", () => {
        const query = "SELEXT\nSUN({fact/1});";
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        range: {
                            start: Position.create(0, 0),
                            end: Position.create(0, 6),
                        },
                        code: ErrorCodes.UnspecifiedError,
                    }),
                    expect.objectContaining({
                        range: {
                            start: Position.create(1, 0),
                            end: Position.create(1, 3),
                        },
                        code: ErrorCodes.UnspecifiedError,
                    }),
                ]),
            );
        });
    });

    it("multiline unterminated string", () => {
        const query = 'SELECT "Lorem ipsum\ndolor sit amet';
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        range: {
                            start: Position.create(0, "SELECT".length + 1),
                            end: Position.create(1, "dolor sit amet".length),
                        },
                        code: ErrorCodes.UnterminatedString,
                    }),
                ]),
            );
        });
    });

    it("unterminated string with comment on the first line", () => {
        const query = '# line comment\nSELECT "Lorem ipsum dolor sit amet';
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        range: {
                            start: Position.create(1, "SELECT".length + 1),
                            end: Position.create(1, 'SELECT "Lorem ipsum dolor sit amet'.length),
                        },
                        code: ErrorCodes.UnterminatedString,
                    }),
                ]),
            );
        });
    });
});

describe("find non-existent objects", () => {
    const fact = `{${ldmObjects.get("fact")[0].tigerType}/${ldmObjects.get("fact")[0].id}}`;
    const label = `{${ldmObjects.get("label")[0].tigerType}/${ldmObjects.get("label")[0].id}}`;

    it("existing objects are recognised", () => {
        const query = `select sum(${fact}) where ${label} between "a" and "z";`;
        const result = validate(query, ldmObjects);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([]);
        });
    });

    it("nonexistent fact", () => {
        const query = `select sum({fact/non-existent}) where ${label} between "a" and "z";`;
        const result = validate(query, ldmObjects);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([
                expect.objectContaining({
                    range: {
                        start: Position.create(0, "select sum(".length),
                        end: Position.create(0, "select sum({fact/non-existent}".length),
                    },
                    code: ErrorCodes.ObjectNotFound,
                }),
            ]);
        });
    });

    it("multiple invalid facts and invalid label", () => {
        const query = `select covar({fact/non-existent1}, {fact/non-existent2}) where {label/non-ex-3} between "a" and "z";`;
        const result = validate(query, ldmObjects);
        return result.then((diagnostics) => {
            expect(diagnostics.sort()).toEqual(
                [
                    expect.objectContaining({
                        range: Range.create(0, 13, 0, 33),
                        code: ErrorCodes.ObjectNotFound,
                    }),
                    expect.objectContaining({
                        range: Range.create(0, 35, 0, 55),
                        code: ErrorCodes.ObjectNotFound,
                    }),
                    expect.objectContaining({
                        range: Range.create(0, 63, 0, 79),
                        code: ErrorCodes.ObjectNotFound,
                    }),
                ].sort(),
            );
        });
    });

    it("local type is not accepted", () => {
        const query = `select sum({local/a})`;
        const result = validate(query, ldmObjects);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([
                expect.objectContaining({
                    range: {
                        start: Position.create(0, "select sum(".length),
                        end: Position.create(0, "select sum({local/a}".length),
                    },
                    code: ErrorCodes.InvalidType,
                }),
            ]);
        });
    });

    it("existing string parameter reference is accepted", () => {
        const query = `select sum(${fact}) where ${label} = {parameter/scenario}`;
        const result = validate(query, ldmObjects);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([]);
        });
    });

    it("nonexistent parameter", () => {
        const query = `select sum(${fact}) where ${label} = {parameter/non-existent}`;
        const result = validate(query, ldmObjects);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([
                expect.objectContaining({
                    message: "parameter 'non-existent' not found",
                    range: {
                        start: Position.create(0, `select sum(${fact}) where ${label} = `.length),
                        end: Position.create(0, query.length),
                    },
                    code: ErrorCodes.ObjectNotFound,
                }),
            ]);
        });
    });

    it("prompt type is not accepted", () => {
        const query = `select sum(${fact}) where {prompt/p}`;
        const result = validate(query, ldmObjects);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([
                expect.objectContaining({
                    range: {
                        start: Position.create(0, `select sum(${fact}) where `.length),
                        end: Position.create(0, `select sum(${fact}) where {prompt/p}`.length),
                    },
                    code: ErrorCodes.InvalidType,
                }),
            ]);
        });
    });
});

// Production always validates with the catalog, which also enables the date value format check;
// regular labels must behave the same with and without it.
describe.each([
    ["without the catalog", undefined],
    ["with the catalog", ldmObjects],
])("label elements diagnostics %s", (_name, catalog) => {
    const label = ldmObjects.get("label")[0];
    // objects not in the catalog (the test labels) are reported, only label element diagnostics matter here
    const validateElements = async (query: string) =>
        (await validate(query, catalog, labelElementsFunction)).filter(
            (diagnostic) => diagnostic.code !== ErrorCodes.ObjectNotFound,
        );
    const element = mockLabelElements?.get(serializeObjRef(label.ref))?.[0]?.title;

    it("valid label element", () => {
        const query = `select sum({fact/1}) where {${label.tigerType}/${label.id}} = "${element}"`;
        const result = validateElements(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([]);
        });
    });

    it("invalid label element", () => {
        const query = `select sum({fact/1}) where {${label.tigerType}/${label.id}} =` + '\n"nonexistent"';
        const result = validateElements(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([
                labelElementDiagnostic(Range.create(1, 0, 1, '"nonexistent"'.length)),
            ]);
        });
    });

    it("string after LIKE is not checked", () => {
        const query = `select sum({fact/1}) where {${label.tigerType}/${label.id}} LIKE "nonexistent%"`;
        const result = validateElements(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([]);
        });
    });

    it("string not marked if the label elements are unavailable", () => {
        const query = `select sum({fact/1}) where {label/this-is-a-date-maybe} = "2012-12-21"`;
        const result = validateElements(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([]);
        });
    });

    it("invalid label elements in BETWEEN clause", () => {
        const query =
            `select sum({fact/1}) where {${label.tigerType}/${label.id}} BETWEEN` +
            '\n"nonexistent00" AND\n"nonexistent99"';
        const result = validateElements(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([
                labelElementDiagnostic(Range.create(1, 0, 1, '"nonexistent00"'.length)),
                labelElementDiagnostic(Range.create(2, 0, 2, '"nonexistent99"'.length)),
            ]);
        });
    });

    it("multiple elements for different labels", () => {
        const query =
            'select sum({fact/1}) where {label/4} IN\n("Not-fruit", "Coconut", "Apricot") OR {label/special} IN\n("no1", "n0")';
        const result = validateElements(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([
                labelElementDiagnostic(Range.create(1, 1, 1, 12)),
                labelElementDiagnostic(Range.create(2, 1, 2, 6)),
                labelElementDiagnostic(Range.create(2, 8, 2, 12)),
            ]);
        });
    });

    it("does not check the date format of values of regular labels", () => {
        const query = `select sum({fact/1}) where {${label.tigerType}/${label.id}} = "2026-31-05 12:51"`;
        const result = validateElements(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([
                labelElementDiagnostic(
                    Range.create(0, query.length - '"2026-31-05 12:51"'.length, 0, query.length),
                ),
            ]);
        });
    });
});

describe("date label elements format diagnostics", () => {
    const dateLdmObjects = new LdmObjects(
        [],
        [],
        [],
        [],
        [dateDataset("activity", ["GDC.time.minute", "GDC.time.date", "GDC.time.day_in_week"])],
        [],
    );
    const minute = "{label/activity.minute}";
    const query = (condition: string) => `select sum({fact/1}) where ${condition}`;
    // the catalog contains only the date dataset, the fact is reported as not found
    const validateDates = async (maql: string, elementsFunc?: LabelElementsFunc) =>
        (await validate(maql, dateLdmObjects, elementsFunc)).filter(
            (diagnostic) => diagnostic.code !== ErrorCodes.ObjectNotFound,
        );

    it("marks a value not matching the granularity format as an error", async () => {
        const diagnostics = await validateDates(query(`${minute} = "2026-31-05 12:51"`));
        expect(diagnostics).toEqual([
            expect.objectContaining({
                range: rangeOf(query(`${minute} = `), '"2026-31-05 12:51"'),
                severity: DiagnosticSeverity.Error,
                code: ErrorCodes.InvalidLabelElementValue,
                message:
                    '"2026-31-05 12:51" does not match the format YYYY-MM-DD HH24:MI expected by {label/activity.minute}',
            }),
        ]);
    });

    it("accepts values matching the granularity format", async () => {
        const diagnostics = await validateDates(
            query(`${minute} = "2026-05-31 12:51" AND {label/activity.date} = "2026-05-31"`),
        );
        expect(diagnostics).toEqual([]);
    });

    it("checks the date attribute referenced directly", async () => {
        const diagnostics = await validateDates(query('{attribute/activity.date} = "31/05/2026"'));
        expect(diagnostics).toEqual([invalidLabelElementDiagnostic()]);
    });

    it("does not check periodical granularities", async () => {
        const diagnostics = await validateDates(query('{label/activity.day_in_week} = "Monday"'));
        expect(diagnostics).toEqual([]);
    });

    it("sends only well-formed values to the backend", async () => {
        const requested: string[][] = [];
        const elementsFunc: LabelElementsFunc = async <T extends ITigerMetadataObjectStub>(
            _labels: T[],
            _excluded: string[],
            options: Parameters<LabelElementsFunc>[2],
        ) => {
            const values = (options.elements as { values: string[] }).values;
            requested.push(values);
            return {
                list: {
                    elements: values.map((value) => ({ title: value, uri: value })),
                    isIncomplete: false,
                },
                rejected: [],
            };
        };
        const diagnostics = await validateDates(
            query(`${minute} IN ("2026-31-05 12:51", "2026-05-31 12:51")`),
            elementsFunc,
        );
        expect(requested).toEqual([["2026-05-31 12:51"]]);
        expect(diagnostics).toEqual([invalidLabelElementDiagnostic()]);
    });

    it("does not call the backend when no value is well-formed", async () => {
        let called = false;
        const elementsFunc: LabelElementsFunc = async () => {
            called = true;
            return { list: { elements: [], isIncomplete: false }, rejected: [] };
        };
        await validateDates(query(`${minute} = "2026-31-05 12:51"`), elementsFunc);
        expect(called).toBe(false);
    });
});

describe("rejected label elements query diagnostics", () => {
    const label = "{label/4}";
    const query = `select sum({fact/1}) where ${label} IN ("2026-1-1", "13")`;
    const rejectingElementsFunc =
        (reason: unknown): LabelElementsFunc =>
        async <T extends ITigerMetadataObjectStub>(labels: T[]) => ({
            list: { elements: [], isIncomplete: false },
            rejected: labels,
            rejectionReasons: new Map(labels.map((rejectedLabel) => [rejectedLabel, reason])),
        });
    const badRequest = (detail: string) =>
        new UnexpectedResponseError("Bad Request", 400, { status: 400, title: "Bad Request", detail });

    it("marks the value reported by the backend with its message", async () => {
        const detail =
            "Expected granularity='DAY_OF_MONTH' with range=<1..31> but found dateString='2026-1-1'";
        const diagnostics = await validate(query, undefined, rejectingElementsFunc(badRequest(detail)));
        expect(diagnostics).toEqual([
            expect.objectContaining({
                range: rangeOf(`select sum({fact/1}) where ${label} IN (`, '"2026-1-1"'),
                severity: DiagnosticSeverity.Error,
                code: ErrorCodes.InvalidLabelElementValue,
                message: detail,
            }),
        ]);
    });

    it("marks all values when the backend message does not identify one", async () => {
        const diagnostics = await validate(
            query,
            undefined,
            rejectingElementsFunc(badRequest("Invalid values")),
        );
        expect(diagnostics).toEqual([invalidLabelElementDiagnostic(), invalidLabelElementDiagnostic()]);
    });

    it.each([
        ["a server error", new UnexpectedResponseError("Internal Server Error", 500, { detail: "Failure" })],
        ["a bad request without detail", new UnexpectedResponseError("Bad Request", 400, undefined)],
        ["a network error", new Error("Network Error")],
        ["an unknown reason", undefined],
    ])("makes no claim on %s", async (_name, reason) => {
        const diagnostics = await validate(query, undefined, rejectingElementsFunc(reason));
        expect(diagnostics).toEqual([]);
    });
});

describe("label types diagnostics in filter expressions", () => {
    describe("matching types give no error", () => {
        it.each([
            "SELECT ABS({fact/1}) WHERE {label/date.year} BETWEEN PREVIOUS(YEAR) AND NEXT(YEAR)",
            "SELECT ABS({fact/1}) WHERE {label/date.year} BETWEEN PREVIOUS(YEAR) AND {label/date.year}",
            "SELECT ABS({fact/1}) WHERE {label/date.year} = {label/date.year}",
            'SELECT ABS({fact/1}) WHERE {label/4} = "blabla"',
            "SELECT ABS({fact/1}) WHERE {label/date.year} = NEXT(YEAR)",
            "SELECT ABS({fact/1}) WHERE NEXT(YEAR) <= {label/date.year}",
            "SELECT ABS({fact/1}) WHERE MAX(SELECT {label/date.year} BY {dataset/dataset}) <= {label/date.year}",
            "SELECT ABS({fact/1}) WHERE MAX({label/date.year}, {dataset/dataset}) <= {label/date.year}",
        ])("%s", async (query: string) => {
            const result = await validate(query, ldmObjects, undefined);

            expect(result).toEqual([]);
        });
    });

    describe("mismatched types give an error", () => {
        it.each([
            [
                "SELECT ABS({fact/1}) WHERE {label/4} <= \nNEXT(YEAR)",
                [labelTypeDiagnostic(Range.create(0, 27, 1, 10))],
            ],
            [
                "SELECT ABS({fact/1}) WHERE \nNEXT(YEAR) <= {label/4}",
                [labelTypeDiagnostic(Range.create(1, 0, 1, 23))],
            ],
            [
                "SELECT ABS({fact/1}) WHERE {label/4} BETWEEN \nPREVIOUS(DAY) AND \nNEXT(DAYOFMONTH)",
                [
                    labelTypeDiagnostic(Range.create(1, 0, 1, 13)),
                    labelTypeDiagnostic(Range.create(2, 0, 2, 16)),
                ],
            ],
            [
                "SELECT ABS({fact/1}) WHERE \n{label/date.year} BETWEEN PREVIOUS(DAY) AND \n{label/4}",
                [labelTypeDiagnostic(Range.create(2, 0, 2, 9))],
            ],
            [
                "SELECT ABS({fact/1}) WHERE \n{label/date.year} = \n{label/4}",
                [labelTypeDiagnostic(Range.create(1, 0, 2, 9))],
            ],
            [
                "SELECT ABS({fact/1}) WHERE \n{label/4} BETWEEN \nPREVIOUS(DAY) AND \n{label/date.year}",
                [
                    labelTypeDiagnostic(Range.create(2, 0, 2, 13)),
                    labelTypeDiagnostic(Range.create(3, 0, 3, 17)),
                ],
            ],
        ])("%s", async (query: string, diagnostics: Partial<Diagnostic>[]) => {
            const result = await validate(query, ldmObjects, undefined);

            expect(result).toEqual(diagnostics);
        });
    });
});

describe("semantic diagnostics", () => {
    it("validate query with NULL instead number", () => {
        const query = "SELECT SUM({fact/1}) WHERE {fact/1} = NULL;";
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([]);
        });
    });

    it("validate query with NULL instead string", () => {
        const query = "SELECT SUM({fact/1}) WHERE {attribute/1} = NULL;";
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([]);
        });
    });

    it("NULL after > should fail", () => {
        const query = "SELECT SUM({fact/1}) WHERE {fact/1} > NULL;";
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        range: {
                            start: Position.create(0, 27),
                            end: Position.create(0, 42),
                        },
                        code: ErrorCodes.InvalidOperator,
                    }),
                    expect.objectContaining({
                        message: "Only equality operators can be used with NULL",
                    }),
                ]),
            );
        });
    });

    it("NULL before > should fail", () => {
        const query = "SELECT SUM({fact/1}) WHERE NULL > {attribute/1};";
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        range: {
                            start: Position.create(0, 27),
                            end: Position.create(0, 47),
                        },
                        code: ErrorCodes.InvalidOperator,
                    }),
                    expect.objectContaining({
                        message: "Only equality operators can be used with NULL",
                    }),
                ]),
            );
        });
    });

    it("NULL > NULL should fail", () => {
        const query = "SELECT SUM({fact/1}) WHERE NULL > NULL;";
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        range: {
                            start: Position.create(0, 27),
                            end: Position.create(0, 38),
                        },
                        code: ErrorCodes.InvalidOperator,
                    }),
                    expect.objectContaining({
                        message: "Only equality operators can be used with NULL",
                    }),
                ]),
            );
        });
    });

    it("string literal with 'null' inside should produce warning", () => {
        const query = `SELECT SUM({fact/1}) WHERE {label/1} = "NULL";`;
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        range: {
                            start: Position.create(0, 39),
                            end: Position.create(0, 45),
                        },
                        code: ErrorCodes.SuspiciousStringLiteral,
                    }),
                    expect.objectContaining({
                        message:
                            'This is a string literal containing the word "NULL". ' +
                            "Perhaps you meant the NULL keyword (no quotes)?",
                    }),
                ]),
            );
        });
    });

    it("valid last value query", () => {
        const query = "SELECT LAST_VALUE(SUM({fact/price})) ORDER BY {label/datetime.day};";
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([]);
        });
    });

    it("valid first value query", () => {
        const query = "SELECT FIRST_VALUE(SUM({fact/price})) ORDER BY {label/datetime.day};";
        const result = validate(query);
        return result.then((diagnostics) => {
            expect(diagnostics).toEqual([]);
        });
    });
});

function labelElementDiagnostic(range: Range): Partial<Diagnostic> {
    return expect.objectContaining({
        range: range,
        code: ErrorCodes.LabelElementNotFound,
    });
}

function invalidLabelElementDiagnostic(): Partial<Diagnostic> {
    return expect.objectContaining({
        severity: DiagnosticSeverity.Error,
        code: ErrorCodes.InvalidLabelElementValue,
    });
}

function rangeOf(prefix: string, text: string): Range {
    return Range.create(0, prefix.length, 0, prefix.length + text.length);
}

function dateDataset(id: string, granularities: DateAttributeGranularity[]): ICatalogDateDataset {
    const metadata = {
        uri: "",
        title: id,
        description: "",
        deprecated: false,
        production: true,
        unlisted: false,
    };
    return {
        type: "dateDataset",
        relevance: 0,
        dataSet: { ...metadata, type: "dataSet", id, ref: { identifier: id, type: "dataSet" } },
        dateAttributes: granularities.map((granularity) => {
            const attributeId = `${id}.${granularity.replace("GDC.time.", "")}`;
            const label: IAttributeDisplayFormMetadataObject = {
                ...metadata,
                type: "displayForm",
                id: attributeId,
                ref: { identifier: attributeId, type: "displayForm" },
                attribute: { identifier: attributeId, type: "attribute" },
            };
            return {
                granularity,
                attribute: {
                    ...metadata,
                    type: "attribute",
                    id: attributeId,
                    ref: { identifier: attributeId, type: "attribute" },
                    displayForms: [label],
                },
                defaultDisplayForm: label,
            };
        }),
    };
}

function labelTypeDiagnostic(range: Range): Partial<Diagnostic> {
    return expect.objectContaining({
        range: range,
        code: ErrorCodes.InvalidType,
    });
}
