// (C) 2022-2026 GoodData Corporation

import {
    AbstractAstVisitor,
    type AstNode,
    type BooleanLiteralNode,
    type CaseNode,
    type ConditionalNode,
    type EmptyNode,
    type ExpressionNode,
    type FilterNode,
    type FunctionNode,
    type GranularityNode,
    type IRange,
    type IdentifierNode,
    type LastFirstValueFunctionNode,
    type ListNode,
    type NullLiteralNode,
    type NumberLiteralNode,
    type OperatorNode,
    type OrderByElementNode,
    type RankFunctionNode,
    type RankingFilterNode,
    type RunningFunctionNode,
    type SelectNode,
    type StringLiteralNode,
} from "@gooddata/maql-antlr4ts";
import { isTigerType } from "@gooddata/sdk-backend-tiger";

import { normalizeMaqlObjectType } from "../maqlObjectTypes.js";

import { MaqlType, abstractValueTypes, isSubtype, lowestCommonAncestor } from "./hierarchy.js";
import {
    CallNotation,
    type MaqlCallDefinition,
    MaqlCallSignature,
    findFunctionDefinitions,
    getCustomDefinitions,
} from "./signatures.js";
import { type TypeModel } from "./typeModel.js";

export interface ITypeConstraintsViolation {
    readonly message: string;
    readonly range?: IRange;
}

export class TypedAstNode {
    constructor(
        readonly type: MaqlType,
        readonly node: AstNode | null,
    ) {}
}

export class AstTypeChecker extends AbstractAstVisitor<TypedAstNode> {
    constructor(readonly model: TypeModel) {
        super();
    }

    readonly typeConstraintsViolations: ITypeConstraintsViolation[] = [];

    defaultResult(): TypedAstNode {
        return new TypedAstNode(MaqlType.UNIT, null);
    }

    protected override mergeResultWithParent(parentNode: AstNode, result: TypedAstNode): TypedAstNode {
        return {
            // oxlint-disable-next-line typescript-eslint/no-misused-spread
            ...result,
            node: parentNode,
        };
    }

    override visitEmptyNode(node: EmptyNode): TypedAstNode {
        const message = "Missing expression" + (node.value === "" ? "" : `. ${node.value}`);
        this.logViolation(message, node.range);
        return new TypedAstNode(MaqlType.ALL, node);
    }

    override visitSelectNode(node: SelectNode): TypedAstNode {
        if (node.by) {
            this.visit(node.by);
        }
        if (node.forEach) {
            this.visit(node.forEach);
        }
        if (node.datetimeTransformation) {
            this.visit(node.datetimeTransformation);
        }
        if (node.filter) {
            this.visit(node.filter);
        }
        if (node.using) {
            this.visit(node.using);
        }
        if (node.parentFilterModification) {
            this.visit(node.parentFilterModification);
        }
        return this.visit(node.expression);
    }

    override visitExpressionNode(node: ExpressionNode): TypedAstNode {
        return this.visit(node.expression);
    }

    override visitOperatorNode(node: OperatorNode): TypedAstNode {
        const operands = node.content.map((operand) => this.visit(operand));
        switch (node.type) {
            case "not":
                return this.checkBySignature(
                    node,
                    node.type,
                    operands,
                    CallNotation.PREFIX,
                    getCustomDefinitions(node.type),
                );
            case "+":
            case "-":
            case "*":
            case "/":
            case "and":
            case "or":
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
                return this.checkBySignature(
                    node,
                    node.type,
                    operands,
                    CallNotation.INFIX,
                    getCustomDefinitions(node.type),
                );
            case "neg":
                return this.checkUnaryMinusOperator(node, operands);
            case "between":
            case "not between":
                return this.checkBetween(node, operands);
            case "in":
            case "not in":
                return this.checkIn(node, operands);
        }
    }

    private checkUnaryMinusOperator(node: OperatorNode, operands: TypedAstNode[]): TypedAstNode {
        if (!this.checkOperandCount(node, operands.length, 1, "Unary operator '-'")) {
            return new TypedAstNode(MaqlType.NUMERIC, node);
        }
        const operand = operands[0];
        // Propagate the type of the operand if it is a subtype of NUMERIC
        // e.g. if it is INTEGER_LITERAL, keep it
        const returnType = this.checkType(operand, MaqlType.NUMERIC) ? operand.type : MaqlType.NUMERIC;
        return new TypedAstNode(returnType, node);
    }

    private checkBetween(node: OperatorNode, operands: TypedAstNode[]): TypedAstNode {
        if (!this.checkOperandCount(node, operands.length, 3, `Operator ${node.type.toUpperCase()}`)) {
            return new TypedAstNode(MaqlType.BOOLEAN, node);
        }
        const [expr, from, to] = operands;
        this.checkType(expr, ...abstractValueTypes);
        // if we can't determine the type of the expression, don't validate the types of from and to
        if (expr.type !== MaqlType.ALL) {
            this.checkType(from, expr.type);
            this.checkType(to, expr.type);
        }
        return new TypedAstNode(MaqlType.BOOLEAN, node);
    }

    private checkIn(node: OperatorNode, operands: TypedAstNode[]): TypedAstNode {
        if (!this.checkOperandCount(node, operands.length, 2, `Operator ${node.type.toUpperCase()}`)) {
            return new TypedAstNode(MaqlType.BOOLEAN, node);
        }
        const [expr, list] = operands;
        this.checkType(expr, ...abstractValueTypes);
        // if we can't determine the type of the expression, don't validate the type of list
        if (expr.type !== MaqlType.ALL) {
            this.checkType(list, expr.type);
        }
        return new TypedAstNode(MaqlType.BOOLEAN, node);
    }

    override visitListNode(node: ListNode): TypedAstNode {
        if (node.content.length > 0) {
            return this.visitChildren(node);
        }
        return new TypedAstNode(MaqlType.ALL, node);
    }

    override visitFunctionNode(node: FunctionNode): TypedAstNode {
        const defs: MaqlCallDefinition[] = findFunctionDefinitions(node.type, node.name);
        if (defs.length === 0) {
            this.logViolation(`No definition for function '${node.name}'`, node.range);
            return new TypedAstNode(MaqlType.ALL, node);
        }
        const args = node.content.map((arg) => this.visit(arg));
        return this.checkBySignature(node, node.name, args, CallNotation.FUNCTION, defs);
    }

    /**
     * Checks functions and operators that have defined signatures.
     */
    private checkBySignature(
        node: AstNode,
        name: string,
        args: TypedAstNode[],
        notation: CallNotation,
        defs: MaqlCallDefinition[],
    ): TypedAstNode {
        const signature = new MaqlCallSignature(name, args, notation);
        const validDefs = this.findValidDefinitions(signature, defs, node.range);
        if (validDefs.length === 0) {
            // if all available definitions have the same return type we can use it
            const commonReturnType =
                defs.length > 0 && defs.every((def) => def.returns.type === defs[0].returns.type)
                    ? defs[0].returns.type
                    : MaqlType.ALL;
            return new TypedAstNode(commonReturnType, node);
        }
        // If multiple valid definitions remain, use the first one
        const def = validDefs[0];
        return new TypedAstNode(def.returns.type, node);
    }

    private findValidDefinitions(
        signature: MaqlCallSignature,
        defs: MaqlCallDefinition[],
        range?: IRange,
    ): MaqlCallDefinition[] {
        const validDefs = defs
            .filter((def) => {
                return def.parameters.length === signature.parameters.length || def.vararg;
            })
            .filter((def) => {
                const argTypes = signature.parameters.map((arg) => arg.type);
                // get the function signature or if the definition is `vararg` then match the number of arguments
                const paramTypes = def.vararg
                    ? Array<MaqlType>(argTypes.length).fill(def.parameters[0].type)
                    : def.parameters.map((param) => param.type);
                return argTypes.every((argType, idx) => {
                    const paramType = paramTypes[idx];
                    return isSubtype(argType, paramType);
                });
            });
        if (validDefs.length === 0) {
            const receivedSignature = signature.toString();
            const expectedSignatures = defs.map((def) => def.toString());
            this.logViolation(
                `The call expression '${receivedSignature}' has invalid arguments\n` +
                    "Possible definitions:\n" +
                    expectedSignatures.join("\n"),
                range,
            );
        }
        return validDefs;
    }

    override visitRunningFunctionNode(node: RunningFunctionNode): TypedAstNode {
        if (node.within) {
            this.visit(node.within);
        }
        if (node.rollWindow) {
            this.visit(node.rollWindow);
        }
        return this.visit(node.functionNode);
    }

    override visitRankFunctionNode(node: RankFunctionNode): TypedAstNode {
        if (node.within) {
            this.visit(node.within);
        }
        return this.visit(node.functionNode);
    }

    override visitLastFirstValueFunctionNode(node: LastFirstValueFunctionNode): TypedAstNode {
        if (node.orderBy) {
            this.visit(node.orderBy);
        }
        if (node.within) {
            this.visit(node.within);
        }
        return this.visit(node.functionNode);
    }

    override visitOrderByElement(node: OrderByElementNode): TypedAstNode {
        this.checkType(this.visit(node.content[0]), ...abstractValueTypes);
        return new TypedAstNode(MaqlType.UNIT, node);
    }

    override visitRankingFilterNode(node: RankingFilterNode): TypedAstNode {
        this.checkType(this.visit(node.rankSpec), MaqlType.NUMERIC_LITERAL);
        node.operands.forEach((operand) => this.visit(operand));
        if (node.within) {
            this.visit(node.within);
        }
        return new TypedAstNode(MaqlType.BOOLEAN, node);
    }

    override visitCaseNode(node: CaseNode): TypedAstNode {
        const branchTypes = node.content.map((branch) => this.visit(branch).type);
        const exprType = this.findCompatibleSupertype(branchTypes);
        return new TypedAstNode(exprType, node);
    }

    override visitConditionalNode(node: ConditionalNode): TypedAstNode {
        this.checkType(this.visit(node.condition), MaqlType.BOOLEAN);
        const exprType = this.visit(node.expression);
        this.checkType(exprType, ...abstractValueTypes);
        return exprType;
    }

    override visitIdentifierNode(node: IdentifierNode): TypedAstNode {
        // The AST carries the object type as the author spelled it in MAQL, in any casing.
        const objectType = normalizeMaqlObjectType(node.objectType.toLowerCase());
        if (isTigerType(objectType)) {
            return new TypedAstNode(this.model.getType(objectType, node.id), node);
        }
        return new TypedAstNode(MaqlType.ALL, node);
    }

    override visitBooleanLiteralNode(node: BooleanLiteralNode): TypedAstNode {
        return new TypedAstNode(MaqlType.BOOLEAN, node);
    }

    override visitNumberLiteralNode(node: NumberLiteralNode): TypedAstNode {
        const numberType = node.format === "integer" ? MaqlType.INTEGER_LITERAL : MaqlType.NUMERIC_LITERAL;
        return new TypedAstNode(numberType, node);
    }

    override visitStringLiteralNode(node: StringLiteralNode): TypedAstNode {
        return new TypedAstNode(MaqlType.STRING_LITERAL, node);
    }

    override visitNullLiteralNode(node: NullLiteralNode): TypedAstNode {
        return new TypedAstNode(MaqlType.NULL_LITERAL, node);
    }

    override visitGranularityNode(node: GranularityNode): TypedAstNode {
        const granularityType = this.model.granularities.getType(node.value);
        if (granularityType === MaqlType.GRANULARITY) {
            // granularity not recognized - either `DatetimeGranularities` does not contain all granularities
            // or error node is encountered
            this.logViolation(`Unrecognized datetime granularity '${node.value}'`, node.range);
        }
        return new TypedAstNode(granularityType, node);
    }

    override visitFilterNode(node: FilterNode): TypedAstNode {
        this.checkType(this.visit(node.condition), MaqlType.BOOLEAN);
        return new TypedAstNode(MaqlType.UNIT, node);
    }

    private findCompatibleSupertype(types: MaqlType[]): MaqlType {
        return types.reduce((left, right) => lowestCommonAncestor(left, right));
    }

    private checkOperandCount(
        node: AstNode,
        actualCount: number,
        expectedCount: number,
        nodeName: string,
    ): boolean {
        if (actualCount !== expectedCount) {
            this.logUnexpectedOperandCount(
                actualCount,
                node.range,
                `${nodeName} expects ${expectedCount} operands`,
            );
            return false;
        }
        return true;
    }

    private checkType(marker: TypedAstNode, ...expected: MaqlType[]): boolean {
        const isValid = expected.some((expectedType) => isSubtype(marker.type, expectedType));
        if (!isValid) {
            this.logIncompatibleSubtype(expected, marker.type, marker.node?.range);
        }
        return isValid;
    }

    private logIncompatibleSubtype(expected: MaqlType[], received: MaqlType, range: IRange | undefined) {
        const expMessage = expected.map((type) => `'${MaqlType[type]}'`).join(" or ");
        const message = `Type mismatch: Expected ${expMessage}, but got '${MaqlType[received]}'`;
        this.logViolation(message, range);
    }

    private logUnexpectedOperandCount(count: number, range: IRange | undefined, extraInfo: string = "") {
        const message = [`Unexpected count of operands: ${count}`, extraInfo].join(". ");
        this.logViolation(message, range);
    }

    private logViolation(message: string, range: IRange | undefined) {
        this.typeConstraintsViolations.push({ message, range });
    }
}
