// (C) 2025 GoodData Corporation
/* eslint-disable no-console */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FORBIDDEN_PROP_NAMES = [
    "class",
    "classname",
    "className",
    "classNames",
    "cssClass",
    "cssClassName",
    "cssClasses",
    "itemClass",
    "itemClassName",
    "childClass",
    "childClassName",
    "childClasses",
    "childrenClass",
    "childrenClassName",
    "childrenClasses",
    "parentClass",
    "parentClassName",
    "parentClasses",
    "containerClass",
    "containerClassName",
    "wrapperClass",
    "wrapperClassName",
    "customClass",
    "customClassName",
    "componentClass",
    "componentClassName",
    "elementClass",
    "elementClassName",
    "style",
    "styles",
    "styling",
    "styleName",
    "styleNames",
];

const FORBIDDEN_PROP_PATTERNS = [/^.*[Cc]lass[Nn]ame.*$/, /^.*[Cc]lass$/];

// Path to @ui directory
const UI_DIR = path.resolve(__dirname, "../src/@ui");

function checkPropertyName(propName) {
    // Check exact matches
    if (FORBIDDEN_PROP_NAMES.includes(propName)) {
        return true;
    }

    // Check pattern matches
    return FORBIDDEN_PROP_PATTERNS.some((pattern) => pattern.test(propName));
}

function getExpectedInterfaceName(filename) {
    // Extract component name from file path
    // e.g., "UiButton/UiButton.tsx" -> "UiButton"
    // e.g., "UiMenu/types.ts" -> "UiMenu"
    const parts = filename.split("/");
    const componentDir = parts.find((part) => part.startsWith("Ui"));

    if (componentDir) {
        return `${componentDir}Props`;
    }

    return null;
}

function findPropsInterfaces(fileContent, filename) {
    const violations = [];
    const expectedInterfaceName = getExpectedInterfaceName(filename);

    if (!expectedInterfaceName) {
        return violations; // Skip files that don't match component pattern
    }

    // Simple regex to find the specific interface we're looking for
    const interfacePattern = new RegExp(
        `interface\\s+${expectedInterfaceName}\\b[^{]*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`,
        "gs",
    );

    const typePattern = new RegExp(
        `type\\s+${expectedInterfaceName}\\b[^=]*=\\s*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`,
        "gs",
    );

    // Check for the specific interface
    let match = interfacePattern.exec(fileContent);
    if (match) {
        const [, interfaceBody] = match;
        const props = extractProps(interfaceBody);

        for (const propName of props) {
            if (checkPropertyName(propName)) {
                violations.push({
                    filename,
                    interfaceName: expectedInterfaceName,
                    propName,
                    type: "interface",
                });
            }
        }
    }

    // Check for the specific type alias
    match = typePattern.exec(fileContent);
    if (match) {
        const [, typeBody] = match;
        const props = extractProps(typeBody);

        for (const propName of props) {
            if (checkPropertyName(propName)) {
                violations.push({
                    filename,
                    interfaceName: expectedInterfaceName,
                    propName,
                    type: "type",
                });
            }
        }
    }

    return violations;
}

function extractProps(interfaceBody) {
    const props = [];
    // Simple regex to find property names - avoid overlapping quantifiers
    const propPattern = /^\s*(\w+)\s*[?:]:/gm;
    let propMatch;

    while ((propMatch = propPattern.exec(interfaceBody)) !== null) {
        const [, propName] = propMatch;
        props.push(propName);
    }

    return props;
}

function getAllTsxFiles(dir) {
    const files = [];

    function traverse(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                traverse(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
                files.push(fullPath);
            }
        }
    }

    traverse(dir);
    return files;
}

function validateUiComponents() {
    console.log("🔍 Validating @ui components for forbidden className props...");

    if (!fs.existsSync(UI_DIR)) {
        console.error(`❌ @ui directory not found: ${UI_DIR}`);
        process.exit(1);
    }

    const tsxFiles = getAllTsxFiles(UI_DIR);
    let totalViolations = [];

    for (const file of tsxFiles) {
        try {
            const content = fs.readFileSync(file, "utf8");
            const relativeFile = path.relative(path.resolve(__dirname, ".."), file);
            const violations = findPropsInterfaces(content, relativeFile);
            totalViolations = totalViolations.concat(violations);
        } catch (error) {
            console.error(`❌ Error reading file ${file}:`, error.message);
        }
    }

    if (totalViolations.length > 0) {
        console.log(`\n❌ Found ${totalViolations.length} violation(s):\n`);

        for (const violation of totalViolations) {
            console.log(`  • ${violation.filename}`);
            console.log(
                `    ${violation.type} ${violation.interfaceName} has forbidden prop: '${violation.propName}'`,
            );
        }

        console.log(
            "\n⚠️ Props related to className/styling are not allowed in @ui components. @ui components should manage their own styling internally.",
        );
        console.log(
            "\n💡 Tip: Use internal styling with BEM methodology instead of exposing className props.",
        );
        console.error("\n❌ VALIDATION FAILED: @ui components contain forbidden className props.");
        process.exit(1);
    } else {
        console.log("✅ All @ui components are valid - no forbidden className props found!");
    }
}

// Run the validation
validateUiComponents();
