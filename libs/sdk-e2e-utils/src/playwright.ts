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

/**
 * @internal
 */
export interface IGoodmockOptions {
    host: string;
    backendHost: string;
    getMappingPath: (specFile: string) => string;
    workspaceIdMappings?: IWorkspaceIdMapping | IWorkspaceIdMapping[];
    baseUrl?: string;
}

/**
 * @internal
 */
export interface IE2eTestDetails extends TestDetails {
    workspaceSettings?: Record<string, unknown>;
    additionalWindowProperties?: Record<string, unknown>;
}

/**
 * @internal
 */
export interface IFeatureHubFeature {
    id: string;
    key: string;
    l: boolean;
    version?: number;
    type: string;
    value?: boolean | string | number;
    strategies?: unknown[];
    v?: string;
}

/**
 * @internal
 */
export interface IFeatureHubEnvironment {
    id: string;
    features: IFeatureHubFeature[];
}

/**
 * @internal
 */
export type BaseTestArgs = PlaywrightTestArgs & PlaywrightTestOptions;
/**
 * @internal
 */
export type BaseWorkerArgs = PlaywrightWorkerArgs & PlaywrightWorkerOptions;

/**
 * @internal
 */
export interface ICreateTestOptions<
    T extends Record<string, unknown> = {},
    W extends Record<string, unknown> = {},
> {
    goodmock?: IGoodmockOptions;
    fixtures?: Fixtures<T, W, BaseTestArgs & T, BaseWorkerArgs & W>;
    featureHubResponse?: IFeatureHubEnvironment[];
}

// --- topLevelDescribe function type ---

/**
 * @internal
 */
export interface IDescribeFunction {
    (suiteName: string, specName: string, fn: () => void): void;
    (suiteName: string, specName: string, details: IE2eTestDetails, fn: () => void): void;
    skip: {
        (suiteName: string, specName: string, fn: () => void): void;
        (suiteName: string, specName: string, details: IE2eTestDetails, fn: () => void): void;
    };
}

/**
 * @internal
 */
export type IE2eTest = typeof test & {
    topLevelDescribe: IDescribeFunction;
    describe: {
        (title: string, callback: () => void): void;
        (title: string, details: IE2eTestDetails, callback: () => void): void;
        skip: {
            (title: string, callback: () => void): void;
            (title: string, details: IE2eTestDetails, callback: () => void): void;
        };
        only: (typeof test)["describe"]["only"];
        configure: (typeof test)["describe"]["configure"];
        fixme: (typeof test)["describe"]["fixme"];
        serial: (typeof test)["describe"]["serial"];
        parallel: (typeof test)["describe"]["parallel"];
    };
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

/** Strip custom fields before passing details to Playwright. */
function toPlaywrightDetails(details: IE2eTestDetails | undefined): TestDetails | undefined {
    if (!details) return undefined;
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
    const { workspaceSettings: _ws, additionalWindowProperties: _awp, ...rest } = details;
    return Object.keys(rest).length > 0 ? rest : undefined;
}

/** Inject workspace settings and additional window properties via a single addInitScript. */
function injectWindowProperties(
    testInst: typeof test,
    settings: Record<string, unknown>,
    awp: Record<string, unknown>,
): void {
    testInst.beforeEach(async ({ page }) => {
        await page.addInitScript(
            (args: { s: Record<string, unknown>; a: Record<string, unknown> }) => {
                const w = window as unknown as Record<string, unknown>;
                if (Object.keys(args.s).length > 0) {
                    w["customWorkspaceSettings"] = args.s;
                }
                for (const [key, value] of Object.entries(args.a)) {
                    w[key] = value;
                }
            },
            { s: settings, a: awp },
        );
    });
}

// --- Factory ---
/**
 * @internal
 * @param options -
 */
export function createTest<T extends Record<string, unknown> = {}, W extends Record<string, unknown> = {}>(
    options: ICreateTestOptions<T, W> = {} as ICreateTestOptions<T, W>,
): IE2eTest {
    const testInstance: typeof test = options.fixtures
        ? (test.extend(options.fixtures) as typeof test)
        : test;

    // Tracks whether we're inside a topLevelDescribe during synchronous registration.
    let insideTopLevelDescribe = false;

    // Stacks track workspace settings / additionalWindowProperties hierarchy during
    // synchronous describe registration. Each level merges on top of the parent's.
    // The beforeEach at each level captures the fully-merged snapshot, so the
    // innermost beforeEach (which runs last) wins.
    const settingsStack: Record<string, unknown>[] = [];
    const awpStack: Record<string, unknown>[] = [];

    function currentSettings(): Record<string, unknown> {
        return settingsStack.length > 0 ? settingsStack[settingsStack.length - 1] : {};
    }

    function currentAwp(): Record<string, unknown> {
        return awpStack.length > 0 ? awpStack[awpStack.length - 1] : {};
    }

    /** Push merged settings/awp onto stacks, register a single beforeEach, call fn, pop. */
    function withDescribeDetails(
        ws: Record<string, unknown> | undefined,
        awp: Record<string, unknown> | undefined,
        fn: () => void,
    ): void {
        if (!ws && !awp) {
            fn();
            return;
        }
        const mergedSettings = ws ? { ...currentSettings(), ...ws } : currentSettings();
        const mergedAwp = awp ? { ...currentAwp(), ...awp } : currentAwp();

        if (ws) settingsStack.push(mergedSettings);
        if (awp) awpStack.push(mergedAwp);

        injectWindowProperties(testInstance, mergedSettings, mergedAwp);
        fn();

        if (awp) awpStack.pop();
        if (ws) settingsStack.pop();
    }

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
                            headers: { "access-control-allow-origin": "*" },
                            body,
                        });
                    });
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

            // Workspace settings + additional window properties — merge with parent
            // stack and inject beforeEach. Wraps fn() so nested describes inherit.
            insideTopLevelDescribe = true;
            withDescribeDetails(details?.workspaceSettings, details?.additionalWindowProperties, fn);
            insideTopLevelDescribe = false;
        };
    }

    // --- Override test.describe to support workspaceSettings merging ---

    const originalDescribe = testInstance.describe;

    function wrappedDescribe(title: string, callback: () => void): void;
    function wrappedDescribe(title: string, details: IE2eTestDetails, callback: () => void): void;
    function wrappedDescribe(
        title: string,
        detailsOrCb: IE2eTestDetails | (() => void),
        cb?: () => void,
    ): void {
        if (!insideTopLevelDescribe) {
            throw new Error(
                `test.describe("${title}") must be nested inside a test.topLevelDescribe() block.`,
            );
        }

        const hasDetails = typeof detailsOrCb !== "function";
        const details = hasDetails ? (detailsOrCb as IE2eTestDetails) : undefined;
        const callback = hasDetails ? (cb as () => void) : (detailsOrCb as () => void);
        const pwDetails = toPlaywrightDetails(details);

        const wrapped = () =>
            withDescribeDetails(details?.workspaceSettings, details?.additionalWindowProperties, callback);

        if (pwDetails) {
            originalDescribe(title, pwDetails, wrapped);
        } else {
            originalDescribe(title, wrapped);
        }
    }

    // Wrap describe.skip with the same workspaceSettings merging logic.
    const originalSkip = originalDescribe.skip;
    function wrappedSkip(title: string, callback: () => void): void;
    function wrappedSkip(title: string, details: IE2eTestDetails, callback: () => void): void;
    function wrappedSkip(title: string, detailsOrCb: IE2eTestDetails | (() => void), cb?: () => void): void {
        const hasDetails = typeof detailsOrCb !== "function";
        const details = hasDetails ? (detailsOrCb as IE2eTestDetails) : undefined;
        const callback = hasDetails ? (cb as () => void) : (detailsOrCb as () => void);

        const wrapped = () =>
            withDescribeDetails(details?.workspaceSettings, details?.additionalWindowProperties, callback);
        originalSkip(title, wrapped);
    }

    // Preserve all sub-methods (.only, .serial, .parallel, .configure, .fixme)
    Object.assign(wrappedDescribe, originalDescribe);
    wrappedDescribe.skip = wrappedSkip;
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    (testInstance as any).describe = wrappedDescribe;

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
            originalDescribe(suiteName, pwDetails, suite);
        } else {
            // oxlint-disable-next-line playwright/valid-describe-callback
            originalDescribe(suiteName, suite);
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
        originalSkip(suiteName, suite);
    }

    topLevelDescribe.skip = skip as IDescribeFunction["skip"];

    // Attach topLevelDescribe onto the test instance
    const e2eTest = testInstance as unknown as IE2eTest;
    e2eTest.topLevelDescribe = topLevelDescribe as IDescribeFunction;

    return e2eTest;
}
