// (C) 2007-2020 GoodData Corporation
import chalk from "chalk";

let logFn = console.log;

export type LogFn = typeof console.log;

export function registerLogFn(f: LogFn): void {
    logFn = f;
}

export function log(key: string, value: string): void {
    logFn(chalk`{bold ✔ ${key}:} {cyan ${value}}`);
}

export function logError(message: string): void {
    logFn(chalk`{white.bold.bgRed ✘} ${message}`);
}

export function logSuccess(message: string): void {
    logFn(chalk`{green ✔} ${message}`);
}

export function logInfo(message: string): void {
    logFn(chalk`{blue 🛈} ${message}`);
}

export function logWarn(message: string): void {
    logFn(chalk`{blue.yellow ⚠} ${message}`);
}

export function logNewSection(): void {
    console.log();
    console.log("-----------------------------------------------------------------------");
    console.log();
}
