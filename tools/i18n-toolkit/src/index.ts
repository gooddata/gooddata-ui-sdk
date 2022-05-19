#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import { program } from "commander";

import { ToolkitOptions } from "./data";
import { validate } from "./validate";
import { done, fail, error, hr } from "./utils/console";

program
    .option("-p, --path <type>", "path to translations")
    .option("-s, --structure", "enable structure check")
    .option("-i, --intl", "enable intl check")
    .option("-h, --html", "enable html check")
    .option("-r, --insightToReport", "enable insightToReport check")
    .option("-d, --debug", "enable debug mode")
    .action((opts: ToolkitOptions) => {
        validate(opts)
            .then(() => {
                hr(opts.debug);
                done("Localizations are valid!", true);
                process.exit(0);
            })
            .catch((err: Error) => {
                hr(opts.debug);
                fail("Localizations are invalid!", true);
                error(err, opts.debug);
                process.exit(1);
            });
    });

program.parse(process.argv);
