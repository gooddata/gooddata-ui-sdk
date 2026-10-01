// (C) 2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

// auth
export { authHeader, authedRouteFetch, injectAuthHeader } from "./auth.js";

// constants
export {
    GOODMOCK_HOST,
    API_TOKEN,
    BACKEND_HOST,
    getBaseUrl,
    getEnvWithFallback,
    getWorkspaceId,
    getDangerWorkspaceId,
} from "./constants.js";

// // create-test - feature-hub
export type { IFeatureHubEnvironment, IFeatureHubFeature } from "./create-test/feature-hub/types.js";

// create-test - GoodMock
export type {
    IGoodmockMapping,
    ILeakPattern,
    ISecretMapping,
    IWorkspaceIdMapping,
    IGoodmockOptions,
} from "./create-test/goodmock/types.js";
export {
    loadMappings,
    resetMappings,
    resetScenarios,
    mockLogRequests,
    startRecording,
} from "./create-test/goodmock/admin.js";
export { goodmockMode, GoodmockMode } from "./create-test/goodmock/mode.js";
export {
    snapshotAndSaveRecording,
    type ISnapshotAndSaveRecordingOptions,
} from "./create-test/goodmock/snapshot/snapshot-and-save-recording.js";

// create-test - playwright
export type { Callback } from "./create-test/playwright/call-original-fn.js";
export type { IDescribe, IDescribeFunction } from "./create-test/playwright/describe/factory.js";
export type { Fixtures } from "./create-test/playwright/fixtures.js";
export type {
    BaseTestArgs,
    BaseWorkerArgs,
    DescribeConfigure,
    DescribeFixme,
    DescribeOnly,
    DescribeParallel,
    DescribeSerial,
    DescribeSkip,
    Test,
} from "./create-test/playwright/playwright-types.js";
export { createTest } from "./create-test/playwright/test/factory.js";
export type {
    ICreateTestOptions,
    ICustomCreateTestOptions,
    ITest,
} from "./create-test/playwright/test/types.js";
export type { ITestDetails, WindowProperties, WorkspaceSettings } from "./create-test/playwright/types.js";
export type {
    ITopLevelDescribe,
    ITopLevelDescribeFunction,
} from "./create-test/playwright/top-level-describe/types.js";

// helpers
export { clickByBoundingBox, hoverByBoundingBox } from "./helpers/mouse-actions.js";
