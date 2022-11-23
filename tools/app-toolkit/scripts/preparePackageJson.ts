// (C) 2021 GoodData Corporation
/* eslint-disable no-console */
import * as process from "process";
import fs from "fs";
import * as path from "path";
import { keys } from "lodash";

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
 * this script to clean things up programatically.
 */

const GdScriptsRemove = ["test-ci", "eslint-ci", "dep-cruiser", "dep-cruiser-ci", "validate", "validate-ci"];

const UnnecessaryDevDependencies = ["@gooddata/eslint-config", "dependency-cruiser", "eslint-plugin-sonarjs"];

const ExplicitTypeScriptDependencies = [
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "ts-jest",
    "ts-loader",
    "typescript",
    "tslib",
];

function removeGdStuff(packageJson: Record<string, any>) {
    packageJson.name = "<app-name>";
    packageJson.author = "";
    packageJson.description = "";

    const { scripts, devDependencies } = packageJson;

    GdScriptsRemove.forEach((script) => {
        delete scripts[script];
    });

    UnnecessaryDevDependencies.forEach((dep) => {
        delete devDependencies[dep];
    });

    delete packageJson.repository;
}

function removeTs(packageJson: Record<string, any>) {
    const { devDependencies, dependencies } = packageJson;
    const typings = keys(devDependencies).filter((dep) => dep.startsWith("@types"));

    [...ExplicitTypeScriptDependencies, ...typings].forEach((dep) => {
        delete devDependencies[dep];
        delete dependencies[dep];
    });

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
