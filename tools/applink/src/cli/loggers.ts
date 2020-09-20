// (C) 2007-2020 GoodData Corporation
import chalk from "chalk";

export function log(key: string, value: string): void {
    console.log(chalk`{bold ✔ ${key}:} {cyan ${value}}`);
}

export function logError(message: string): void {
    console.log(chalk`{white.bold.bgRed ✘} ${message}`);
}

export function logSuccess(message: string): void {
    console.log(chalk`{green ✔} ${message}`);
}

export function logInfo(message: string): void {
    console.log(chalk`{blue 🛈} ${message}`);
}

export function logWarn(message: string): void {
    console.log(chalk`{blue.yellow ⚠} ${message}`);
}

export function logNewSection(): void {
    console.log();
    console.log("-----------------------------------------------------------------------");
    console.log();
}
