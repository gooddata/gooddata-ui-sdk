import fs from 'fs';
import path from 'path';
import { EXAMPLE_CODESANDBOX_PATH_TEMPLATE } from './constants.mjs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const TEMPLATE_DIR = path.join(__dirname, '../', 'examples-template');
const EXAMPLES_DIR = path.join(__dirname, '../', 'examples');
const ROOT_README_PATH = path.join(__dirname, '../', 'README.md');

let exampleListResult = '';

function replaceBetweenStartAndEnd(template, toReplace) {
    const startMark = "<!---{LIST-START}-->";
    const endMark = "<!---{LIST-END}}-->";
    const startIndex = template.indexOf(startMark);
    const endIndex = template.indexOf(endMark);
  
    if (startIndex !== -1 && endIndex !== -1) {
      const beforeStart = template.substring(0, startIndex + startMark.length);
      const afterEnd = template.substring(endIndex);
      return `${beforeStart}\n${toReplace}\n${afterEnd}`;
    }
  
    return template;
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

        const originalName = originalPackageJson.name;        
        const originalTitle = originalPackageJson.title;
        const originalDescription = originalPackageJson.description;

        const exampleSandBoxPath = EXAMPLE_CODESANDBOX_PATH_TEMPLATE.replace('{EXAMPLE-DIR}', dirent.name);

        exampleListResult += `* ${originalTitle} - [open in CodeSandbox](${exampleSandBoxPath})\n\n`;
    });

// Update the root README.md with the list of examples

let readme = fs.readFileSync(ROOT_README_PATH, 'utf-8');

readme = replaceBetweenStartAndEnd(readme, exampleListResult);

fs.writeFileSync(ROOT_README_PATH, readme);