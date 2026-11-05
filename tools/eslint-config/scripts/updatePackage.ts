// (C) 2025-2026 GoodData Corporation

import { readFileSync, writeFileSync } from "fs";

import { type IPackage } from "@gooddata/lint-config";

import { commonConfigurations, flatVariants, legacyVariants } from "../src/index.js";
import type { IConfiguration, IConfigurationFlatVariants } from "../src/types.js";

import { type EslintMajor, eslintMajors, oxlintDir } from "./build/flat.js";
import { legacyMajor } from "./build/legacy.js";

type ExportValue = string | { import?: string; require?: string };

// Where a configuration keeps the packages for one build target
type ConfigurationTarget = "legacy" | keyof IConfigurationFlatVariants;

const configurationTargets: ConfigurationTarget[] = ["legacy", "v9", "v9ox", "v10", "v10ox"];

function targetPackages(configuration: IConfiguration, target: ConfigurationTarget): IPackage[] {
    const packages =
        target === "legacy" ? configuration.legacy.packages : configuration.flat[target].packages;

    return packages ?? [];
}

const packageJson = JSON.parse(readFileSync("./package.json").toString()) as {
    exports: Record<string, ExportValue>;
    devDependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
};

// ESLint major this repository lints with; decides which versions land in devDependencies
const devEslintMajor: EslintMajor = "v10";

// Track package version for each build target
const packageVersions: Record<string, Partial<Record<ConfigurationTarget, string>>> = {};

// Collect packages from commonConfigurations (these become peerDependencies)
for (const configuration of commonConfigurations) {
    for (const target of configurationTargets) {
        for (const pkg of targetPackages(configuration, target)) {
            packageVersions[pkg.name] = { ...packageVersions[pkg.name], [target]: pkg.version };
        }
    }
}

// Collect packages from flat variants on devEslintMajor only (these are added to devDependencies only)
const variantPackagesDev: Record<string, string> = {};

for (const variant of Object.values(flatVariants)) {
    for (const configuration of variant) {
        for (const pkg of targetPackages(configuration, devEslintMajor)) {
            variantPackagesDev[pkg.name] = pkg.version;
        }
    }
}

// Build peerDependencies with || for differing versions
const peers: Record<string, string> = {
    eslint: packageJson.peerDependencies["eslint"],
};

for (const [name, versions] of Object.entries(packageVersions)) {
    const targetVersions = configurationTargets.map((target) => versions[target]);

    // Only add to peerDependencies if package appears in every build target
    if (targetVersions.every((version) => version !== undefined)) {
        peers[name] = [...new Set(targetVersions)].join(" || ");
    }
    // Packages missing from any build target are NOT added to peerDependencies
}

// Build devDependencies (flat packages on devEslintMajor only, to avoid conflicts)
const devDeps: Record<string, string> = {
    "@gooddata/lint-config": packageJson.devDependencies["@gooddata/lint-config"],
    eslint: packageJson.devDependencies["eslint"],
    oxfmt: packageJson.devDependencies["oxfmt"],
    "@types/node": packageJson.devDependencies["@types/node"],
    jiti: "2.6.1", // Required for ESLint to load TypeScript config files
    typescript: packageJson.devDependencies["typescript"],
    "vite-node": packageJson.devDependencies["vite-node"],
};

// Add flat common packages on devEslintMajor to devDeps only
for (const [name, versions] of Object.entries(packageVersions)) {
    const devVersion = versions[devEslintMajor];

    if (devVersion) {
        devDeps[name] = devVersion;
    }
}

// Add flat variant packages on devEslintMajor to devDeps
for (const [name, version] of Object.entries(variantPackagesDev)) {
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

// Build exports, all prefixed by ESLint major: legacy (JSON) under "require", flat (JS) under "import"
const exports: Record<string, ExportValue> = {};

for (const variantName of ["base", ...Object.keys(legacyVariants)]) {
    exports[`./${legacyMajor}/${variantName}`] = { require: `./dist/${legacyMajor}/${variantName}.json` };
}

for (const major of eslintMajors) {
    for (const variantName of ["base", ...Object.keys(flatVariants)]) {
        exports[`./${major}/${variantName}`] = { import: `./dist/${major}/${variantName}.js` };
        exports[`./${major}/${oxlintDir}/${variantName}`] = {
            import: `./dist/${major}/${oxlintDir}/${variantName}.js`,
        };
    }
}

packageJson.exports = exports;

writeFileSync("./package.json", `${JSON.stringify(packageJson, null, 4)}\n`);

// Generate PACKAGES_*.md, one table per build target
interface IPackagesMarkdown {
    file: string;
    title: string;
    target: ConfigurationTarget;
    variants: Record<string, IConfiguration[]>;
}

const packagesMarkdowns: IPackagesMarkdown[] = [
    { file: "PACKAGES_V8.md", title: "V8", target: "legacy", variants: legacyVariants },
    { file: "PACKAGES_V9.md", title: "V9", target: "v9", variants: flatVariants },
    { file: "PACKAGES_V9_OXLINT.md", title: "V9 OxLint", target: "v9ox", variants: flatVariants },
    { file: "PACKAGES_V10.md", title: "V10", target: "v10", variants: flatVariants },
    { file: "PACKAGES_V10_OXLINT.md", title: "V10 OxLint", target: "v10ox", variants: flatVariants },
];

function collectConfigPackages(configs: IConfiguration[], target: ConfigurationTarget): Map<string, string> {
    const packages = new Map<string, string>();
    for (const config of configs) {
        for (const pkg of targetPackages(config, target)) {
            packages.set(pkg.name, pkg.version);
        }
    }
    return packages;
}

function generatePackagesMarkdown({ title, target, variants }: IPackagesMarkdown): string {
    const prefix = target.endsWith("ox") ? `${oxlintDir}/` : "";

    // Collect all config names: base + variants
    const configNames = ["base", ...Object.keys(variants).sort()];

    // Collect packages for each config
    const configPackages: Map<string, Map<string, string>> = new Map();

    // Base config packages
    configPackages.set("base", collectConfigPackages(commonConfigurations, target));

    // Variant config packages (includes common + variant-specific)
    for (const [variantName, variantConfigs] of Object.entries(variants)) {
        configPackages.set(
            variantName,
            collectConfigPackages([...commonConfigurations, ...variantConfigs], target),
        );
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
    const headerRow = ["Package", ...configNames.map((name) => `${prefix}${name}`)];
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
        `# ESLint ${title} Packages`,
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

for (const packagesMarkdown of packagesMarkdowns) {
    writeFileSync(`./${packagesMarkdown.file}`, generatePackagesMarkdown(packagesMarkdown));
}
