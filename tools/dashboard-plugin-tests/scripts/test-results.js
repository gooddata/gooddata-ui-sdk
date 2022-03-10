// (C) 2021 GoodData Corporation
const util = require("util");
const fs = require("fs");
const path = require("path");

const xml = require("xml2js");

const RESULTS_DIR = path.resolve("./cypress/results");

function handleError(e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
}

async function getTestResults() {
    const fileNames = await util.promisify(fs.readdir)(RESULTS_DIR).catch(handleError);
    const resultFileNames = fileNames.filter((name) => name.match(/result\..+\.xml/g));
    const result = [];
    for (const fileName of resultFileNames) {
        const resultPath = path.resolve(RESULTS_DIR, fileName);
        const strContent = await util.promisify(fs.readFile)(resultPath, "utf8").catch(handleError);
        const content = await xml.parseStringPromise(strContent);

        const file = content.testsuites.testsuite[0].$.file;
        const { time, tests, failures, skipped } = content.testsuites.$;

        result.push({
            file,
            tests,
            failures,
            time,
            skipped,
        });
    }

    return result;
}

module.exports = {
    RESULTS_DIR,
    getTestResults,
};
