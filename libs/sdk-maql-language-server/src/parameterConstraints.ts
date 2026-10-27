// (C) 2026 GoodData Corporation

import { groupBy } from "lodash-es";
import { Diagnostic, DiagnosticSeverity, type Range } from "vscode-languageserver";

import {
    type AstNode,
    type CaseNode,
    type ConditionalNode,
    type IdentifierNode,
    MaqlLexer,
    type OperatorNode,
    type StringLiteralNode,
} from "@gooddata/maql-antlr4ts";
import { isStringParameterDefinition } from "@gooddata/sdk-model";

import { ErrorCodes, diagnosticsSource } from "./constants.js";
import { type LdmObjects } from "./metadata/model.js";
import { type MaqlMetric } from "./parseMaql.js";
import { AntlrRange, tokenRange } from "./tokenRanges.js";

export function validateParameterConstraints(metric: MaqlMetric, ldmObjects: LdmObjects): Diagnostic[] {
    const hasConstrainedParameter = ldmObjects
        .get("parameter")
        .some(
            (parameter) =>
                isStringParameterDefinition(parameter.definition) &&
                parameter.definition.constraints?.allowedValues?.length,
        );
    if (!hasConstrainedParameter) {
        return [];
    }
    const caseNodes = findCaseNodes(metric.ast);
    return caseNodes.flatMap((caseNode) => validateCase(caseNode, metric, ldmObjects));
}

function validateCase(caseNode: CaseNode, metric: MaqlMetric, ldmObjects: LdmObjects): Diagnostic[] {
    const { pairs, otherUse } = collectParameterUsage(caseNode);
    const anchor = keywordRange(caseNode, metric);
    const diagnostics: Diagnostic[] = [];
    for (const [parameterId, parameterPairs] of Object.entries(groupBy(pairs, (pair) => pair.parameterId))) {
        const allowedValues = allowedValuesOf(parameterId, ldmObjects);
        if (!allowedValues) {
            continue;
        }
        for (const pair of parameterPairs) {
            const notAllowed = notAllowedDiagnostic(pair, allowedValues);
            if (notAllowed) {
                diagnostics.push(notAllowed);
            }
        }
        if (!anchor || otherUse.has(parameterId)) {
            continue;
        }
        const covered = parameterPairs.map((pair) => pair.literal.value);
        const uncovered = allowedValues.filter((value) => !covered.includes(value));
        if (uncovered.length > 0) {
            diagnostics.push(uncoveredDiagnostic(parameterId, uncovered, anchor));
        }
    }
    return diagnostics;
}

interface IEqualityPair {
    parameterId: string;
    literal: StringLiteralNode;
}

interface ICaseUsage {
    pairs: IEqualityPair[];
    otherUse: Set<string>;
}

function collectParameterUsage(caseNode: CaseNode): ICaseUsage {
    const usage: ICaseUsage = { pairs: [], otherUse: new Set() };
    for (const branch of caseNode.branches) {
        if (!isConditionalNode(branch)) {
            continue;
        }
        const purePairs = pureEqualityPairs(branch.condition);
        if (purePairs) {
            usage.pairs.push(...purePairs);
        } else {
            collectFromCondition(branch.condition, usage);
        }
    }
    return usage;
}

function pureEqualityPairs(condition: AstNode): IEqualityPair[] | undefined {
    if (isParenthesizedNode(condition)) {
        const [inner] = condition.content;
        return inner && condition.content.length === 1 ? pureEqualityPairs(inner) : undefined;
    }
    if (isEqualityNode(condition)) {
        const pair = asParameterEquality(condition);
        return pair ? [pair] : undefined;
    }
    if (isDisjunctionNode(condition)) {
        const childPairs: IEqualityPair[] = [];
        for (const child of condition.content) {
            const pairs = pureEqualityPairs(child);
            if (!pairs) {
                return undefined;
            }
            childPairs.push(...pairs);
        }
        const [first, ...rest] = childPairs;
        return first && rest.every((pair) => pair.parameterId === first.parameterId) ? childPairs : undefined;
    }
    return undefined;
}

function collectFromCondition(node: AstNode, usage: ICaseUsage): void {
    if (isCaseNode(node)) {
        return;
    }
    if (isNegationNode(node)) {
        for (const child of node.content) {
            collectOpaqueUse(child, usage);
        }
        return;
    }
    if (isEqualityNode(node)) {
        const pair = asParameterEquality(node);
        if (pair) {
            usage.pairs.push(pair);
            usage.otherUse.add(pair.parameterId);
            return;
        }
    }
    const parameter = parameterIdentifierOf(node);
    if (parameter) {
        usage.otherUse.add(parameter.id);
        return;
    }
    for (const child of node.content) {
        collectFromCondition(child, usage);
    }
}

function collectOpaqueUse(node: AstNode, usage: ICaseUsage): void {
    if (isCaseNode(node)) {
        return;
    }
    const parameter = parameterIdentifierOf(node);
    if (parameter) {
        usage.otherUse.add(parameter.id);
        return;
    }
    for (const child of node.content) {
        collectOpaqueUse(child, usage);
    }
}

function asParameterEquality(node: OperatorNode): IEqualityPair | undefined {
    if (node.content.length !== 2) {
        return undefined;
    }
    const [left, right] = node.content;
    const parameter = parameterIdentifierOf(left) ?? parameterIdentifierOf(right);
    const literal = [left, right].find(isStringLiteralNode);
    return parameter && literal ? { parameterId: parameter.id, literal } : undefined;
}

function parameterIdentifierOf(node: AstNode): IdentifierNode | undefined {
    return isIdentifierNode(node) && node.objectType === "parameter" ? node : undefined;
}

function keywordRange(caseNode: CaseNode, metric: MaqlMetric): Range | undefined {
    const astRange = caseNode.range;
    if (!astRange) {
        return undefined;
    }
    const token = metric.tokenStream
        .getTokens()
        .find(
            (candidate) =>
                candidate.line - 1 === astRange.start.line &&
                candidate.column === astRange.start.character &&
                (candidate.type === MaqlLexer.CASE || candidate.type === MaqlLexer.IF),
        );
    return token ? tokenRange(token) : undefined;
}

function allowedValuesOf(parameterId: string, ldmObjects: LdmObjects): string[] | undefined {
    const parameter = ldmObjects.get("parameter").find((candidate) => candidate.id === parameterId);
    if (!parameter || !isStringParameterDefinition(parameter.definition)) {
        return undefined;
    }
    const allowedValues = parameter.definition.constraints?.allowedValues;
    return allowedValues?.length ? allowedValues.map((allowed) => allowed.value) : undefined;
}

function notAllowedDiagnostic(pair: IEqualityPair, allowedValues: string[]): Diagnostic | undefined {
    if (!pair.literal.range || allowedValues.includes(pair.literal.value)) {
        return undefined;
    }
    return Diagnostic.create(
        AntlrRange.fromAstRange(pair.literal.range).toRange(),
        `"${pair.literal.value}" is not an allowed value of parameter '${pair.parameterId}' ` +
            `(allowed: ${quoteValues(allowedValues)}) — this comparison can never match`,
        DiagnosticSeverity.Warning,
        ErrorCodes.ParameterValueNotAllowed,
        diagnosticsSource,
    );
}

function uncoveredDiagnostic(parameterId: string, uncovered: string[], anchor: Range): Diagnostic {
    return Diagnostic.create(
        anchor,
        `parameter '${parameterId}': allowed values ${quoteValues(uncovered)} ` +
            "have no matching branch — they fall through to ELSE/NULL",
        DiagnosticSeverity.Information,
        ErrorCodes.ParameterValueUncovered,
        diagnosticsSource,
    );
}

function quoteValues(allowedValues: string[]): string {
    return allowedValues.map((value) => `"${value}"`).join(", ");
}

function isCaseNode(node: AstNode): node is CaseNode {
    return node.type === "case";
}

function isConditionalNode(node: AstNode): node is ConditionalNode {
    return node.type === "when";
}

function isEqualityNode(node: AstNode): node is OperatorNode {
    return node.type === "=";
}

function isNegationNode(node: AstNode): node is OperatorNode {
    return node.type === "not";
}

function isDisjunctionNode(node: AstNode): node is OperatorNode {
    return node.type === "or";
}

function isParenthesizedNode(node: AstNode): boolean {
    return node.type === "()";
}

function isIdentifierNode(node: AstNode): node is IdentifierNode {
    return node.type === "identifier" || node.type === "raw identifier";
}

function isStringLiteralNode(node: AstNode): node is StringLiteralNode {
    return node.type === "string";
}

function findCaseNodes(node: AstNode): CaseNode[] {
    const nested = node.content.flatMap(findCaseNodes);
    return isCaseNode(node) ? [node, ...nested] : nested;
}
