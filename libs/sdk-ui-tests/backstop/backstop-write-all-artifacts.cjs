/**
 * Process backstop output results.
 *
 * Adjust config so that the html report is correctly displayed and contains all tests.
 *
 **/
const fs = require("fs");
const path = require("path");

const currentDir = __dirname;
const references = "reference";

console.log(`Storing all artifacts from ${currentDir}/output`);

const outputPath = path.join(currentDir, "output");
const htmlReportPath = path.join(outputPath, "html-report");
const outputConfig = path.join(htmlReportPath, "config.js");

if (!fs.existsSync(outputConfig)) {
    console.log("No backstop output, skipping cleanup of test artifacts");
    process.exit(1);
}

// this will be the newly added directory to output, to which we copy
// reference screenshots for failed tests
const referenceDirectory = path.join(outputPath, references);
fs.mkdirSync(referenceDirectory, { recursive: true });

const configData = fs.readFileSync(outputConfig, "utf8");

// the config json we're interested in is wrapped with report({...});
const configJson = configData.slice("report(".length, -2);
const data = JSON.parse(configJson);

data.tests.forEach((test) => {
    if (test.status === "pass" || test.status === "fail") {
        const referenceFile = test.pair?.reference;
        const referencePath = path.join(htmlReportPath, referenceFile);
        const baseReferenceFilename = path.basename(referencePath);
        const destReference = path.join(referenceDirectory, baseReferenceFilename);

        if (fs.existsSync(referencePath)) {
            fs.copyFileSync(referencePath, destReference);
        }
    } else {
        console.log(`Processing "${test.pair?.label}", unrecognized test status: "${test.status}"`);
    }
});

const updatedTests = data.tests
    .filter((test) => test.status === "fail")
    .map((test) => ({
        ...test,
        pair: {
            ...test.pair,
            reference: test.pair?.reference?.replace(`../../${references}`, `../${references}`),
        },
    }));

const replacedConfig = {
    ...data,
    tests: updatedTests,
};
const stringified = JSON.stringify(replacedConfig, null, 2);

// replace original config with adjusted one
const result = `report(${stringified});`;
fs.writeFileSync(outputConfig, result, "utf8");
