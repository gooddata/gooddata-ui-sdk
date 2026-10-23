// (C) 2021-2026 GoodData Corporation

import MaqlPkg, {
    type AstNode,
    type FunctionNode,
    type GranularityNode,
    type IPosition,
    type IdentifierNode,
    type OperatorNode,
    type StringLiteralNode,
} from "@gooddata/maql-antlr4ts";
const { AbstractAstVisitor, positionInRange } = MaqlPkg;
import { isTigerType, tigerIdTypeToObjectType } from "@gooddata/sdk-backend-tiger";

import { normalizeMaqlObjectType } from "./maqlObjectTypes.js";
import { type MaqlMetric } from "./parseMaql.js";
import {
    AntlrRange,
    type IMaqlObject,
    type IMaqlString,
    type IMaqlTimeMacro,
    type IOperand,
    isMaqlObject,
    isMaqlString,
} from "./tokenRanges.js";

/**
 * Uses a visitor to make a depth-first tree-walk of a MAQL parse tree to find a correct "LabelContext"
 * for a given caret offset
 */
export function findLabelContext(metric: MaqlMetric, position: IPosition): LabelContext {
    const visitor = new LabelContextFinder(position);
    const ast = metric.ast;
    visitor.visit(ast);
    return visitor.caretLabelContext ?? new LabelContext();
}

export function labelElementsFinder(metric: MaqlMetric): [IMaqlObject, IMaqlString][] {
    const visitor = new LabelElementsFinder();
    visitor.visit(metric.ast);
    return visitor.pairs;
}

export class LabelContext {
    readonly labels: IMaqlObject[] = [];
    readonly strings: IMaqlString[] = [];
    readonly timeMacros: IMaqlTimeMacro[] = [];

    get operands(): IOperand[] {
        return [...this.labels, ...this.strings, ...this.timeMacros];
    }

    isEmpty(): boolean {
        return this.operands.length === 0;
    }

    addString(text: string, range: AntlrRange): LabelContext {
        this.strings.push({
            string: text,
            range: range,
        });
        return this;
    }

    addLabel(maqlType: string, id: string, range: AntlrRange, _space?: string): LabelContext {
        // MAQL spells a computed attribute `computed_attribute`; the Tiger type is what the
        // elements query and the catalog lookups understand.
        const type = normalizeMaqlObjectType(maqlType);
        if (!isTigerType(type)) {
            return this; // `type "${type}" of the object {${type}${id}${space ? `/${space}` : ""}} is not valid`
        }
        // A computed attribute buckets rows into string values like a label does, so its values are
        // listed and validated the same way. Its ref carries the computedAttribute type, which the
        // elements query uses to address it (it has no labels of its own).
        if (type === "attribute" || type === "label" || type === "computedAttribute") {
            this.labels.push({
                actualType: type,
                tigerType: type,
                id: id,
                ref: {
                    type: tigerIdTypeToObjectType[type],
                    identifier: id,
                },
                range: range,
            });
        }
        return this;
    }

    addTimeMacro(transformationFunction: string, granularity: string, range: AntlrRange): LabelContext {
        this.timeMacros.push({
            transformationFunction: transformationFunction,
            granularity: granularity,
            range: range,
        });
        return this;
    }

    add(other: LabelContext): LabelContext {
        other.labels.forEach((label) => this.labels.push(label));
        other.timeMacros.forEach((timeMacro) => this.timeMacros.push(timeMacro));
        other.strings.forEach((str) => this.strings.push(str));
        return this;
    }

    toString(): string {
        return (
            "# LabelContext:\n## labels:\n" +
            this.labels.map((label) => `${label.tigerType}/${label.id}`).join("\n") +
            "\n## strings:\n" +
            this.strings.map((string) => string.string).join("\n")
        );
    }
}

class LabelContextMarker extends AbstractAstVisitor<LabelContext> {
    defaultResult(): LabelContext {
        return new LabelContext();
    }

    protected override aggregateResult(aggregate: LabelContext, nextResult: LabelContext): LabelContext {
        return aggregate.add(nextResult);
    }

    override visitFunctionNode(node: FunctionNode): LabelContext {
        const lc = new LabelContext();
        if (node.range === undefined) return lc;
        const name = node.name.toUpperCase();
        const range = AntlrRange.fromAstRange(node.range);
        if (node.type === "time macro") {
            // assume that the first argument of time macro is always granularity
            const granularity = (node.content[0] as GranularityNode)?.value;
            if (granularity) {
                lc.addTimeMacro(name, granularity, range);
            }
        } else if (node.type === "function") {
            // special case for MIN and MAX functions
            // to remove this special case we would need "source" information in function definition
            if (name === "MAX" || name === "MIN") {
                // ignore second argument of MIN/MAX function, as it is just a "witness attribute"
                const [expr, _witness] = node.content;
                if (expr) {
                    lc.add(this.visit(expr));
                }
            }
        } else {
            this.visitChildren(node);
        }
        return lc;
    }

    override visitIdentifierNode(node: IdentifierNode): LabelContext {
        const lc = new LabelContext();
        if (node.range === undefined) return lc;
        const range = AntlrRange.fromAstRange(node.range);
        lc.addLabel(node.objectType, node.id, range, node.space);
        return lc;
    }

    override visitStringLiteralNode(node: StringLiteralNode): LabelContext {
        const lc = new LabelContext();
        if (node.range === undefined) return lc;
        const range = AntlrRange.fromAstRange(node.range);
        return lc.addString(node.value, range);
    }
}

/**
 * Finds a label context relevant to provided caret position
 */
class LabelContextFinder extends LabelContextMarker {
    caretLabelContext: LabelContext | undefined;
    continueTraversal = true;

    constructor(readonly caretPosition: IPosition) {
        super();
    }

    override visit(node: AstNode): LabelContext {
        const lc = super.visit(node);
        if (
            this.continueTraversal &&
            node.contextRange &&
            positionInRange(this.caretPosition, node.contextRange)
        ) {
            this.caretLabelContext = lc;
        }
        return lc;
    }

    override visitOperatorNode(node: OperatorNode): LabelContext {
        // postorder AST traversal
        const lc = super.visitOperatorNode(node);
        // if the caret is in the operands of the following operators, use their label context and look no further
        // idea: it may make sense to add "label context" to type information and unify this with findContext
        switch (node.type) {
            case "=":
            case "<>":
            case ">=":
            case "<=":
            case "<":
            case ">":
            case "like":
            case "ilike":
            case "not like":
            case "not ilike":
            case "between":
            case "not between":
            case "in":
            case "not in":
                if (
                    this.continueTraversal &&
                    node.contextRange &&
                    positionInRange(this.caretPosition, node.contextRange)
                ) {
                    this.continueTraversal = false;
                    this.caretLabelContext = lc;
                }
        }
        // the result of filter expression is a boolean value, therefore inner label context is discarded
        return this.defaultResult();
    }
}

/**
 * Traverses the AST to collect all instances of strings in relation to labels. This can then be used to validate
 * label elements.
 */
class LabelElementsFinder extends LabelContextMarker {
    readonly pairs: [IMaqlObject, IMaqlString][] = [];

    override visitOperatorNode(node: OperatorNode): LabelContext {
        const operandContexts = node.content.map((operand) => this.visit(operand).operands);
        if (node.type !== "like" && node.type !== "not like") {
            this.addOperands(operandContexts);
        }
        return this.defaultResult();
    }

    private addOperands(operandContexts: IOperand[][]) {
        if (operandContexts.length <= 1) {
            return;
        }
        const head = operandContexts[0];
        const tail = operandContexts.slice(1);
        for (const headOp of head) {
            for (const ops of tail) {
                for (const op of ops) {
                    this.pushPair(headOp, op);
                }
            }
        }
        this.addOperands(tail);
    }

    private pushPair(left: IOperand, right: IOperand) {
        if (isMaqlObject(left)) {
            if (isMaqlString(right)) {
                this.pairs.push([left, right]);
            }
        } else if (isMaqlObject(right)) {
            this.pushPair(right, left);
        }
    }
}
