// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import {
    DecoratorAttribute,
    DecoratorComputedAttribute,
    DecoratorDataset,
    DecoratorDateAttribute,
    DecoratorDateLabel,
    DecoratorFact,
    DecoratorLabel,
    DecoratorMetric,
    DecoratorParameter,
} from "../codemirror/CodeEditor.styles.js";

/**
 * Colors of the code itself: the token palette and the reference badges.
 */
export interface IMaqlCodeTheme {
    background: string;
    /**
     * Color per token type, keyed by the type name the tokenizer and the semantic tokens use.
     */
    tokens: Record<string, string>;
    decorators: Record<string, { color: string; background: string }>;
}

function decorator(color: string): { color: string; background: string } {
    return {
        color: `rgba(${color},1)`,
        background: `rgba(${color},0.07)`,
    };
}

export function useCodeTheme(): IMaqlCodeTheme {
    return useMemo<IMaqlCodeTheme>(
        () => ({
            background: "#FCFCFD",
            tokens: {
                keyword: "#7364CF",
                function: "#7364CF",
                type: "#7364CF",
                operator: "#464E56",
                variable: "#464E56",
                attribute: "#DB7900",
                label: "#DB7900",
                fact: "#00A67D",
                metric: "#00A67D",
                dataset: "#952F8E",
                string: "#D95791",
                number: "#D95791",
                comment: "#94A1AD",
                bracket: "#0431FA",
            },
            decorators: {
                [DecoratorFact]: decorator("0,166,125"),
                [DecoratorMetric]: decorator("0,166,125"),
                [DecoratorDataset]: decorator("149,47,142"),
                [DecoratorAttribute]: decorator("219,121,0"),
                [DecoratorLabel]: decorator("219,121,0"),
                [DecoratorComputedAttribute]: decorator("219,121,0"),
                [DecoratorDateAttribute]: decorator("0,155,201"),
                [DecoratorDateLabel]: decorator("0,155,201"),
                [DecoratorParameter]: decorator("148,161,173"),
            },
        }),
        [],
    );
}
