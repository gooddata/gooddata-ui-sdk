// (C) 2026 GoodData Corporation

import { type ReporterDescription } from "@playwright/test";

/**
 * The reporters every e2e suite uses: `list` for the console and `json` for the CI report tooling.
 */
export function defaultReporters(outputFile = "results/results.json"): ReporterDescription[] {
    return [["list"], ["json", { outputFile }]];
}
