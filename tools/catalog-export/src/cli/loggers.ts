// (C) 2007-2019 GoodData Corporation
import chalk from "chalk";
import stripAnsi from "strip-ansi";

export function realStringLength(str: string) {
    return stripAnsi(str).length;
}

export function createBox(message: string, padding = 2) {
    const messageLength = realStringLength(message);
    const head = "-".repeat(messageLength + 2 * padding);
    return `*${head}*\n|${" ".repeat(padding)}${message}${" ".repeat(padding)}|\n*${head}*`;
}

export function log(key: string, value: string) {
    console.log(chalk`{bold ✔ ${key}:} {cyan ${value}}`);
}

export function logError(message: string) {
    console.log(chalk`{white.bold.bgRed  ✘ ERROR } ${message}`);
}

export function logSuccess(message: string) {
    console.log(chalk`{white.bold.bgGreen  ✔ SUCCESS } ${message}`);
}

export function logBox(message: string, padding: number = 2) {
    console.log(createBox(message, padding));
}

export function printHeader(version: string) {
    if (version) {
        console.log(chalk`{blue.bold ${createBox(`GoodData Catalog Export Tool v${version}`)}}`);
    } else {
        console.log(chalk`{blue.bold ${createBox("GoodData Catalog Export Tool")}}`);
    }
}
