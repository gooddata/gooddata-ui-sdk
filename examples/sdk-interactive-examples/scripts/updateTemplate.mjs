import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { EXAMPLE_CODESANDBOX_PATH_TEMPLATE } from './constants.mjs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const TEMPLATE_DIR = path.join(__dirname, '../', 'examples-template');
const EXAMPLES_DIR = path.join(__dirname, '../', 'examples');

// Exclude node_modules, .rush, .example, dist, esm and src/example directories and eslint config
const EXCLUDE = "--exclude node_modules --exclude .rush --exclude src/example --exclude .example --exclude dist --exclude esm --exclude .eslintrc.cjs";

function sortObjectByKeys(obj) {
    return Object.keys(obj).sort().reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
}

// Copy the contents of examples-template to all examples
fs.readdirSync(EXAMPLES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .forEach(dirent => {
        console.log('Updating example:',dirent.name);

        const EXAMPLE_PATH = path.join(EXAMPLES_DIR, dirent.name);
        const EXAMPLE_PACKAGE_JSON_PATH = path.join(EXAMPLE_PATH, 'package.json');

        // Read the original package.json to get the name, title, and description values
        const originalPackageJson = JSON.parse(fs.readFileSync(EXAMPLE_PACKAGE_JSON_PATH, 'utf-8'));

        // Read example specific dependencies from "./example/dependencies.json"

        const originalName = originalPackageJson.name;        
        const originalTitle = originalPackageJson.title;
        const originalDescription = originalPackageJson.description;
        const originalDependencies = originalPackageJson.dependencies;
        const originalExampleDependencies = originalPackageJson.exampleDependencies;

        // Copy the contents from TEMPLATE_DIR to EXAMPLE_PATH, excluding node_modules, .rush, and src/example directories
        execSync(`rsync -av --delete --progress ${TEMPLATE_DIR}/ ${EXAMPLE_PATH}/ ${EXCLUDE}/`);

        // Update the package.json name, title, and description values and dependencies
        const updatedPackageJson = JSON.parse(fs.readFileSync(EXAMPLE_PACKAGE_JSON_PATH, 'utf-8'));
        updatedPackageJson.name = originalName;
        updatedPackageJson.title = originalTitle;
        updatedPackageJson.description = originalDescription;
        updatedPackageJson.exampleDependencies = originalExampleDependencies;        

        if (originalExampleDependencies !== undefined && originalExampleDependencies.length > 0) {
            console.log("Specific example dependencies exists. Updating dependencies.");           
            const dependenciesToAdd = {};
            originalExampleDependencies.forEach((exampleDependencyName) => {                

                Object.keys(originalDependencies).forEach((dependency) => { 

                    const dependencyName = dependency
                    const dependencyVersion = originalDependencies[dependency];

                    if(exampleDependencyName === dependencyName){
                        dependenciesToAdd[dependencyName] = dependencyVersion;
                    }
                });
            });

            if(Object.keys(dependenciesToAdd) !== undefined && Object.keys(dependenciesToAdd).length > 0){                
               updatedPackageJson.dependencies = sortObjectByKeys({...updatedPackageJson.dependencies,...dependenciesToAdd});               
            }
        }

        fs.writeFileSync(EXAMPLE_PACKAGE_JSON_PATH, JSON.stringify(updatedPackageJson, null, 2)+'\n');

        // Update ./.codesandbox/template.json
        const templateJsonPath = path.join(EXAMPLE_PATH, '.codesandbox', 'template.json');
        const templateJson = JSON.parse(fs.readFileSync(templateJsonPath, 'utf-8'));
        templateJson.title = originalTitle;
        templateJson.description = originalDescription;

        fs.writeFileSync(templateJsonPath, JSON.stringify(templateJson, null, 2) + '\n');

        //Update ./README.md

        const EXAMPLE_README_PATH = path.join(EXAMPLE_PATH, 'README.md');
        let readme = fs.readFileSync(EXAMPLE_README_PATH, 'utf-8');
        readme = readme.replaceAll('{EXAMPLE-TITLE}', originalTitle);
        readme = readme.replaceAll('{EXAMPLE-DESCRIPTION}', originalDescription);
        
        const exampleSandBoxPath = EXAMPLE_CODESANDBOX_PATH_TEMPLATE.replace('{EXAMPLE-DIR}', dirent.name);

        readme = readme.replaceAll('{CODESANDBOX-PATH}', exampleSandBoxPath);
        
        fs.writeFileSync(EXAMPLE_README_PATH, readme);
    });

console.log('Update completed.');

console.log('Run rush update.');

// Run "rush update"
execSync('rush update', { stdio: 'inherit' });