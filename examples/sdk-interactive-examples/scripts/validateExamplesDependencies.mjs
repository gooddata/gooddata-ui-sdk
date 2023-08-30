import fs from "fs";
import path from "path";

// Define the directory paths
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const TEMPLATE_DIR = path.join(__dirname, "../", "examples-template");
const EXAMPLES_DIR = path.join(__dirname, "../", "examples");

const TEMPLATE_PACKAGE_JSON_PATH = path.join(TEMPLATE_DIR, "package.json");

// Read the template package.json to get the dependencies
const templatePackageJson = JSON.parse(fs.readFileSync(TEMPLATE_PACKAGE_JSON_PATH, "utf-8"));
const templateDependencies = templatePackageJson.dependencies;
const templateDependenciesNames = Object.keys(templateDependencies);

// Copy the contents of examples-template to all examples
fs.readdirSync(EXAMPLES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .forEach((dirent) => {
        console.log("Validating example:", dirent.name);

        // Define the paths for the package.json and example-dependency.json files
        const EXAMPLE_PATH = path.join(EXAMPLES_DIR, dirent.name);
        const EXAMPLE_PACKAGE_JSON_PATH = path.join(EXAMPLE_PATH, "package.json");

        // Read the example package.json to get the dependencies
        const examplePackageJson = JSON.parse(fs.readFileSync(EXAMPLE_PACKAGE_JSON_PATH, "utf-8"));
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
                    `Error: Dependency "${exampleDependencyName}" in "${dirent.name}" is not in the template dependency. And should be added to the example specific dependencies "exampleDependencies" filed in package.json. `,
                );
                process.exit(1);
            }
        });
    });

process.exit(0);
