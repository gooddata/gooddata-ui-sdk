// (C) 2026 GoodData Corporation

// oxlint-disable typescript-eslint/no-empty-object-type

import {
    type Fixtures,
    type PlaywrightTestArgs,
    type PlaywrightTestOptions,
    type PlaywrightWorkerArgs,
    type PlaywrightWorkerOptions,
    type TestDetails,
    test,
} from "@playwright/test";

import {
    GoodmockMode,
    type IWorkspaceIdMapping,
    goodmockMode as getGoodmockMode,
    loadMappings,
    resetMappings,
    snapshotAndSaveRecording,
    startRecording,
} from "./goodmock.js";

// --- Public interfaces ---

export interface IGoodmockOptions {
    host: string;
    backendHost: string;
    getMappingPath: (specFile: string) => string;
    workspaceIdMappings?: IWorkspaceIdMapping | IWorkspaceIdMapping[];
    baseUrl?: string;
}

export interface IE2eTestDetails extends TestDetails {
    featureFlags?: Record<string, unknown>;
}

export interface IFeatureHubFeature {
    id: string;
    key: string;
    l: boolean;
    version?: number;
    type: string;
    value: boolean | string | number;
    strategies?: unknown[];
    v?: string;
}

export interface IFeatureHubEnvironment {
    id: string;
    features: IFeatureHubFeature[];
}

type BaseTestArgs = PlaywrightTestArgs & PlaywrightTestOptions;
type BaseWorkerArgs = PlaywrightWorkerArgs & PlaywrightWorkerOptions;

export interface ICreateTestOptions<
    T extends Record<string, unknown> = {},
    W extends Record<string, unknown> = {},
> {
    goodmock?: IGoodmockOptions;
    fixtures?: Fixtures<T, W, BaseTestArgs & T, BaseWorkerArgs & W>;
    featureHubResponse?: IFeatureHubEnvironment[];
}

// --- topLevelDescribe function type ---

export interface IDescribeFunction {
    (suiteName: string, specName: string, fn: () => void): void;
    (suiteName: string, specName: string, details: IE2eTestDetails, fn: () => void): void;
    skip: {
        (suiteName: string, specName: string, fn: () => void): void;
        (suiteName: string, specName: string, details: IE2eTestDetails, fn: () => void): void;
    };
}

export type IE2eTest = typeof test & {
    topLevelDescribe: IDescribeFunction;
};

// --- Internal helpers ---

function parseArgs(
    detailsOrFn: IE2eTestDetails | (() => void),
    func?: () => void,
): { details: IE2eTestDetails | undefined; fn: () => void } {
    const hasDetails = typeof detailsOrFn !== "function";
    return {
        details: hasDetails ? (detailsOrFn as IE2eTestDetails) : undefined,
        fn: hasDetails ? (func as () => void) : (detailsOrFn as () => void),
    };
}

/** Strip custom fields (featureFlags) before passing details to Playwright. */
function toPlaywrightDetails(details: IE2eTestDetails | undefined): TestDetails | undefined {
    if (!details) return undefined;
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
    const { featureFlags: _, ...rest } = details;
    return Object.keys(rest).length > 0 ? rest : undefined;
}

// --- Factory ---

export function createTest<T extends Record<string, unknown> = {}, W extends Record<string, unknown> = {}>(
    options: ICreateTestOptions<T, W> = {} as ICreateTestOptions<T, W>,
): IE2eTest {
    const testInstance: typeof test = options.fixtures
        ? (test.extend(options.fixtures) as typeof test)
        : test;

    function buildSuiteCallback(
        specName: string,
        details: IE2eTestDetails | undefined,
        fn: () => void,
    ): () => void {
        return () => {
            // FeatureHub mock — each test gets a fresh page, so route dies with it.
            if (options.featureHubResponse) {
                const body = JSON.stringify(options.featureHubResponse);
                testInstance.beforeEach(async ({ page }) => {
                    await page.route("**/features*", async (route) => {
                        await route.fulfill({
                            status: 200,
                            contentType: "application/json",
                            body,
                        });
                    });
                });
            }

            // Feature flags beforeEach — defined first so it runs before any spec-defined hooks.
            if (details?.featureFlags) {
                const flags = details.featureFlags;
                testInstance.beforeEach(async ({ page }) => {
                    await page.addInitScript((settings: Record<string, unknown>) => {
                        (window as unknown as Record<string, unknown>)["customWorkspaceSettings"] = settings;
                        (window as unknown as Record<string, unknown>)[
                            "useSafeWidgetLocalIdentifiersForE2e"
                        ] = true;
                    }, flags);
                });
            }

            // Goodmock lifecycle hooks
            const gm = options.goodmock;
            if (gm?.host) {
                const goodmockMode = getGoodmockMode();
                if (goodmockMode !== GoodmockMode.Proxy) {
                    testInstance.beforeAll(async () => {
                        await resetMappings(gm.host);
                        if (goodmockMode === GoodmockMode.Record) {
                            await startRecording(gm.host, gm.backendHost);
                        } else if (goodmockMode === GoodmockMode.Replay) {
                            await loadMappings(gm.host, gm.getMappingPath(specName));
                        }
                    });

                    testInstance.afterAll(async () => {
                        if (goodmockMode === GoodmockMode.Record) {
                            await snapshotAndSaveRecording(
                                gm.host,
                                gm.getMappingPath(specName),
                                gm.workspaceIdMappings,
                                gm.backendHost,
                                gm.baseUrl,
                            );
                        }
                        await resetMappings(gm.host);
                    });

                    // TODO: When this is supported in goodmock, uncomment this block
                    // testInstance.beforeEach(async () => {
                    //     await resetScenarios(gm.host);
                    // });
                }
            }

            fn(); // user's test.beforeAll/beforeEach calls stack on top naturally
        };
    }

    // --- topLevelDescribe ---

    function topLevelDescribe(suiteName: string, specName: string, fn: () => void): void;
    function topLevelDescribe(
        suiteName: string,
        specName: string,
        details: IE2eTestDetails,
        fn: () => void,
    ): void;
    function topLevelDescribe(
        suiteName: string,
        specName: string,
        detailsOrFn: IE2eTestDetails | (() => void),
        func?: () => void,
    ) {
        const { details, fn } = parseArgs(detailsOrFn, func);
        const suite = buildSuiteCallback(specName, details, fn);
        const pwDetails = toPlaywrightDetails(details);

        if (pwDetails) {
            // oxlint-disable-next-line playwright/valid-describe-callback
            testInstance.describe(suiteName, pwDetails, suite);
        } else {
            // oxlint-disable-next-line playwright/valid-describe-callback
            testInstance.describe(suiteName, suite);
        }
    }

    // --- topLevelDescribe.skip ---

    function skip(suiteName: string, specName: string, fn: () => void): void;
    function skip(suiteName: string, specName: string, details: IE2eTestDetails, fn: () => void): void;
    function skip(
        suiteName: string,
        specName: string,
        detailsOrFn: IE2eTestDetails | (() => void),
        func?: () => void,
    ) {
        const { details, fn } = parseArgs(detailsOrFn, func);
        const suite = buildSuiteCallback(specName, details, fn);

        // oxlint-disable-next-line playwright/valid-describe-callback
        testInstance.describe.skip(suiteName, suite);
    }

    topLevelDescribe.skip = skip as IDescribeFunction["skip"];

    // Attach topLevelDescribe onto the test instance
    const e2eTest = testInstance as IE2eTest;
    e2eTest.topLevelDescribe = topLevelDescribe as IDescribeFunction;

    return e2eTest;
}
