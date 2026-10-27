// (C) 2021-2026 GoodData Corporation

import {
    DefaultErrorStrategy,
    FailedPredicateException,
    InputMismatchException,
    NoViableAltException,
    type Token,
} from "antlr4ng";
import { groupBy } from "lodash-es";
import { Diagnostic, DiagnosticSeverity, Range } from "vscode-languageserver";

import {
    AbstractAstVisitor,
    type AstNode,
    MaqlLexer,
    type Operator,
    type OperatorNode,
    type StringLiteralNode,
    SyntaxErrorListener,
} from "@gooddata/maql-antlr4ts";
import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, serializeObjRef } from "@gooddata/sdk-model";

import { ErrorCodes, diagnosticsSource } from "./constants.js";
import { getInvalidDateElementPattern } from "./dateElementFormat.js";
import { findAllObjects } from "./findObjects.js";
import { labelElementsFinder } from "./labelElements.js";
import {
    type ITigerMetadataObject,
    type LabelElementsFunc,
    type LdmObjects,
    isITigerAttribute,
    isITigerLabel,
} from "./metadata/model.js";
import { validateParameterConstraints } from "./parameterConstraints.js";
import { MaqlMetric } from "./parseMaql.js";
import { AntlrRange, type IMaqlObject, type IMaqlString, defaultRange, tokenRange } from "./tokenRanges.js";
import { AstTypeChecker } from "./types/typeChecking.js";
import { TypeModel } from "./types/typeModel.js";

interface IErrorDescription {
    message(tokenText?: string): string;

    code: ErrorCodes;
}

export const errorTokenDescriptions = new Map<number, IErrorDescription>([
    [
        MaqlLexer.UnterminatedString,
        {
            message(): string {
                return "missing '\"' at the end of a string";
            },
            code: ErrorCodes.UnterminatedString,
        },
    ],
    // [
    //     // TODO Reuse for "no function definition found"
    //     MaqlLexer.Identifier,
    //     {
    //         message(tokenText: string): string {
    //             return `undefined keyword '${tokenText}'`;
    //         },
    //         code: ErrorCodes.UndefinedKeyword,
    //     },
    // ],
    [
        MaqlLexer.ERROR_CHARACTER,
        {
            message(tokenText: string): string {
                return `unexpected character '${tokenText}'`;
            },
            code: ErrorCodes.UnrecognizedInput,
        },
    ],
    [
        MaqlLexer.UNKNOWN_TYPE,
        {
            message(tokenText: string): string {
                return `invalid object type '${tokenText}'`;
            },
            code: ErrorCodes.InvalidType,
        },
    ],
    // [
    //     // was removed with top-win identifiers, will probably be reintroduced at some point in the future
    //     MaqlLexer.OBJECT_EXTRA_SUFFIX,
    //     {
    //         message(tokenText: string): string {
    //             return `too many identifiers: ${tokenText.slice(1).replace(/\//g, ", ")}`;
    //         },
    //         code: ErrorCodes.ExtraIdentifiersInObject,
    //     },
    // ],
]);

export const errorTokens: number[] = Array.from(errorTokenDescriptions.keys());

export async function validate(
    query: string,
    ldmObjects?: LdmObjects,
    labelElementsFunc?: LabelElementsFunc,
): Promise<Diagnostic[]> {
    const metric = new MaqlMetric(query);
    const parserDiagnostics = validateByParser(metric);
    // If any errors were encountered, go through all tokens and match any error tokens to specific diagnostics
    const lexerDiagnostics = parserDiagnostics.length > 0 ? validateByLexer(metric) : [];
    // Verify that semantic rules are followed
    const semanticDiagnostics = validateSemantics(metric.ast);
    // Verify that objects in the query exist
    const objectsDiagnostics = ldmObjects ? validateObjects(metric, ldmObjects) : [];
    // Verify that strings in the query are valid label elements
    const labelDiagnostics = await validateLabelElements(metric, ldmObjects, labelElementsFunc);
    // Verify types
    const typeDiagnostics = ldmObjects ? validateTypes(metric.ast, ldmObjects) : [];
    const constraintsDiagnostics = ldmObjects ? validateParameterConstraints(metric, ldmObjects) : [];
    return parserDiagnostics.concat(
        lexerDiagnostics,
        semanticDiagnostics,
        typeDiagnostics,
        objectsDiagnostics,
        constraintsDiagnostics,
        labelDiagnostics.flat(),
    );
}

function validateSemantics(root: AstNode): Diagnostic[] {
    const validator = new SemanticValidator();
    return validator.visit(root);
}

function validateByParser(metric: MaqlMetric): Diagnostic[] {
    const syntaxErrorListener = new SyntaxErrorListener();
    // oxlint-disable-next-line @typescript-eslint/no-unused-expressions
    metric.addErrorListener(syntaxErrorListener).setErrorHandler(new DefaultErrorStrategy()).tree; // parse MAQL
    return syntaxErrorListener.antlrErrors.map((error) => {
        const errorCode: number = ((parserError): number => {
            // only the actual instance of error will match 'true'
            switch (true) {
                case parserError instanceof InputMismatchException:
                    return ErrorCodes.InputMismatch;
                case parserError instanceof NoViableAltException:
                    return ErrorCodes.NoViableAlternative;
                case parserError instanceof FailedPredicateException:
                    return ErrorCodes.FailedPredicate;
                default:
                    return ErrorCodes.UnspecifiedError;
            }
        })(error.error);
        const range = error.offendingToken
            ? tokenRange(error.offendingToken)
            : defaultRange(error.position.line, error.position.character);
        return Diagnostic.create(
            range,
            error.message,
            DiagnosticSeverity.Error,
            errorCode,
            diagnosticsSource,
        );
    });
}

function validateByLexer(metric: MaqlMetric): Diagnostic[] {
    return metric.lexer
        .getAllTokens()
        .map((token: Token) => handleErrorToken(token))
        .filter((diagnostic): diagnostic is Diagnostic => !!diagnostic);
}

function validateObjects(metric: MaqlMetric, ldmObjects: LdmObjects): Diagnostic[] {
    const foundObjects = findAllObjects(metric);

    return foundObjects
        .map((foundObject) => {
            const existingObjects = foundObject.tigerType ? ldmObjects.get(foundObject.tigerType) : undefined;
            if (!existingObjects) {
                return Diagnostic.create(
                    foundObject.range.toRange(),
                    `type '${foundObject.actualType}' is not valid`,
                    DiagnosticSeverity.Error,
                    ErrorCodes.InvalidType,
                    diagnosticsSource,
                );
            }
            return existingObjects.find((obj: ITigerMetadataObject) =>
                areObjRefsEqual(obj.ref, foundObject.ref),
            )
                ? null
                : Diagnostic.create(
                      foundObject.range.toRange(),
                      `${foundObject.tigerType} '${foundObject.id}' not found`,
                      DiagnosticSeverity.Error,
                      ErrorCodes.ObjectNotFound,
                      diagnosticsSource,
                  );
        })
        .filter((diagnostic): diagnostic is Diagnostic => !!diagnostic);
}

async function validateLabelElements(
    metric: MaqlMetric,
    ldmObjects?: LdmObjects,
    labelElementsFunc?: LabelElementsFunc,
): Promise<Diagnostic[][]> {
    if (!ldmObjects && !labelElementsFunc) {
        return [];
    }
    const foundPairs = labelElementsFinder(metric);
    const stringsGrouped = groupBy(foundPairs, (pair) => serializeObjRef(pair[0].ref));
    return Promise.all(
        Object.entries(stringsGrouped).map(async ([_ref, pairs]) => {
            const label: IMaqlObject = pairs[0][0]; // all the labels from 'pairs' have the same ref (identity)
            const granularity = getDateGranularity(label, ldmObjects);
            const formatDiagnostics: Diagnostic[] = [];
            const elements: IMaqlString[] = [];
            pairs.forEach(([, element]) => {
                const expectedPattern = getInvalidDateElementPattern(element.string, granularity);
                if (expectedPattern) {
                    formatDiagnostics.push(
                        invalidLabelElementDiagnostic(
                            element,
                            `"${element.string}" does not match the format ${expectedPattern} expected by {${label.tigerType}/${label.id}}`,
                        ),
                    );
                } else {
                    elements.push(element);
                }
            });
            if (!labelElementsFunc || elements.length === 0) {
                return formatDiagnostics; // malformed values are not sent to the backend, it would reject them anyway
            }
            const result = await labelElementsFunc(
                [label],
                [],
                { elements: { values: elements.map((element) => element.string) } },
                elements.length,
            );
            if (result.rejected.includes(label)) {
                // the query for the label was rejected, only a rejection of the values themselves allows a claim
                return formatDiagnostics.concat(
                    rejectedElementsDiagnostics(elements, result.rejectionReasons?.get(label)),
                );
            }
            if (result.list.elements.length === elements.length) {
                return formatDiagnostics; // all label elements were returned
            }
            const resultElements: (string | null)[] = result.list.elements.map((element) => element.title);
            return formatDiagnostics.concat(
                elements
                    .map((element) => labelElementInResult(element, label, resultElements))
                    .filter((diagnostic): diagnostic is Diagnostic => !!diagnostic),
            );
        }),
    );
}

function getDateGranularity(label: IMaqlObject, ldmObjects?: LdmObjects) {
    const object = ldmObjects?.findObject(label);
    return object &&
        (isITigerLabel(object) || isITigerAttribute(object)) &&
        object.tigerTypeModifier === "date"
        ? object.granularity
        : undefined;
}

/**
 * The backend rejects the elements query with 400 Bad Request when the values are invalid for the label,
 * e.g. a date value in a wrong format for a granularity the client-side check does not cover.
 * Any other failure (network, server error, ...) allows no claim about the values.
 */
function rejectedElementsDiagnostics(elements: IMaqlString[], reason: unknown): Diagnostic[] {
    if (!isUnexpectedResponseError(reason) || reason.httpStatus !== 400) {
        return [];
    }
    const responseBody = reason.responseBody;
    const detail =
        typeof responseBody === "object" &&
        responseBody !== null &&
        "detail" in responseBody &&
        typeof responseBody.detail === "string"
            ? responseBody.detail
            : undefined;
    if (!detail) {
        return [];
    }
    // the backend reports the first offending value, mark it if it can be identified, otherwise mark all of them
    const offending = elements.filter((element) => detail.includes(`'${element.string}'`));
    return (offending.length > 0 ? offending : elements).map((element) =>
        invalidLabelElementDiagnostic(element, detail),
    );
}

function invalidLabelElementDiagnostic(element: IMaqlString, message: string): Diagnostic {
    return Diagnostic.create(
        element.range.toRange(),
        message,
        DiagnosticSeverity.Error,
        ErrorCodes.InvalidLabelElementValue,
        diagnosticsSource,
    );
}

function validateTypes(ast: AstNode, ldmObjects: LdmObjects): Diagnostic[] {
    const stringLabelIds = ldmObjects.get("label", "regular").map((label) => label.id);
    const dateLabelIds = ldmObjects.get("label", "date").map((label) => label.id);
    const typeChecker = new AstTypeChecker(new TypeModel(stringLabelIds, dateLabelIds));
    typeChecker.visit(ast);
    const typeViolations = typeChecker.typeConstraintsViolations;
    return typeViolations.map((violation) => {
        const range = violation.range
            ? AntlrRange.fromAstRange(violation.range).toRange()
            : Range.create(0, 0, 0, 0);
        return Diagnostic.create(
            range,
            violation.message,
            DiagnosticSeverity.Error,
            ErrorCodes.InvalidType,
            diagnosticsSource,
        );
    });
}

/**
 * @returns null if "element" is in "resultElements", diagnostic signifying the error otherwise
 */
function labelElementInResult(
    element: IMaqlString,
    label: IMaqlObject,
    resultElements: (string | null)[],
): Diagnostic | null {
    return resultElements.includes(element.string)
        ? null
        : Diagnostic.create(
              element.range.toRange(),
              `"${element.string}" is not an element of {${label.tigerType}/${label.id}}`,
              DiagnosticSeverity.Warning,
              ErrorCodes.LabelElementNotFound,
              diagnosticsSource,
          );
}

class SemanticValidator extends AbstractAstVisitor<Diagnostic[]> {
    private readonly EQUALITY_OPERATORS: Operator[] = ["=", "<>", "in", "not in"];

    defaultResult(): Diagnostic[] {
        return [];
    }

    protected override aggregateResult(aggregate: Diagnostic[], nextResult: Diagnostic[]): Diagnostic[] {
        return aggregate.concat(nextResult);
    }

    override visitOperatorNode(node: OperatorNode): Diagnostic[] {
        const childrenResult = this.visitChildren(node);
        if (
            !this.EQUALITY_OPERATORS.includes(node.type) &&
            node.range !== undefined &&
            // this is only a shallow check, consider expanding the type system for a full check
            node.content.some((operand) => operand.type === "null")
        ) {
            return this.aggregateResult(childrenResult, [
                Diagnostic.create(
                    AntlrRange.fromAstRange(node.range).toRange(),
                    "Only equality operators can be used with NULL",
                    DiagnosticSeverity.Error,
                    ErrorCodes.InvalidOperator,
                ),
            ]);
        }
        return childrenResult;
    }

    override visitStringLiteralNode(node: StringLiteralNode): Diagnostic[] {
        if (node.value.toLowerCase() === "null" && node.range) {
            return [
                Diagnostic.create(
                    AntlrRange.fromAstRange(node.range).toRange(),
                    `This is a string literal containing the word "${node.value}". ` +
                        "Perhaps you meant the NULL keyword (no quotes)?",
                    DiagnosticSeverity.Warning,
                    ErrorCodes.SuspiciousStringLiteral,
                ),
            ];
        }
        return [];
    }
}

function handleErrorToken(token: Token): Diagnostic | undefined {
    const errorDescription = errorTokenDescriptions.get(token.type);
    if (!errorDescription) return;
    return Diagnostic.create(
        tokenRange(token),
        errorDescription.message(token.text),
        DiagnosticSeverity.Error,
        errorDescription.code,
        diagnosticsSource,
    );
}
