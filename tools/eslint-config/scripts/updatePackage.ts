// (C) 2025-2026 GoodData Corporation

import { readFileSync, writeFileSync } from "fs";

import { commonConfigurations, v8Variants, v9Variants } from "../src/index.js";
import type { IDualConfiguration, IPackage } from "../src/types.js";

type ExportValue = string | { import?: string; require?: string };

const packageJson = JSON.parse(readFileSync("./package.json").toString()) as {
    exports: Record<string, ExportValue>;
    devDependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
};

// Track packages by version for each ESLint version
interface IPackageVersions {
    v8?: string;
    v9?: string;
}

const packageVersions: Record<string, IPackageVersions> = {};

function collectPackages(packages: IPackage[] | undefined, eslintVersion: "v8" | "v9") {
    for (const pkg of packages ?? []) {
        if (!packageVersions[pkg.name]) {
            packageVersions[pkg.name] = {};
        }
        packageVersions[pkg.name][eslintVersion] = pkg.version;
    }
}

// Collect packages from commonConfigurations (these become peerDependencies)
for (const configuration of commonConfigurations) {
    collectPackages(configuration.v8.packages, "v8");
    collectPackages(configuration.v9.packages, "v9");
}

// Collect packages from v9 variants only (these are added to devDependencies only)
const variantPackagesV9: Record<string, string> = {};

for (const variant of Object.values(v9Variants)) {
    for (const configuration of variant) {
        for (const pkg of configuration.v9.packages ?? []) {
            variantPackagesV9[pkg.name] = pkg.version;
        }
    }
}

// Build peerDependencies with || for differing versions
const peers: Record<string, string> = {
    eslint: packageJson.peerDependencies["eslint"],
};

for (const [name, versions] of Object.entries(packageVersions)) {
    const { v8, v9 } = versions;

    // Only add to peerDependencies if package appears in BOTH v8 and v9
    if (v8 && v9) {
        if (v8 === v9) {
            peers[name] = v8;
        } else {
            // Different versions - use || syntax
            peers[name] = `${v8} || ${v9}`;
        }
    }
    // Packages only in v8 or only in v9 are NOT added to peerDependencies
}

// Build devDependencies (v9 packages only to avoid conflicts)
const devDeps: Record<string, string> = {
    eslint: packageJson.devDependencies["eslint"],
    oxfmt: packageJson.devDependencies["oxfmt"],
    "@types/node": packageJson.devDependencies["@types/node"],
    jiti: "2.6.1", // Required for ESLint to load TypeScript config files
    typescript: packageJson.devDependencies["typescript"],
    "vite-node": packageJson.devDependencies["vite-node"],
};

// Add v9 common packages to devDeps only
for (const [name, versions] of Object.entries(packageVersions)) {
    if (versions.v9) {
        devDeps[name] = versions.v9;
    }
}

// Add v9 variant packages to devDeps
for (const [name, version] of Object.entries(variantPackagesV9)) {
    if (!devDeps[name]) {
        devDeps[name] = version;
    }
}

// Sort and write
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

// Build exports with conditional exports for v8 (JSON) and v9 (JS)
const v8VariantNames = new Set(Object.keys(v8Variants));
const v9VariantNames = new Set(Object.keys(v9Variants));
const allVariantNames = new Set([...v8VariantNames, ...v9VariantNames]);

function buildExport(name: string, hasV8: boolean, hasV9: boolean): { import?: string; require?: string } {
    const jsPath = `./dist/${name}.js`;
    const jsonPath = `./dist/${name}.json`;

    if (hasV8 && hasV9) {
        return { import: jsPath, require: jsonPath };
    } else if (hasV9) {
        return { import: jsPath };
    } else {
        return { require: jsonPath };
    }
}

const exports: Record<string, ExportValue> = {
    // Base config (always has both v8 and v9)
    ".": { import: "./dist/base.js", require: "./dist/base.json" },
};

// Add variant exports
for (const variantName of allVariantNames) {
    const hasV8 = v8VariantNames.has(variantName);
    const hasV9 = v9VariantNames.has(variantName);
    exports[`./${variantName}`] = buildExport(variantName, hasV8, hasV9);
}

packageJson.exports = exports;

writeFileSync("./package.json", JSON.stringify(packageJson, null, 4));

// Generate PACKAGES_V8.md and PACKAGES_V9.md
function collectConfigPackages(configs: IDualConfiguration[], version: "v8" | "v9"): Map<string, string> {
    const packages = new Map<string, string>();
    for (const config of configs) {
        const pkgs = config[version].packages ?? [];
        for (const pkg of pkgs) {
            packages.set(pkg.name, pkg.version);
        }
    }
    return packages;
}

function generatePackagesMarkdown(
    version: "v8" | "v9",
    variants: Record<string, IDualConfiguration[]>,
): string {
    // Collect all config names: base + variants
    const configNames = ["base", ...Object.keys(variants).sort()];

    // Collect packages for each config
    const configPackages: Map<string, Map<string, string>> = new Map();

    // Base config packages
    configPackages.set("base", collectConfigPackages(commonConfigurations, version));

    // Variant config packages (includes common + variant-specific)
    for (const [variantName, variantConfigs] of Object.entries(variants)) {
        const packages = new Map<string, string>();

        // Add common packages
        for (const config of commonConfigurations) {
            const pkgs = config[version].packages ?? [];
            for (const pkg of pkgs) {
                packages.set(pkg.name, pkg.version);
            }
        }

        // Add variant-specific packages
        for (const config of variantConfigs) {
            const pkgs = config[version].packages ?? [];
            for (const pkg of pkgs) {
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
    // Separator dashes need +2 for the leading/trailing spaces in header cells
    const separatorRow = columnWidths.map((width) => "-".repeat(width)).join(" | ");
    const formattedDataRows = dataRows.map((row) =>
        row.map((cell, i) => padCell(cell, columnWidths[i])).join(" | "),
    );

    const lines: string[] = [
        `# ESLint ${version.toUpperCase()} Packages`,
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

// Generate v8 and v9 markdown files
const v8Markdown = generatePackagesMarkdown("v8", v8Variants);
const v9Markdown = generatePackagesMarkdown("v9", v9Variants);

writeFileSync("./PACKAGES_V8.md", v8Markdown);
writeFileSync("./PACKAGES_V9.md", v9Markdown);
