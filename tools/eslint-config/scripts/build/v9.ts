// (C) 2026 GoodData Corporation

import { writeFileSync } from "fs";

import { renderKey, renderValue } from "./renderPlugin.js";
import type {
    GlobalValue,
    GlobalsPreset,
    IConfigurationV9,
    IDualConfiguration,
    IPackage,
} from "../../src/types.js";

// Track imports needed for generated JS
interface IImportInfo {
    varName: string;
    packageName: string;
}

// Collect all unique imports from configurations with indexed variable names
function collectImports(configs: IConfigurationV9[]): Map<string, IImportInfo> {
    const imports = new Map<string, IImportInfo>();
    let index = 1;

    function addImport(packageName: string): void {
        if (!imports.has(packageName)) {
            imports.set(packageName, {
                varName: `plugin${String(index++).padStart(4, "0")}`,
                packageName,
            });
        }
    }

    for (const config of configs) {
        // Collect plugin imports
        if (config.plugins) {
            for (const pkg of Object.values(config.plugins)) {
                addImport(pkg.name);
            }
        }

        // Collect parser imports
        if (config.parser) {
            addImport(config.parser);
        }

        // Check overrides for plugins and parsers too
        if (config.overrides) {
            for (const override of config.overrides) {
                if (override.plugins) {
                    for (const pkg of Object.values(override.plugins)) {
                        addImport(pkg.name);
                    }
                }
                if (override.parser) {
                    addImport(override.parser);
                }
            }
        }
    }

    return imports;
}

// Check if any config uses globalsPresets
function needsGlobalsImport(configs: IConfigurationV9[]): boolean {
    for (const config of configs) {
        if (config.languageOptions?.globalsPresets?.length) {
            return true;
        }
        if (config.overrides) {
            for (const override of config.overrides) {
                if (override.languageOptions?.globalsPresets?.length) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Generate import statements
function generateImports(imports: Map<string, IImportInfo>, needsGlobals: boolean): string {
    const lines: string[] = [];

    if (needsGlobals) {
        lines.push('import globals from "globals";');
    }

    for (const { varName, packageName } of imports.values()) {
        lines.push(`import ${varName} from "${packageName}";`);
    }

    return lines.join("\n");
}

// Generate globals spread from presets
function generateGlobalsSpread(presets: GlobalsPreset[]): string {
    return presets.map((p) => `...globals.${p}`).join(", ");
}

// Generate custom globals object entries
function generateCustomGlobals(globals: Record<string, GlobalValue>): string {
    return Object.entries(globals)
        .map(
            ([key, value]) =>
                `${renderKey(key)}: ${value === "writable" || value === true ? "true" : "false"}`,
        )
        .join(", ");
}

// Generate full globals expression combining presets and custom globals
function generateGlobalsExpression(
    presets: GlobalsPreset[] | undefined,
    customGlobals: Record<string, GlobalValue> | undefined,
): string | null {
    const parts: string[] = [];

    if (presets?.length) {
        parts.push(generateGlobalsSpread(presets));
    }

    if (customGlobals && Object.keys(customGlobals).length > 0) {
        parts.push(generateCustomGlobals(customGlobals));
    }

    if (parts.length === 0) {
        return null;
    }

    return `{ ${parts.join(", ")} }`;
}

// Generate plugins object expression
function generatePluginsExpression(
    plugins: Record<string, IPackage>,
    imports: Map<string, IImportInfo>,
    indent: number,
): string {
    const spaces = "    ".repeat(indent);
    const innerSpaces = "    ".repeat(indent + 1);

    const entries = Object.entries(plugins).map(([key, pkg]) => {
        const importInfo = imports.get(pkg.name);
        if (!importInfo) {
            throw new Error(`Import not found for plugin ${pkg.name}`);
        }
        return `${innerSpaces}${renderKey(key)}: ${importInfo.varName}`;
    });

    return `{\n${entries.join(",\n")},\n${spaces}}`;
}

// Generate a single config object
function generateConfigObject(
    config: IConfigurationV9,
    imports: Map<string, IImportInfo>,
    indent: number,
): string {
    const spaces = "    ".repeat(indent);
    const innerSpaces = "    ".repeat(indent + 1);
    const props: string[] = [];

    // languageOptions (including parser if specified at config level)
    if (config.languageOptions || config.parser) {
        const langProps: string[] = [];
        const langInner = "    ".repeat(indent + 2);

        // Parser goes into languageOptions in flat config
        if (config.parser) {
            const parserImport = imports.get(config.parser);
            if (parserImport) {
                langProps.push(`${langInner}parser: ${parserImport.varName}`);
            }
        }

        if (config.languageOptions) {
            const globalsExpr = generateGlobalsExpression(
                config.languageOptions.globalsPresets,
                config.languageOptions.globals,
            );
            if (globalsExpr) {
                langProps.push(`${langInner}globals: ${globalsExpr}`);
            }
            if (config.languageOptions.ecmaVersion) {
                langProps.push(`${langInner}ecmaVersion: ${config.languageOptions.ecmaVersion}`);
            }
            if (config.languageOptions.sourceType) {
                langProps.push(`${langInner}sourceType: "${config.languageOptions.sourceType}"`);
            }
        }

        if (langProps.length > 0) {
            props.push(`${innerSpaces}languageOptions: {\n${langProps.join(",\n")},\n${innerSpaces}}`);
        }
    }

    // plugins
    if (config.plugins && Object.keys(config.plugins).length > 0) {
        props.push(
            `${innerSpaces}plugins: ${generatePluginsExpression(config.plugins, imports, indent + 1)}`,
        );
    }

    // settings
    if (config.settings && Object.keys(config.settings).length > 0) {
        props.push(`${innerSpaces}settings: ${renderValue(config.settings, indent + 1)}`);
    }

    // rules
    if (config.rules && Object.keys(config.rules).length > 0) {
        props.push(`${innerSpaces}rules: ${renderValue(config.rules, indent + 1)}`);
    }

    // ignorePatterns -> ignores in flat config
    if (config.ignorePatterns?.length) {
        props.push(`${innerSpaces}ignores: ${renderValue(config.ignorePatterns, indent + 1)}`);
    }

    if (props.length === 0) {
        return "";
    }

    return `{\n${props.join(",\n")},\n${spaces}}`;
}

// Generate override config objects (flat config uses files property on separate objects)
function generateOverrideObjects(
    config: IConfigurationV9,
    imports: Map<string, IImportInfo>,
    indent: number,
): string[] {
    const results: string[] = [];

    if (!config.overrides) {
        return results;
    }

    for (const override of config.overrides) {
        const spaces = "    ".repeat(indent);
        const innerSpaces = "    ".repeat(indent + 1);
        const props: string[] = [];

        // files (required for overrides)
        props.push(`${innerSpaces}files: ${renderValue(override.files, indent + 1)}`);

        // excludedFiles -> ignores
        if (override.excludedFiles?.length) {
            props.push(`${innerSpaces}ignores: ${renderValue(override.excludedFiles, indent + 1)}`);
        }

        // languageOptions (including parser if specified)
        if (override.languageOptions || override.parser) {
            const langProps: string[] = [];
            const langInner = "    ".repeat(indent + 2);

            // Parser goes into languageOptions in flat config
            if (override.parser) {
                const parserImport = imports.get(override.parser);
                if (parserImport) {
                    langProps.push(`${langInner}parser: ${parserImport.varName}`);
                }
            }

            if (override.languageOptions) {
                const globalsExpr = generateGlobalsExpression(
                    override.languageOptions.globalsPresets,
                    override.languageOptions.globals,
                );
                if (globalsExpr) {
                    langProps.push(`${langInner}globals: ${globalsExpr}`);
                }
                if (override.languageOptions.ecmaVersion) {
                    langProps.push(`${langInner}ecmaVersion: ${override.languageOptions.ecmaVersion}`);
                }
                if (override.languageOptions.sourceType) {
                    langProps.push(`${langInner}sourceType: "${override.languageOptions.sourceType}"`);
                }
            }

            if (langProps.length > 0) {
                props.push(`${innerSpaces}languageOptions: {\n${langProps.join(",\n")},\n${innerSpaces}}`);
            }
        }

        // plugins
        if (override.plugins && Object.keys(override.plugins).length > 0) {
            props.push(
                `${innerSpaces}plugins: ${generatePluginsExpression(override.plugins, imports, indent + 1)}`,
            );
        }

        // settings
        if (override.settings && Object.keys(override.settings).length > 0) {
            props.push(`${innerSpaces}settings: ${renderValue(override.settings, indent + 1)}`);
        }

        // rules
        if (override.rules && Object.keys(override.rules).length > 0) {
            props.push(`${innerSpaces}rules: ${renderValue(override.rules, indent + 1)}`);
        }

        results.push(`{\n${props.join(",\n")},\n${spaces}}`);
    }

    return results;
}

// Generate full config array from multiple configurations
function generateConfigArray(configs: IConfigurationV9[], imports: Map<string, IImportInfo>): string {
    const items: string[] = [];

    for (const config of configs) {
        // No extends to merge, just add our config object
        const mainConfig = generateConfigObject(config, imports, 1);
        if (mainConfig) {
            items.push(`    ${mainConfig}`);
        }

        // Add override objects
        const overrideObjects = generateOverrideObjects(config, imports, 1);
        for (const obj of overrideObjects) {
            items.push(`    ${obj}`);
        }
    }

    return `[\n${items.join(",\n")},\n]`;
}

// Generate complete JS file content
function generateJsFile(configs: IConfigurationV9[]): string {
    const imports = collectImports(configs);
    const needsGlobals = needsGlobalsImport(configs);

    const lines: string[] = [
        "// This file is auto-generated. Do not edit manually.",
        "",
        generateImports(imports, needsGlobals),
        "",
        `export default ${generateConfigArray(configs, imports)};`,
        "",
    ];

    return lines.join("\n");
}

// TypeScript declaration file content (same for all configs)
// Using a simplified type to avoid deep dependencies on @eslint/core internals
const dtsContent = `export interface FlatConfig {
    files?: string[];
    ignores?: string[];
    languageOptions?: Record<string, unknown>;
    linterOptions?: Record<string, unknown>;
    processor?: unknown;
    plugins?: Record<string, unknown>;
    rules?: Record<string, unknown>;
    settings?: Record<string, unknown>;
}
declare const config: FlatConfig[];
export default config;
`;

export function buildV9(
    commonConfigurations: IDualConfiguration[],
    variants: Record<string, IDualConfiguration[]>,
): void {
    // Extract v9 configs from commonConfigurations
    const commonV9Configs = commonConfigurations.map((dc) => dc.v9);

    // Build base config
    const baseJs = generateJsFile(commonV9Configs);
    writeFileSync("dist/base.js", baseJs);
    writeFileSync("dist/base.d.ts", dtsContent);

    // Build variant configs
    for (const [variantName, variantConfigs] of Object.entries(variants)) {
        const variantV9Configs = [...commonV9Configs, ...variantConfigs.map((dc) => dc.v9)];

        const variantJs = generateJsFile(variantV9Configs);
        writeFileSync(`dist/${variantName}.js`, variantJs);
        writeFileSync(`dist/${variantName}.d.ts`, dtsContent);
    }
}
