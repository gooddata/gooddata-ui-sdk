#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import fs from "fs";
import path from "path";
import util from "util";

import { getTestResults, RESULTS_DIR } from "./lib/test_results.js";

const GITHUB_MESSAGE_FILE = path.resolve(RESULTS_DIR, "github_message.md");

const { BUILD_URL } = process.env;

function handleError(e) {
    console.error(e);
    process.exit(1);
}

function createOverviewMessage(testResults) {
    const failures = testResults.reduce((acc, test) => acc + test.failures, 0);

    if (failures > 0) {
        return `## 😢 Some tests are failing. Consider fixing them.`;
    }

    return `## 🎉 Great news! Tests were successful.`;
}

function createSuitesMessage(testResults) {
    if (testResults.length === 0) {
        return "## 🤕 No test results.\n";
    }

    const result = [];

    testResults.forEach((spec) => {
        const { file, tests, failures, time, skipped } = spec;

        const isFailing = parseInt(failures) > 0;

        const formattedFailures = isFailing ? `<span style="color: red">${failures}</span>` : "-";
        const formattedStatus = isFailing ? "❌" : "✅";

        const shortFileName = file.split("/").slice(-1)[0];

        const videoFile = BUILD_URL
            ? `${BUILD_URL}/artifact/libs/sdk-ui-tests-e2e/cypress/videos/${shortFileName}.mp4`
            : `#`;

        const formattedFile = isFailing ? `[🎥 ${shortFileName}](${videoFile})` : shortFileName;

        if (tests !== skipped) {
            const skippedDetail = !skipped ? "" : `(${skipped} skipped)`;
            result.push(
                `|${formattedStatus}|**${formattedFile}**|${tests}${skippedDetail}|${formattedFailures}|${time}s|`,
            );
        }
    });

    return "" + "|Status|Name|Tests|Failures|Time|\n" + "|:--:|:--|:--:|:--:|--:|\n" + result.join("\n");
}

async function main() {
    const testResults = await getTestResults();

    const result =
        "" +
        "# ✨ Cypress test results ✨\n\n" +
        createOverviewMessage(testResults) +
        "\n\n" +
        createSuitesMessage(testResults) +
        "\n\n" +
        `You can find full report [here](${BUILD_URL || "#"}).\n`;

    await util.promisify(fs.writeFile)(GITHUB_MESSAGE_FILE, result).catch(handleError);
}

main();
