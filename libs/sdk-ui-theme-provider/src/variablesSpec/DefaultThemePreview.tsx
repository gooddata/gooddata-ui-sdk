// (C) 2024-2025 GoodData Corporation
import React from "react";

import { allThemeCssVariables } from "./allThemeCssVariables.js";
import { ThemeCssVariable } from "./types.js";

/**
 *
 * @internal
 */
export const DefaultThemePreview = () => {
    return <ThemeVariablesList />;
};

const listStyle: React.CSSProperties = {
    fontFamily: "Avenir",
    fontSize: 14,
};

function ThemeVariablesList() {
    return (
        <div style={listStyle}>
            {allThemeCssVariables.map((themeVariable) => {
                return <ThemeVariablePreview key={themeVariable.variableName} variable={themeVariable} />;
            })}
        </div>
    );
}

const colorPreviewStyle: React.CSSProperties = {
    width: 80,
    height: 80,
};

function ColorPreview({ color }: { color?: string }) {
    return <div style={{ ...colorPreviewStyle, backgroundColor: color }} title={color} />;
}

const variablePreviewStyle: React.CSSProperties = {
    padding: 20,
    display: "flex",
    alignItems: "center",
    gap: 20,
    borderBottom: "1px solid #ddd",
};

const inconsistentVariablePreviewStyle: React.CSSProperties = {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    borderBottom: "1px solid #ddd",
};

const inconsistentVariablePreviewColorsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
};
const inconsistentVariablePreviewValuesStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 10,
};

const codeStyle: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: 12,
    border: "1px solid #ddd",
    backgroundColor: "#fefefe",
    padding: "2px 4px",
    borderRadius: 4,
};

const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "flex-start",
};

function ThemeVariablePreview({ variable }: { variable: ThemeCssVariable }) {
    switch (variable.type) {
        case "theme":
            return (
                <div style={variablePreviewStyle}>
                    <ColorPreview color={variable.defaultValue} />
                    <div style={contentStyle}>
                        <div>
                            <strong>
                                {variable.variableName} ({variable.type})
                            </strong>
                        </div>
                        <div>{variable.defaultValue ?? "No default value"}</div>
                        <div style={codeStyle}>theme.{variable.themePath.join(".")}</div>
                    </div>
                </div>
            );
        case "derived":
        case "internal":
            return (
                <div style={variablePreviewStyle}>
                    <ColorPreview color={variable.defaultValue} />
                    <div style={contentStyle}>
                        <div>
                            <strong>
                                {variable.variableName} ({variable.type})
                            </strong>
                        </div>
                        <div>{variable.defaultValue ?? "No default value"}</div>
                    </div>
                </div>
            );
        case "inconsistent":
            return (
                <div style={inconsistentVariablePreviewStyle}>
                    <div style={contentStyle}>
                        <div>
                            <strong>
                                {variable.variableName} ({variable.type})
                            </strong>
                        </div>
                        <div>Unique inconsistent usage colors:</div>
                        <div style={inconsistentVariablePreviewColorsStyle}>
                            {variable.inconsistentDefaults.map((d) => (
                                <ColorPreview color={d} key={d} />
                            ))}
                        </div>
                        <div style={inconsistentVariablePreviewValuesStyle}>
                            {variable.inconsistentDefaults.map((d) => (
                                <div style={codeStyle} key={d}>
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case "deprecated":
            return null;
        default:
            assertNever(variable);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}
