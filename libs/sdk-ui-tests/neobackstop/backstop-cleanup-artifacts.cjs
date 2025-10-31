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

// Create a map of test files for O(1) lookup
// Key: filename, Value: test status
const testFileMap = new Map();
const referenceFileMap = new Map();

data.tests.forEach((test) => {
    if (test.pair?.test) {
        // Extract just the filename from the path
        const testFileName = path.basename(test.pair.test);
        testFileMap.set(testFileName, test.status);
    }
    if (test.pair?.reference) {
        // Extract just the filename from the path
        const refFileName = path.basename(test.pair.reference);
        referenceFileMap.set(refFileName, test.status);
    }
});

// Process all PNG files in the reference directory (not html-report)
if (fs.existsSync(referenceDirectory)) {
    const allFiles = fs.readdirSync(referenceDirectory);
    const pngFiles = allFiles.filter((file) => file.endsWith(".png"));

    // eslint-disable-next-line no-console
    console.log(`Found ${pngFiles.length} PNG files in reference directory`);
    // eslint-disable-next-line no-console
    console.log(`Config contains ${data.tests.length} test results from this matrix run`);

    let removedCount = 0;
    let keptCount = 0;
    let errorCount = 0;

    pngFiles.forEach((file) => {
        const filePath = path.join(referenceDirectory, file);

        try {
            // Check if this file is in our test results (from this matrix run)
            const isInConfig = referenceFileMap.has(file) || testFileMap.has(file);

            if (isInConfig) {
                // File is part of this matrix run - check its status
                const status = referenceFileMap.get(file) || testFileMap.get(file);

                if (status === "pass" && !keepPassingScreenshots) {
                    // Passed test - remove unless keeping all artifacts
                    fs.unlinkSync(filePath);
                    removedCount++;
                } else if (status === "fail") {
                    // Failed test - keep the file
                    keptCount++;
                } else if (status !== "pass" && status !== "fail") {
                    // eslint-disable-next-line no-console
                    console.log(`File ${file} has unrecognized test status: "${status}"`);
                    keptCount++;
                }
            } else {
                // File not in this matrix run's results - delete it
                fs.unlinkSync(filePath);
                removedCount++;
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`Warning: Could not process ${file}: ${error.message}`);
            errorCount++;
        }
    });

    // eslint-disable-next-line no-console
    console.log(`Cleanup summary: ${removedCount} removed, ${keptCount} kept, ${errorCount} errors`);
} else {
    // eslint-disable-next-line no-console
    console.log("Reference directory does not exist, skipping reference cleanup");
}

// Also clean up test images in html-report directory if they exist
if (fs.existsSync(htmlReportPath)) {
    const htmlReportFiles = fs.readdirSync(htmlReportPath);
    const testPngFiles = htmlReportFiles.filter((file) => file.endsWith(".png"));

    testPngFiles.forEach((file) => {
        const filePath = path.join(htmlReportPath, file);

        try {
            // Check if this file is in our test results
            const isInConfig = testFileMap.has(file);

            if (isInConfig) {
                const status = testFileMap.get(file);
                if (status === "pass" && !keepPassingScreenshots) {
                    fs.unlinkSync(filePath);
                }
                // Keep failed test screenshots
            } else {
                // Not in this matrix run - remove
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`Warning: Could not process test file ${file}: ${error.message}`);
        }
    });
}

const updatedTests = data.tests.filter((test) => test.status === "fail");

const replacedConfig = {
    ...data,
    tests: updatedTests,
};
const stringified = JSON.stringify(replacedConfig, null, 2);

// replace original config with adjusted one
const result = `report(${stringified});`;
fs.writeFileSync(outputConfig, result, "utf8");
