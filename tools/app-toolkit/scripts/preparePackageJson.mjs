// (C) 2021 GoodData Corporation
/* eslint-disable no-console */
import * as process from "process";
import fs from "fs";
import * as path from "path";
import fse from "fs-extra";

export function readJsonSync(file) {
    return JSON.parse(fse.readFileSync(file, { encoding: "utf-8" }));
}


/*
 * This script is used during build to clean up the contents of package.json that will be shipped with
 * the template project bootstrapped by the application development toolkit.
 *
 * The rationale here is, that the original package.json included in the `react-app-template` contains
 * scripts and dependencies specific of the UI.SDK monorepo. They should not be included in the bootstrapped
 * application project.
 *
 * There are two ways to go.. one is to have additional package.json.template files with only the content
 * that is vital to have in the bootstrapped application. The problem with that approach the dependencies and
 * devDependencies. Within SDK monorepo, we rely on rush to manage consistent versions and to bump intra-SDK
 * dependency versions. The template content would be out of this loop and we will still require some extra
 * processing to transfer & cleanup the dependencies from the main package.json.
 *
 * Alternative to the templates (and possibly some funky `jq` processing to handle the dependencies) is
 * this script to clean things up programmatically.
 */

const GdScriptsReplace = {
    clean: "rm -rf esm *.log",
    test: null,
    "test-once": null,
    "test-ci": null,
    eslint: null,
    "eslint-ci": null,
    "prettier-check": null,
    "prettier-write": null,
    "dep-cruiser": null,
    "dep-cruiser-ci": null,
    validate: null,
    "validate-ci": null,
};

const UnnecessaryDependencies = [
    "@gooddata/eslint-config",
    "dependency-cruiser",
    "eslint-plugin-sonarjs",
    /^eslint/i,
    "prettier",
    "vitest",
    /^@typescript-eslint\//,
];

const TypeScriptDependencies = [
    /^@types\//,
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "ts-loader",
    "typescript",
    "tslib",
];

function removeItems(search, targets) {
    for (const target of Object.keys(targets)) {
        for (const item of search) {
            if (item === target || (item instanceof RegExp && item.test(target))) {
                delete targets[target];
            }
        }
    }
}

function replaceItems(search, targets) {
    for (const [searchKey, searchValue] of Object.entries(search)) {
        if (searchValue === null) {
            delete targets[searchKey];
        } else {
            targets[searchKey] = searchValue;
        }
    }
}

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
    packageJson.name = "<app-name>";
    packageJson.author = "";
    packageJson.description = "GoodData React SDK application";

    const { scripts, devDependencies, dependencies } = packageJson;

    replaceItems(GdScriptsReplace, scripts);
    removeItems(UnnecessaryDependencies, devDependencies);
    removeItems(UnnecessaryDependencies, dependencies);

    const packageVersion = resolveCurrentPackageVersion();

    updateGDPackageVersion(packageVersion, devDependencies);
    updateGDPackageVersion(packageVersion, dependencies);

    delete packageJson.repository;
    delete packageJson.sideEffects;
    delete packageJson.files;
    delete packageJson.license;
}

function removeTs(packageJson) {
    const { devDependencies, dependencies } = packageJson;

    removeItems(TypeScriptDependencies, devDependencies);
    removeItems(TypeScriptDependencies, dependencies);

    delete packageJson.typings;

    if (packageJson.gooddata?.catalogOutput) {
        // Use .js file for catalog export
        packageJson.gooddata.catalogOutput = packageJson.gooddata.catalogOutput.replace(/\.ts$/, ".js");
    }
}

if (process.argv.length !== 4) {
    process.exit(1);
} else {
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
}
