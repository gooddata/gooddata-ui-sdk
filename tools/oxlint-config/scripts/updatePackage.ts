// (C) 2025-2026 GoodData Corporation

import { readFileSync, writeFileSync } from "fs";

import { common, variants } from "../src/index.js";

const packageJson = JSON.parse(readFileSync("./package.json").toString()) as {
    exports: Record<string, string>;
    devDependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
};

// explicitly grab packages which are required, but not linked to any configurations
const devDeps: Record<string, string> = {
    "@gooddata/lint-config": packageJson.devDependencies["@gooddata/lint-config"],
    oxlint: packageJson.devDependencies["oxlint"],
    oxfmt: packageJson.devDependencies["oxfmt"],
    "@types/node": packageJson.devDependencies["@types/node"],
    jiti: "2.6.1", // Required for ESLint to load TypeScript config files
    typescript: packageJson.devDependencies["typescript"],
    "@typescript/native-preview": "7.0.0-dev.20260202.1",
    "vite-node": packageJson.devDependencies["vite-node"],
    "@gooddata/eslint-config": packageJson.devDependencies["@gooddata/eslint-config"],
    "@eslint/js": packageJson.devDependencies["@eslint/js"],
    "@typescript-eslint/eslint-plugin": packageJson.devDependencies["@typescript-eslint/eslint-plugin"],
    "@typescript-eslint/parser": packageJson.devDependencies["@typescript-eslint/parser"],
    eslint: packageJson.devDependencies["eslint"],
    "eslint-import-resolver-typescript": packageJson.devDependencies["eslint-import-resolver-typescript"],
    "eslint-plugin-headers": packageJson.devDependencies["eslint-plugin-headers"],
    "eslint-plugin-import-x": packageJson.devDependencies["eslint-plugin-import-x"],
    "eslint-plugin-sonarjs": packageJson.devDependencies["eslint-plugin-sonarjs"],
    globals: packageJson.devDependencies["globals"],
};
const peers: Record<string, string> = { oxlint: devDeps.oxlint };

for (const configuration of common) {
    for (const pkg of configuration.packages ?? []) {
        peers[pkg.name] = pkg.version;
        devDeps[pkg.name] = pkg.version;
    }
}

// add variant packages to devDeps
for (const variant of Object.values(variants)) {
    for (const configuration of variant) {
        for (const pkg of configuration.packages ?? []) {
            devDeps[pkg.name] = pkg.version;
        }
    }
}

const peerKeys = Object.keys(peers).sort((a, b) => a.localeCompare(b));
const devDepsKeys = Object.keys(devDeps).sort((a, b) => a.localeCompare(b));

packageJson.peerDependencies = {};
packageJson.devDependencies = {};

for (const key of peerKeys) {
    packageJson.peerDependencies[key] = peers[key];
}
for (const key of devDepsKeys) {
    packageJson.devDependencies[key] = devDeps[key];
}

packageJson.exports = {
    ".": "./dist/base.json",
    ...Object.fromEntries(
        Object.keys(variants).map((variantName) => [`./${variantName}`, `./dist/${variantName}.json`]),
    ),
};

writeFileSync("./package.json", JSON.stringify(packageJson, null, 4));

// Generate PACKAGES.md
function generatePackagesMarkdown(): string {
    // Collect all config names: base + variants
    const configNames = ["base", ...Object.keys(variants).sort()];

    // Collect packages for each config
    const configPackages: Map<string, Map<string, string>> = new Map();

    // Base config packages (common + oxlint peer)
    const basePackages = new Map<string, string>();
    basePackages.set("oxlint", peers.oxlint);
    for (const config of common) {
        for (const pkg of config.packages ?? []) {
            basePackages.set(pkg.name, pkg.version);
        }
    }
    configPackages.set("base", basePackages);

    // Variant config packages (includes base + variant-specific)
    for (const [variantName, variantConfigs] of Object.entries(variants)) {
        const packages = new Map<string, string>();

        // Add base packages
        for (const [name, version] of basePackages) {
            packages.set(name, version);
        }

        // Add variant-specific packages
        for (const config of variantConfigs) {
            for (const pkg of config.packages ?? []) {
                packages.set(pkg.name, pkg.version);
            }
        }

        configPackages.set(variantName, packages);
    }

    // Collect all unique package names across all configs
    const allPackages = new Set<string>();
    for (const packages of configPackages.values()) {
        for (const name of packages.keys()) {
            allPackages.add(name);
        }
    }

    const sortedPackages = [...allPackages].sort();

    // Build table data to calculate column widths
    const headerRow = ["Package", ...configNames];
    const dataRows: string[][] = sortedPackages.map((pkgName) => {
        const cells = configNames.map((configName) => {
            const packages = configPackages.get(configName);
            if (packages?.has(pkgName)) {
                return packages.get(pkgName)!;
            }
            return "";
        });
        return [pkgName, ...cells];
    });

    // Calculate max width for each column
    const columnWidths: number[] = headerRow.map((header, colIndex) => {
        const headerWidth = header.length;
        const maxDataWidth = Math.max(...dataRows.map((row) => row[colIndex].length));
        return Math.max(headerWidth, maxDataWidth);
    });

    // Helper to pad cell content
    const padCell = (content: string, width: number): string => content.padEnd(width);

    // Generate formatted markdown table
    const formattedHeader = headerRow.map((cell, i) => padCell(cell, columnWidths[i])).join(" | ");
    const separatorRow = columnWidths.map((width) => "-".repeat(width)).join(" | ");
    const formattedDataRows = dataRows.map((row) =>
        row.map((cell, i) => padCell(cell, columnWidths[i])).join(" | "),
    );

    const lines: string[] = [
        "# OxLint Config Packages",
        "",
        "This table shows which packages are required for each configuration.",
        "",
        `| ${formattedHeader} |`,
        `| ${separatorRow} |`,
        ...formattedDataRows.map((row) => `| ${row} |`),
        "",
    ];

    return lines.join("\n");
}

writeFileSync("./PACKAGES.md", generatePackagesMarkdown());
