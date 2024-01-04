import fs from "fs";
import path from "path";
import validateNpmPackageName from "validate-npm-package-name";

// Define the directory paths
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const TEMPLATE_DIR = path.join(__dirname, "../", "examples-template");
const EXAMPLES_DIR = path.join(__dirname, "../", "examples");

const TEMPLATE_PACKAGE_JSON_PATH = path.join(TEMPLATE_DIR, "package.json");

// Read the template package.json to get the dependencies
const templatePackageJson = JSON.parse(fs.readFileSync(TEMPLATE_PACKAGE_JSON_PATH, "utf-8"));
const templateDependencies = templatePackageJson.dependencies;
const templateDependenciesNames = Object.keys(templateDependencies);

function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}

function validatePluginName(name) {
    if (!name || !name.length || !name.trim().length) {
        console.error(`Error: Example "${name}" has empty package name.`);
        process.exit(1);
    }

    const result = validateNpmPackageName(name);
    if (!result.validForNewPackages) {
        const message = (result.errors ?? result.warnings).map((e) => `${capitalize(e)}.`).join(" ");
        console.error(
            `Error: Example "${name}" has invalid package name. ${message} Please rename it to a valid NPM package name.`,
        );
        process.exit(1);
    }
}

function validateExampleDependencies(examplePackageJson, templateDependenciesNames, dirname) {
    const dependencies = examplePackageJson.dependencies;
    const dependenciesNames = Object.keys(dependencies);
    const exampleSpecificDependenciesNames = examplePackageJson.exampleDependencies ?? [];

    // Loop through the example dependencies and check if they are in the template dependencies or in the example-specific dependencies
    dependenciesNames.forEach((exampleDependencyName) => {
        if (
            !templateDependenciesNames.includes(exampleDependencyName) &&
            !exampleSpecificDependenciesNames.includes(exampleDependencyName)
        ) {
            console.error(
                `Error: Dependency "${exampleDependencyName}" in "${dirname}" is not in the template dependency. And should be added to the example specific dependencies "exampleDependencies" filed in package.json. `,
            );
            process.exit(1);
        }
    });
}

// Copy the contents of examples-template to all examples
fs.readdirSync(EXAMPLES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .forEach((dirent) => {
        console.log("Validating example:", dirent.name);

        // Define the paths for the package.json and example-dependency.json files
        const EXAMPLE_PATH = path.join(EXAMPLES_DIR, dirent.name);
        const EXAMPLE_PACKAGE_JSON_PATH = path.join(EXAMPLE_PATH, "package.json");

        // Read the example package.json
        const examplePackageJson = JSON.parse(fs.readFileSync(EXAMPLE_PACKAGE_JSON_PATH, "utf-8"));

        validatePluginName(examplePackageJson.name);
        validateExampleDependencies(examplePackageJson, templateDependenciesNames, dirent.name);
    });

process.exit(0);
