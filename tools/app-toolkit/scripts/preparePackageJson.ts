// (C) 2021 GoodData Corporation
/* eslint-disable no-console */
import * as process from "process";
import fs from "fs";
import * as path from "path";

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
    clean: "rm -rf dist *.log",
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
    "@wojtekmaj/enzyme-adapter-react-17",
    "dependency-cruiser",
    "eslint-plugin-sonarjs",
    "enzyme",
    /^eslint/i,
    /^jest/i,
    "prettier",
    "@types/enzyme",
    "@types/jest",
    /^@typescript-eslint\//,
];

const TypeScriptDependencies = [
    /^@types\//,
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "ts-jest",
    "ts-loader",
    "typescript",
    "tslib",
];

function removeItems(search: Array<string | RegExp>, targets: { [key: string]: string }) {
    for (const target of Object.keys(targets)) {
        for (const item of search) {
            if (item === target || (item instanceof RegExp && item.test(target))) {
                delete targets[target];
            }
        }
    }
}

function replaceItems(search: { [key: string]: null | string }, targets: { [key: string]: string }) {
    for (let [searchKey, searchValue] of Object.entries(search)) {
        if (searchValue === null) {
            delete targets[searchKey];
        } else {
            targets[searchKey] = searchValue;
        }
    }
}

function removeGdStuff(packageJson: Record<string, any>) {
    packageJson.name = "<app-name>";
    packageJson.author = "";
    packageJson.description = "GoodData React SDK application";

    const { scripts, devDependencies, dependencies } = packageJson;

    replaceItems(GdScriptsReplace, scripts);
    removeItems(UnnecessaryDependencies, devDependencies);
    removeItems(UnnecessaryDependencies, dependencies);

    delete packageJson.repository;
    delete packageJson.sideEffects;
    delete packageJson.files;
    delete packageJson.license;
}

function removeTs(packageJson: Record<string, any>) {
    const { devDependencies, dependencies } = packageJson;

    removeItems(TypeScriptDependencies, devDependencies);
    removeItems(TypeScriptDependencies, dependencies);

    delete packageJson.typings;
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
