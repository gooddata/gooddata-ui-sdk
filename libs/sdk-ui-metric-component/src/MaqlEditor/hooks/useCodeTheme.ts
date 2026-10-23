// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { type IStandaloneThemeData } from "../monaco/MonacoEditor.js";
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
} from "../monaco/MonacoEditor.styles.js";

export function useCodeTheme(): [string, IStandaloneThemeData] {
    return useMemo<[string, IStandaloneThemeData]>(
        () => [
            "gooddata-theme",
            {
                base: "vs",
                inherit: true,
                rules: [
                    //others languages are inherited from vs base theme

                    //maql specific
                    { token: "keyword.maql", foreground: "#7364CF" },
                    { token: "function.maql", foreground: "#7364CF" },
                    { token: "variable.maql", foreground: "#464E56" },
                    { token: "attribute.maql", foreground: "#DB7900" },
                    { token: "label.maql", foreground: "#DB7900" },
                    { token: "fact.maql", foreground: "#00A67D" },
                    { token: "metric.maql", foreground: "#00A67D" },
                    { token: "dataset.maql", foreground: "#952F8E" },
                    { token: "string.maql", foreground: "#D95791" },
                    { token: "number.maql", foreground: "#D95791" },
                    { token: "comment.maql", foreground: "#94A1AD" },
                ],
                colors: {
                    "editor.background": "#FCFCFD",
                    [`editor.variable.${DecoratorFact}.color`]: "rgba(0,166,125,1)",
                    [`editor.variable.${DecoratorFact}.background`]: "rgba(0,166,125,0.07)",
                    [`editor.variable.${DecoratorMetric}.color`]: "rgba(0,166,125,1)",
                    [`editor.variable.${DecoratorMetric}.background`]: "rgba(0,166,125,0.07)",
                    [`editor.variable.${DecoratorDataset}.color`]: "rgba(149,47,142,1)",
                    [`editor.variable.${DecoratorDataset}.background`]: "rgba(149,47,142,0.07)",
                    [`editor.variable.${DecoratorAttribute}.color`]: "rgba(219,121,0,1)",
                    [`editor.variable.${DecoratorAttribute}.background`]: "rgba(219,121,0,0.07)",
                    [`editor.variable.${DecoratorLabel}.color`]: "rgba(219,121,0,1)",
                    [`editor.variable.${DecoratorLabel}.background`]: "rgba(219,121,0,0.07)",
                    [`editor.variable.${DecoratorComputedAttribute}.color`]: "rgba(219,121,0,1)",
                    [`editor.variable.${DecoratorComputedAttribute}.background`]: "rgba(219,121,0,0.07)",
                    [`editor.variable.${DecoratorDateAttribute}.color`]: "rgba(0,155,201,1)",
                    [`editor.variable.${DecoratorDateAttribute}.background`]: "rgba(0,155,201,0.07)",
                    [`editor.variable.${DecoratorDateLabel}.color`]: "rgba(0,155,201,1)",
                    [`editor.variable.${DecoratorDateLabel}.background`]: "rgba(0,155,201,0.07)",
                    [`editor.variable.${DecoratorParameter}.color`]: "rgba(148,161,173,1)",
                    [`editor.variable.${DecoratorParameter}.background`]: "rgba(148,161,173,0.07)",
                },
            },
        ],
        [],
    );
}
