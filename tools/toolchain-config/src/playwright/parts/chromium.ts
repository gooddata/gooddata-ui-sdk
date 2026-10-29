// (C) 2026 GoodData Corporation

import { type Project, type ViewportSize } from "@playwright/test";

/**
 * Chromium flags every e2e suite launches with: headless in Docker, no GPU, no sandbox, and no
 * `/dev/shm` so the container's small shared memory does not crash the renderer.
 */
export const CHROMIUM_LAUNCH_ARGS_BASE: readonly string[] = [
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-sandbox",
];

/**
 * Viewport every e2e suite runs with.
 */
export const DEFAULT_VIEWPORT: ViewportSize = { width: 1400, height: 800 };

/**
 * Options for {@link chromiumProject}.
 */
export interface IChromiumProjectOptions {
    /**
     * Project name. Defaults to `chromium`.
     */
    name?: string;

    /**
     * Viewport. Defaults to {@link DEFAULT_VIEWPORT}.
     */
    viewport?: ViewportSize;

    /**
     * Launch flags appended to {@link CHROMIUM_LAUNCH_ARGS_BASE}.
     */
    launchArgs?: readonly string[];
}

/**
 * The single Chromium project every e2e suite runs.
 */
export function chromiumProject(options: IChromiumProjectOptions = {}): Project {
    const { name = "chromium", viewport = DEFAULT_VIEWPORT, launchArgs = [] } = options;

    return {
        name,
        use: {
            browserName: "chromium",
            viewport,
            launchOptions: {
                args: [...CHROMIUM_LAUNCH_ARGS_BASE, ...launchArgs],
            },
        },
    };
}
