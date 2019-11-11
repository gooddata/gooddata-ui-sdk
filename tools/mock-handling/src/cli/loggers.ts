// (C) 2007-2019 GoodData Corporation
import chalk from "chalk";

export function log(key: string, value: string) {
    console.log(chalk`{bold ✔ ${key}:} {cyan ${value}}`);
}

export function logError(message: string) {
    console.log(chalk`{white.bold.bgRed  ✘ ERROR } ${message}`);
}

export function logSuccess(message: string) {
    console.log(chalk`{white.bold.bgGreen  ✔ SUCCESS } ${message}`);
}

export function logInfo(message: string) {
    console.log(chalk`{blue.bold    INFO  } ${message}`);
}

export function logWarn(message: string) {
    console.log(chalk`{blue.yellow    WARN  } ${message}`);
}
