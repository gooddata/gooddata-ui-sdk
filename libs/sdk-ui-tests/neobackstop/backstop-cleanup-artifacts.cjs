// (C) 2025 GoodData Corporation

/**
 * Process backstop output results.
 *
 * Adjust config so that the html report is correctly displayed and contains only failed tests.
 *
 * For "passed" tests, remove the screenshot from output to minimize artifact size
 * (when test passes, they're identical to reference images so no need to archive them).
 *
 * For "failed" tests, keep the screenshot from test output and also copy reference
 * image to output.
 *
 **/
const fs = require("fs");
const path = require("path");

const currentDir = __dirname;
const references = "reference";

// eslint-disable-next-line no-console
console.log(`Cleaning artifacts from ${currentDir}/output`);

const outputPath = path.join(currentDir, "output");
const htmlReportPath = path.join(outputPath, "html-report");
const outputConfig = path.join(htmlReportPath, "config.js");

// store artifacts also when tests pass (this takes a lot of space)
const keepPassingScreenshots = process.env.KEEP_ALL_ARTIFACTS === "true";

if (!fs.existsSync(outputConfig)) {
    // eslint-disable-next-line no-console
    console.log("No backstop output, skipping cleanup of test artifacts");
    process.exit(1);
}

const referenceDirectory = path.join(outputPath, references);
fs.mkdirSync(referenceDirectory, { recursive: true });

const configData = fs.readFileSync(outputConfig, "utf8");

// the config json we're interested in is wrapped with report({...});
const configJson = configData.slice("report(".length, -2);
const data = JSON.parse(configJson);

data.tests.forEach((test) => {
    if (test.status === "pass") {
        const referenceFile = test.pair?.reference;
        const testFile = test.pair?.test;
        const referenceFilePath = path.join(htmlReportPath, referenceFile);
        const testFilePath = path.join(htmlReportPath, testFile);

        if (!keepPassingScreenshots) {
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            if (fs.existsSync(referenceFilePath)) {
                fs.unlinkSync(referenceFilePath);
            }
        }
    }

    if (test.status !== "pass" && test.status !== "fail") {
        // eslint-disable-next-line no-console
        console.log(`Processing "${test.pair?.label}", unrecognized test status: "${test.status}"`);
    }
});

const updatedTests = data.tests.filter((test) => test.status === "fail");

const replacedConfig = {
    ...data,
    tests: updatedTests,
};
const stringified = JSON.stringify(replacedConfig, null, 2);

// replace original config with adjusted one
const result = `report(${stringified});`;
fs.writeFileSync(outputConfig, result, "utf8");
