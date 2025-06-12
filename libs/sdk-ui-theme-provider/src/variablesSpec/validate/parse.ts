// (C) 2024 GoodData Corporation
import postcss, { Root } from "postcss";
import valueParser from "postcss-value-parser";
import { errorParsingFile } from "./log.js";
import { CssVariableUsage } from "./types.js";

/**
 * Parse CSS file content into variable usages with their default values.
 * @internal
 */
export function parseCssContentToVariableUsages(filePath: string, fileContent: string): CssVariableUsage[] {
    const ast = parseCssContent(filePath, fileContent);
    const allVariableUsages: CssVariableUsage[] = [];

    ast.walkDecls((declaration) => {
        const declarationVariableUsages = parseCssDeclarationValueToVariableUsages(declaration.value);
        allVariableUsages.push(...declarationVariableUsages);
    });

    return allVariableUsages;
}

/**
 * Parse CSS file content into postcss abstract syntax tree.
 */
function parseCssContent(filePath: string, fileContent: string): Root {
    try {
        return postcss.parse(fileContent);
    } catch (error) {
        errorParsingFile(filePath, error);
        throw error;
    }
}

/**
 * Parse CSS declaration value into variable usages with their default values.
 *
 * Example:
 * var(--gd-palette-complementary-1, var(--gd-palette-complementary-0, #fff))
 * will be represented as
 * [
 *     \{ variableName: "--gd-palette-complementary-1", defaultValue: "var(--gd-palette-complementary-0, #fff)" \},
 *     \{ variableName: "--gd-palette-complementary-0", defaultValue: "#fff" \}
 * ]
 */
function parseCssDeclarationValueToVariableUsages(value: string): CssVariableUsage[] {
    const variables: CssVariableUsage[] = [];
    const parsedValue = valueParser(value);

    parsedValue.walk((node) => {
        if (node.type === "function" && node.value === "var") {
            const [firstNode, _comma, ...rest] = node.nodes;
            if (firstNode && firstNode.type === "word") {
                const variableName = firstNode.value.startsWith("--")
                    ? firstNode.value
                    : `--${firstNode.value}`;

                const defaultValue =
                    rest.length > 0 ? valueParser.stringify(rest).trim().replace(/^,/, "").trim() : null;

                variables.push({
                    variableName,
                    defaultValue,
                });
            }
        }
    });

    return variables;
}
