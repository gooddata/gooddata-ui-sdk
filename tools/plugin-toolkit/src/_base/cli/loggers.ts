// (C) 2007-2021 GoodData Corporation
/* eslint-disable no-console */
import chalk from "chalk";
import stripAnsi from "strip-ansi";

export function realStringLength(str: string): number {
    return stripAnsi(str).length;
}

export function createBox(message: string, padding = 2): string {
    const messageLength = realStringLength(message);
    const head = "-".repeat(messageLength + 2 * padding);
    return `*${head}*\n|${" ".repeat(padding)}${message}${" ".repeat(padding)}|\n*${head}*`;
}

export function log(key: string, value: string): void {
    console.log(chalk`{bold ✔ ${key}:} {cyan ${value}}`);
}

export function logError(message: string): void {
    console.log(chalk`{white.bold.bgRed  ✘ ERROR } ${message}`);
}

export function logSuccess(message: string): void {
    console.log(chalk`{white.bold.bgGreen  ✔ SUCCESS } ${message}`);
}

export function logWarn(message: string): void {
    console.log(chalk`{blue.yellow    WARN  } ${message}`);
}

export function logInfo(message: string): void {
    console.log(chalk`{blue.bold    INFO  } ${message}`);
}

export function logBox(message: string, padding: number = 2): void {
    console.log(createBox(message, padding));
}

export function printHeader(version: string): void {
    const name = version ? `GoodData Catalog Export Tool v${version}` : "GoodData Catalog Export Tool";
    console.log(chalk`{blue.bold ${createBox(name)}}`);
}
