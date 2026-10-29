// (C) 2026 GoodData Corporation

import { globSync } from "node:fs";
import { basename } from "node:path";

/**
 * Default location of the Playwright config inside an e2e package.
 */
export const DEFAULT_PLAYWRIGHT_CONFIG_FILE = "playwright/playwright.config.ts";

/**
 * Default glob of the Playwright spec files inside an e2e package.
 */
export const DEFAULT_PLAYWRIGHT_SPEC_GLOB = "playwright/tests/**/*.spec.ts";

/**
 * Options for {@link playwrightInputs}.
 */
export interface IPlaywrightInputsOptions {
    /**
     * Playwright config entry, relative to the package root.
     * Defaults to {@link DEFAULT_PLAYWRIGHT_CONFIG_FILE}.
     */
    configFile?: string;

    /**
     * Glob of the spec files, relative to the package root.
     * Defaults to {@link DEFAULT_PLAYWRIGHT_SPEC_GLOB}.
     */
    specGlob?: string;
}

/**
 * Rolldown `input` map for a Playwright e2e package: the config as `playwright.config` and every spec
 * file as `tests/<name>`, so the bundled `dist/` mirrors the layout Playwright expects to run.
 *
 * The glob is resolved against the current working directory, which is the package root when
 * rolldown loads the config.
 */
export function playwrightInputs(options: IPlaywrightInputsOptions = {}): Record<string, string> {
    const { configFile = DEFAULT_PLAYWRIGHT_CONFIG_FILE, specGlob = DEFAULT_PLAYWRIGHT_SPEC_GLOB } = options;

    const specFiles = globSync(specGlob);

    return {
        "playwright.config": configFile,
        ...Object.fromEntries(specFiles.map((file) => [`tests/${basename(file, ".ts")}`, file])),
    };
}
