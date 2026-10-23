// (C) 2022-2026 GoodData Corporation

import { dedent } from "ts-dedent";
import { describe, expect, it } from "vitest";

import {
    type AstNode,
    FunctionNode,
    IdentifierNode,
    ListNode,
    type NumberLiteralFormat,
    NumberLiteralNode,
    type Operator,
    OperatorNode,
    StringLiteralNode,
} from "@gooddata/maql-antlr4ts";
import { type TigerObjectType } from "@gooddata/sdk-backend-tiger";

import { MaqlMetric } from "../parseMaql.js";
import { ldmObjects } from "../tests/metadata.test.helpers.js";

import { MaqlType } from "./hierarchy.js";
import { AstTypeChecker, type ITypeConstraintsViolation } from "./typeChecking.js";
import { TypeModel } from "./typeModel.js";

const typeModel = new TypeModel(
    ldmObjects.get("label", "regular").map((label) => label.id),
    ldmObjects.get("label", "date").map((label) => label.id),
);

describe.each([
    ["SELECT {fact/price} * {fact/quantity}", MaqlType.NUMERIC],
    ["SELECT SUM({fact/price})", MaqlType.NUMERIC],
    ["SELECT COUNT({label/date.year})", MaqlType.NUMERIC],
    ["SELECT MAX({label/date.year})", MaqlType.DATE],
    ["SELECT MAX({label/4})", MaqlType.STRING],
    ["SELECT MAX({label/4}) WHERE {label/4} IN ()", MaqlType.STRING],
    ['SELECT MAX({label/4}) WHERE {label/4} IN ("something")', MaqlType.STRING],
    [func("rank", identifier("fact", "1")), MaqlType.NUMERIC],
    [op("not like", identifier("label", "4"), str("hel%")), MaqlType.BOOLEAN],
    [op("between", identifier("metric", "m1"), num("-10"), num("100")), MaqlType.BOOLEAN],
    [op("in", identifier("metric", "m1"), list(num("-1"), num("1"))), MaqlType.BOOLEAN],
    ["SELECT THIS(DAY, 2)", MaqlType.DATE],
    ["SELECT 233.0", MaqlType.NUMERIC_LITERAL],
    ["SELECT 233", MaqlType.INTEGER_LITERAL],
    ["SELECT -233", MaqlType.INTEGER_LITERAL],
    ["SELECT -233 * -3 / 113", MaqlType.NUMERIC],
    ['SELECT MAX({label/date.year}) > "2000"', MaqlType.BOOLEAN],
    [
        "SELECT SUM({fact/price}) WHERE {label/date.year} <> MAX({label/date.year}, {dataset/witness})",
        MaqlType.NUMERIC,
    ],
    ["SELECT PERCENTILE({fact/1}, 95%) WHERE MAX({fact/1}) > 2000", MaqlType.NUMERIC],
    ["SELECT LEAST({fact/1}, {fact/1.1}, {metric/2})", MaqlType.NUMERIC],
    [
        dedent`
        SELECT LAST_VALUE({fact/campaign_channels.spend})
            ORDER BY {fact/campaign_channels.budget}
            WITHIN({label/campaign_channels.category})
        `,
        MaqlType.NUMERIC,
    ],
    ["SELECT SUM({fact/country_data.value}) WHERE NOT TOP(3) OF ({metric/amount})", MaqlType.NUMERIC],
])("AST valid type checking tests", (query: string | AstNode, resultType: MaqlType) => {
    it(`${createTestName(query)} -> ${MaqlType[resultType]}`, () => {
        const ast = typeof query === "string" ? new MaqlMetric(query).ast : query;
        const typeChecker = new AstTypeChecker(typeModel);
        const treeType = typeChecker.visit(ast);
        expect(typeChecker.typeConstraintsViolations).toHaveLength(0);
        expect(MaqlType[treeType.type]).toEqual(MaqlType[resultType]);
    });
});

describe.each([
    [
        "SELECT MAX({label/date.year}) > 2000",
        MaqlType.BOOLEAN,
        [
            {
                message: dedent`
                    The call expression 'DATE > INTEGER_LITERAL' has invalid arguments
                    Possible definitions:
                    NUMERIC > NUMERIC -> BOOLEAN
                    STRING > STRING -> BOOLEAN
                    DATE > DATE -> BOOLEAN
                    `,
            },
        ],
    ],
    [
        "SELECT SUM({fact/price}) WHERE MAX({label/date.year}) > 2000 AND",
        MaqlType.NUMERIC,
        [
            {
                message: dedent`
                    The call expression 'DATE > INTEGER_LITERAL' has invalid arguments
                    Possible definitions:
                    NUMERIC > NUMERIC -> BOOLEAN
                    STRING > STRING -> BOOLEAN
                    DATE > DATE -> BOOLEAN
                    `,
            },
            { message: "Missing expression" },
        ],
    ],
    ["SELECT SUM()", MaqlType.NUMERIC, [{ message: "Missing expression" }]],
    [
        op("not like", identifier("fact", "price"), str("0.%")),
        MaqlType.BOOLEAN,
        [
            {
                message: dedent`
                    The call expression 'NUMERIC NOT LIKE STRING_LITERAL' has invalid arguments
                    Possible definitions:
                    STRING NOT LIKE STRING_LITERAL -> BOOLEAN
                    DATE NOT LIKE STRING_LITERAL -> BOOLEAN
                    `,
            },
        ],
    ],
    [
        'SELECT (1 + "2" + 3) / 4',
        MaqlType.NUMERIC,
        [
            {
                message: dedent`
                    The call expression 'INTEGER_LITERAL + STRING_LITERAL' has invalid arguments
                    Possible definitions:
                    NUMERIC + NUMERIC -> NUMERIC
                    `,
            },
        ],
    ],
    [
        "SELECT IFNULL({fact/cost}, NULL)",
        MaqlType.NUMERIC,
        [
            {
                message: dedent`
                    The call expression 'IFNULL(NUMERIC, NULL_LITERAL)' has invalid arguments
                    Possible definitions:
                    IFNULL(NUMERIC, NUMERIC_LITERAL) -> NUMERIC
                    `,
            },
        ],
    ],
    [
        "SELECT MAX({label/date.year}) WHERE {label/4}",
        MaqlType.DATE,
        [
            {
                message: "Type mismatch: Expected 'BOOLEAN', but got 'STRING'",
            },
        ],
    ],
    [
        "SELECT MAX({label/4}) WHERE {label/4} IN (10)",
        MaqlType.STRING,
        [
            {
                message: "Type mismatch: Expected 'STRING', but got 'INTEGER_LITERAL'",
            },
        ],
    ],
    [
        "SELECT SUM({fact/country_data.value}) WHERE NOT 10",
        MaqlType.NUMERIC,
        [
            {
                message: dedent`
                    The call expression 'NOT INTEGER_LITERAL' has invalid arguments
                    Possible definitions:
                    NOT BOOLEAN -> BOOLEAN
                    `,
            },
        ],
    ],
    [
        dedent`
        SELECT LAST_VALUE({fact/campaign_channels.spend})
            ORDER BY {dataset/campaign_channels}
            WITHIN({label/campaign_channels.category})
        `,
        MaqlType.NUMERIC,
        [
            {
                message: "Type mismatch: Expected 'NUMERIC' or 'STRING' or 'DATE', but got 'DATASET'",
            },
        ],
    ],
])(
    "AST type constraint violations",
    (query: string | AstNode, resultType: MaqlType, violations: ITypeConstraintsViolation[]) => {
        it(`FAIL: ${createTestName(query)} -> ${MaqlType[resultType]}`, () => {
            const ast = typeof query === "string" ? new MaqlMetric(query).ast : query;
            const typeChecker = new AstTypeChecker(typeModel);
            const treeType = typeChecker.visit(ast);
            expect(typeChecker.typeConstraintsViolations).toHaveLength(violations.length);
            expect(typeChecker.typeConstraintsViolations).toEqual(
                expect.arrayContaining(violations.map((violation) => expect.objectContaining(violation))),
            );
            expect(MaqlType[treeType.type]).toEqual(MaqlType[resultType]);
        });
    },
);

function createTestName(query: string | AstNode) {
    if (typeof query === "string") {
        return query;
    }

    const valuePart = query.value === "" ? "" : `[${query.value}]`;
    return `AST '${query.type}${valuePart}'`;
}

function op(type: Operator, ...operands: AstNode[]): OperatorNode {
    return new OperatorNode(type, operands ?? []);
}

function func(name: string, ...operands: AstNode[]): FunctionNode {
    return new FunctionNode("function", name, operands);
}

function identifier(objectType: TigerObjectType, id: string) {
    return new IdentifierNode("identifier", objectType, id, "test");
}

function str(value: string): StringLiteralNode {
    return new StringLiteralNode(`"${value}"`);
}

function list(...items: AstNode[]): ListNode {
    return new ListNode("list", items);
}

function num(value: string, format?: NumberLiteralFormat): NumberLiteralNode {
    return new NumberLiteralNode("number", value, format);
}
