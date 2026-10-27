// (C) 2021-2026 GoodData Corporation

import {
    type AstType,
    type FunctionAstType,
    type FunctionDefinition,
    type FunctionParameter,
    type ParameterType,
    functionDefinitions,
    isMaqlFunctionName,
} from "@gooddata/maql-antlr4ts";

import { MaqlType } from "./hierarchy.js";

export interface IMaqlCallParameter {
    type: MaqlType;
}

export enum CallNotation {
    FUNCTION,
    PREFIX,
    INFIX,
    POSTFIX,
}

/**
 * All necessary information to infer which function or operator should be used
 */
export class MaqlCallSignature {
    readonly name: string;

    constructor(
        name: string,
        readonly parameters: IMaqlCallParameter[],
        readonly notation: CallNotation,
    ) {
        this.name = name.toUpperCase();
    }

    toString(): string {
        const paramTypes = this.parameters.map((param) => MaqlType[param.type]);
        switch (this.notation) {
            case CallNotation.FUNCTION:
                return `${this.name}(${paramTypes.join(", ")})`;
            case CallNotation.PREFIX:
                return `${this.name} ${paramTypes.join(" ")}`;
            case CallNotation.INFIX:
                return paramTypes.length > 1
                    ? paramTypes.join(` ${this.name} `)
                    : `${this.name} ${paramTypes[0]}`;
            case CallNotation.POSTFIX:
                return `${paramTypes.join(" ")} ${this.name}`;
        }
    }
}

/**
 * Function or operator call definition, including its return parameter
 */
export class MaqlCallDefinition extends MaqlCallSignature {
    constructor(
        name: string,
        parameters: IMaqlCallParameter[],
        readonly returns: IMaqlCallParameter,
        notation: CallNotation,
        readonly vararg: boolean,
    ) {
        super(name, parameters, notation);
    }

    static create(
        name: string,
        returnType: MaqlType,
        parameterTypes: MaqlType[],
        notation = CallNotation.FUNCTION,
        vararg = false,
    ): MaqlCallDefinition {
        return new MaqlCallDefinition(
            name,
            parameterTypes.map((type) => ({ type })),
            { type: returnType },
            notation,
            vararg,
        );
    }

    override toString(): string {
        const returnType = MaqlType[this.returns.type];
        const signature = super.toString();
        return `${signature} -> ${returnType}`;
    }
}

/**
 * Returns MAQL function definitions of the given `astType` with `name` or empty array if none exist.
 * @param astType -
 * @param name -
 */
export function findFunctionDefinitions(astType: FunctionAstType, name: string): MaqlCallDefinition[] {
    const funcName = name.toUpperCase();
    if (!isMaqlFunctionName(funcName, astType)) {
        return [];
    }
    const astDefs = functionDefinitions[astType];
    const funcDefs: FunctionDefinition[] =
        (astDefs as unknown as Record<string, FunctionDefinition[]>)[funcName] ?? [];
    return funcDefs.map((def) => transformFunctionDefinition(def, funcName));
}

export function transformFunctionDefinition(
    definition: FunctionDefinition,
    name: string,
): MaqlCallDefinition {
    return new MaqlCallDefinition(
        name,
        definition.operands.map((param) => transformParameter(param)),
        transformParameter(definition.returns),
        CallNotation.FUNCTION,
        definition.vararg ?? false,
    );
}

export function getCustomDefinitions(astType: AstType): MaqlCallDefinition[] {
    switch (astType) {
        case "+":
        case "-":
        case "*":
        case "/":
            return [
                MaqlCallDefinition.create(
                    astType,
                    MaqlType.NUMERIC,
                    [MaqlType.NUMERIC, MaqlType.NUMERIC],
                    CallNotation.INFIX,
                ),
            ];
        case "not":
            return [
                MaqlCallDefinition.create(astType, MaqlType.BOOLEAN, [MaqlType.BOOLEAN], CallNotation.PREFIX),
            ];
        case "and":
        case "or":
            return [
                MaqlCallDefinition.create(
                    astType,
                    MaqlType.BOOLEAN,
                    [MaqlType.BOOLEAN, MaqlType.BOOLEAN],
                    CallNotation.INFIX,
                ),
            ];
        case "=":
        case "<>":
        case ">=":
        case "<=":
        case "<":
        case ">":
            return [
                MaqlCallDefinition.create(
                    astType,
                    MaqlType.BOOLEAN,
                    [MaqlType.NUMERIC, MaqlType.NUMERIC],
                    CallNotation.INFIX,
                ),
                MaqlCallDefinition.create(
                    astType,
                    MaqlType.BOOLEAN,
                    [MaqlType.STRING, MaqlType.STRING],
                    CallNotation.INFIX,
                ),
                MaqlCallDefinition.create(
                    astType,
                    MaqlType.BOOLEAN,
                    [MaqlType.DATE, MaqlType.DATE],
                    CallNotation.INFIX,
                ),
            ];
        case "like":
        case "ilike":
        case "not like":
        case "not ilike":
            return [
                MaqlCallDefinition.create(
                    astType,
                    MaqlType.BOOLEAN,
                    [MaqlType.STRING, MaqlType.STRING_LITERAL],
                    CallNotation.INFIX,
                ),
                MaqlCallDefinition.create(
                    astType,
                    MaqlType.BOOLEAN,
                    [MaqlType.DATE, MaqlType.STRING_LITERAL],
                    CallNotation.INFIX,
                ),
            ];
        default:
            return [];
    }
}

function transformParameter(parameter: FunctionParameter): IMaqlCallParameter {
    return {
        type: toMaqlType(parameter.type),
    };
}

function toMaqlType(type: ParameterType): MaqlType {
    switch (type) {
        case "NUMERIC":
            return MaqlType.NUMERIC;
        case "STRING":
            return MaqlType.STRING;
        case "DATE":
            return MaqlType.DATE;
        case "DATASET":
            return MaqlType.DATASET;
        case "GRANULARITY_LITERAL":
            return MaqlType.GRANULARITY;
        case "CHRONOLOGICAL_GRANULARITY_LITERAL":
            return MaqlType.CHRONOLOGICAL_GRANULARITY;
        case "NUMERIC_LITERAL":
            return MaqlType.NUMERIC_LITERAL;
        case "INTEGER_LITERAL":
            return MaqlType.INTEGER_LITERAL;
    }
}
