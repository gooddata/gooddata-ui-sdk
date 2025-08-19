// (C) 2021-2025 GoodData Corporation

import fs from "fs";
import path from "path";
import util from "util";

import xml from "xml2js";

export const RESULTS_DIR = path.resolve("./cypress/results");

function handleError(e) {
    console.error(e);
    process.exit(1);
}

export async function getTestResults() {
    const fileNames = await util.promisify(fs.readdir)(RESULTS_DIR, { recursive: true }).catch(handleError);
    const resultFileNames = fileNames.filter((name) => name.match(/.+\.xml/g));
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
