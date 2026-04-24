// (C) 2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

export { authHeader, injectAuthHeader } from "./auth.js";
export {
    type IWorkspaceIdMapping,
    loadMappings,
    resetMappings,
    resetScenarios,
    mockLogRequests,
    goodmockMode,
    GoodmockMode,
    startRecording,
    snapshotAndSaveRecording,
} from "./goodmock.js";
export {
    type BaseTestArgs,
    type BaseWorkerArgs,
    type ICreateTestOptions,
    type IDescribeFunction,
    type IE2eTest,
    type IE2eTestDetails,
    type IFeatureHubEnvironment,
    type IFeatureHubFeature,
    type IGoodmockOptions,
    createTest,
} from "./playwright.js";
export { clickByBoundingBox, hoverByBoundingBox } from "./helpers/mouse-actions.js";
export {
    GOODMOCK_HOST,
    API_TOKEN,
    BACKEND_HOST,
    getBaseUrl,
    getEnvWithFallback,
    getWorkspaceId,
    getDangerWorkspaceId,
} from "./constants.js";
