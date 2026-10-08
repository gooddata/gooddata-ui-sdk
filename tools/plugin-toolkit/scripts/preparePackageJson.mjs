// (C) 2021-2026 GoodData Corporation

// oxlint-disable eslint-js/no-console

import fs from "fs";
import * as path from "path";
import * as process from "process";

import fse from "fs-extra";

export function readJsonSync(file) {
    return JSON.parse(fse.readFileSync(file, { encoding: "utf-8" }));
}

/*
 * This script is used during build to clean up the contents of package.json that will be shipped with
 * the template project bootstrapped by the plugin development toolkit.
 *
 * The rationale here is, that the original package.json included in the `dashboard-plugin-template` contains
 * scripts and dependencies specific of the UI.SDK monorepo. They should not be included in the bootstrapped
 * plugin project.
 *
 * There are two ways to go.. one is to have additional package.json.template files with only the content
 * that is vital to have in the bootstrapped plugin. The problem with that approach the dependencies and
 * devDependencies. Within SDK monorepo, we rely on rush to manage consistent versions and to bump intra-SDK
 * dependency versions. The template content would be out of this loop and we will still require some extra
 * processing to transfer & cleanup the dependencies from the main package.json.
 *
 * Alternative to the templates (and possibly some funky `jq` processing to handle the dependencies) is
 * this script to clean things up programatically.
 */

const GdScriptsRemove = ["dep-cruiser", "validate"];

/*
 * The plugin project lints with oxlint only. These packages serve the eslint config of the template
 * project in the monorepo. @typescript-eslint/* also has a peer range that does not accept the
 * TypeScript version of the template, so npm install fails without --legacy-peer-deps.
 *
 * The eslint-plugin-* packages that the oxlint config loads as JS plugins (headers, import-esm,
 * no-barrel-files, sonarjs) must stay, together with eslint that is their peer dependency.
 */
const UnnecessaryDevDependencies = [
    "@gooddata/eslint-config",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "dependency-cruiser",
    "eslint-plugin-jsdoc",
    "eslint-plugin-react",
];

/*
 * TypeScript 7 has no classic compiler API, and the lint stack (eslint-plugin-sonarjs, ts-api-utils)
 * fails without it. npm hoists one typescript for all of them, so the plugin project uses TypeScript 6.
 * This is the same as the lintTypescriptVersion pin in common/config/subspaces/sdk/.pnpmfile.cjs.
 */
const PluginTypescriptVersion = "6.0.3";

const OxlintOnlyScripts = {
    lint: "oxlint . --quiet",
    "lint-fix": "oxlint . --quiet --fix",
};

const ExplicitTypeScriptDependencies = ["ts-loader", "typescript", "tslib"];

function resolveCurrentPackageVersion() {
    //we need current version of app-toolkit
    const parenPackagePath = path.resolve("./", "package.json");
    const parentPackage = readJsonSync(parenPackagePath);
    return parentPackage.version;
}

function updateGDPackageVersion(version, targets) {
    //replace workspace version definition
    for (const [searchKey, searchValue] of Object.entries(targets)) {
        if (searchValue === "workspace:*") {
            targets[searchKey] = version;
        } else {
            targets[searchKey] = searchValue;
        }
    }
}

function removeGdStuff(packageJson) {
    packageJson.name = "<plugin-name>";
    packageJson.author = "";
    packageJson.description = "";

    const { scripts, devDependencies, dependencies, peerDependencies } = packageJson;

    GdScriptsRemove.forEach((script) => {
        delete scripts[script];
    });

    Object.assign(scripts, OxlintOnlyScripts);

    UnnecessaryDevDependencies.forEach((dep) => {
        delete devDependencies[dep];
    });

    devDependencies.typescript = PluginTypescriptVersion;

    const packageVersion = resolveCurrentPackageVersion();

    updateGDPackageVersion(packageVersion, devDependencies);
    updateGDPackageVersion(packageVersion, dependencies);
    updateGDPackageVersion(packageVersion, peerDependencies);

    delete packageJson.repository;
}

function removeTs(packageJson) {
    const { devDependencies, dependencies } = packageJson;
    const typings = Object.keys(devDependencies).filter((dep) => dep.startsWith("@types"));

    [...ExplicitTypeScriptDependencies, ...typings].forEach((dep) => {
        delete devDependencies[dep];
        delete dependencies[dep];
    });

    delete packageJson.typings;
}

if (process.argv.length === 4) {
    const action = process.argv[2];
    const dir = process.argv[3];
    const packageJsonFile = path.resolve(dir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, { encoding: "utf-8" }));

    if (action === "remove-gd-stuff") {
        console.log("Removing GoodData specifics from package.json");

        removeGdStuff(packageJson);
    } else if (action === "remove-ts") {
        console.log("Removing TypeScript specific dependencies");

        removeTs(packageJson);
    } else {
        console.error(`Unknown action ${action}`);

        process.exit(1);
    }

    fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 4), { encoding: "utf-8" });
} else {
    process.exit(1);
}
