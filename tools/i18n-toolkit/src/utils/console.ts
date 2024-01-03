// (C) 2021-2022 GoodData Corporation
/* eslint-disable no-console */

import chalk from "chalk";
import flatten from "lodash/flatten.js";

import { UsageResult } from "../data.js";
import * as path from "path";

export function skipped(msg: string, debug = false) {
    if (debug) {
        console.log(chalk.gray("⧵") + " " + chalk.gray.italic(msg));
    }
}

export function message(msg: string, debug = false) {
    if (debug) {
        console.log(chalk.white(msg));
    }
}

export function done(msg: string, debug = false) {
    if (debug) {
        console.log(chalk.greenBright("✔") + " " + chalk.green.italic(msg));
    }
}

export function fail(msg: string, debug = false) {
    if (debug) {
        console.error(chalk.redBright("✘") + " " + chalk.green.red(msg));
    }
}

export function error(msg: Error, debug = false) {
    if (debug) {
        console.error(chalk.redBright(msg));
    }
}

export function hr(debug = false) {
    if (debug) {
        console.error(chalk.whiteBright("-----------------------"));
    }
}

export function resultsInfo(cwd: string, results: UsageResult[], uncontrolled: Array<string>, debug = false) {
    message(" ┣ Usage check results:", true);
    table(resultsToRows(cwd, results, uncontrolled));

    if (debug) {
        message(" ┣ Detailed info:", debug);
        table(resultToDetails(cwd, results, uncontrolled));
    }
    message(" ┗━━━━━━━━━━━ End of results.", true);
}

export function resultsToRows(cwd: string, results: UsageResult[], uncontrolled: Array<string>): string[][] {
    return [
        [" ┣ ", "Identifier", "Extracted", "Loaded", "Missing", "Unused", "Ignored", "Translation files"].map(
            (s) => chalk.bold(s),
        ),
        ...results.map<string[]>(resultToRow.bind(null, cwd)),
        [
            " ┣ ",
            chalk.yellowBright("uncontrolled"),
            "-",
            uncontrolled.length ? chalk.redBright(uncontrolled.length) : chalk.white("0"),
        ],
    ];
}

function resultToRow(cwd: string, { identifier, ignore, stats, files }: UsageResult) {
    const filesText = files.map((file) => path.relative(cwd, file)).join(",");

    if (ignore) {
        return [
            " ┣ ",
            chalk.white(`IGNORED: ${crop(identifier)}`),
            chalk.white(stats.extracted),
            "-",
            "-",
            "-",
            chalk.white(stats.ignored),
            filesText,
        ];
    }

    return [
        " ┣ ",
        chalk.blueBright(crop(identifier)),
        chalk.white(stats.extracted),
        chalk.white(stats.loaded),
        stats.missing > 0 ? chalk.redBright(stats.missing) : chalk.white(stats.missing),
        stats.unused > 0 ? chalk.redBright(stats.unused) : chalk.white(stats.unused),
        stats.ignored > 0 ? chalk.gray(stats.ignored) : "-",
        filesText,
    ];
}

function resultToDetails(cwd: string, results: UsageResult[], uncontrolled: Array<string>): string[][] {
    return [
        [" ┣ ", "File", "Pattern", "Problem", "Id of message"].map((s) => chalk.bold(s)),
        ...flatten(
            results
                .filter(({ ignore, stats }) => !ignore && (stats.unused > 0 || stats.missing > 0))
                .map<string[][]>(resultToDetail.bind(null, cwd)),
        ),
        ...uncontrolled.map((item) => [
            " ┣ ",
            "",
            "",
            chalk.yellowBright("uncontrolled"),
            chalk.redBright(item),
        ]),
    ];
}

function resultToDetail(cwd: string, { identifier, files, data }: UsageResult) {
    const filesText = files.map((file) => path.relative(cwd, file)).join(",");

    return [
        ...data.missingMessages.map((item) => [
            " ┣ ",
            filesText,
            identifier,
            "missing",
            chalk.redBright(item),
        ]),
        ...data.unusedMessages.map((item) => [
            " ┣ ",
            filesText,
            identifier,
            "unused",
            chalk.blueBright(item),
        ]),
    ];
}

function table(data: string[][]) {
    const max = data.reduce((prev, columns) => {
        columns.forEach((colum, i) => {
            prev[i] = Math.max(prev[i], realLength(colum));
        });
        return prev;
    }, data[0].map(() => 0) as number[]);

    const padded = data.map((row) => {
        return row.map((item, i) => {
            const add = max[i] + 2 - realLength(item);
            return item + "".padEnd(add, " ");
        });
    });

    padded.forEach((row) => {
        console.log(row.join(""));
    });
}

function realLength(str: string) {
    // eslint-disable-next-line no-control-regex
    return ("" + str).replace(/\u001b\[\d+m/g, "").length;
}

function crop(text: string) {
    const max = 70;
    if (text.length > max) {
        return text.slice(0, max - 3) + "...";
    }
    return text;
}
