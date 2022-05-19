// (C) 2021-2022 GoodData Corporation
/* eslint-disable no-console */

import chalk from "chalk";

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
        console.log(chalk.redBright("✘") + " " + chalk.green.red(msg));
    }
}

export function error(msg: string | Error, debug = false) {
    if (debug) {
        console.error(chalk.redBright(msg));
    }
}

export function hr(debug = false) {
    if (debug) {
        console.error(chalk.whiteBright("-----------------------"));
    }
}
