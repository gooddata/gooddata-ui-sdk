// (C) 2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

import { type IHarnessOptions, harness, remoteUrlEnvVarFromPackage } from "./presets/harness.js";
import {
    DEFAULT_MODULE_DEDUPE,
    type IModuleOptions,
    federationNameFromPackage,
    module,
} from "./presets/module.js";

export { backendApiProxy } from "./parts/apiProxy.js";
export { STATIC_OUTPUT_FILE_NAMES, resolvePort } from "./parts/buildOutput.js";
export { type IClientConditionsOptions, clientConditions } from "./parts/conditions.js";
export {
    type IHarnessDefinesOptions,
    UNDEFINED_DEFINE,
    envStringDefine,
    harnessDefines,
    moduleDefines,
} from "./parts/define.js";
export {
    DEFAULT_EXPOSES,
    type IFederationRemoteOptions,
    federationRemote,
} from "./parts/federationRemote.js";
export { devServerHttps } from "./parts/https.js";
export { reactPlugin } from "./parts/react.js";
export { NO_PLUGIN_TIMINGS, WORKER_NO_PLUGIN_TIMINGS } from "./parts/rolldownChecks.js";
export { CSS_QUIET_DEPS } from "./parts/scss.js";
export { devAppLoginPlugin } from "./plugins/devAppLogin.js";
export { gitRevisionPlugin } from "./plugins/gitRevision.js";
export {
    type IGooddataSdkSourcePluginOptions,
    gooddataSdkSourcePlugin,
} from "./plugins/gooddataSdkSource.js";
export {
    type ILocationStyleProxyOptions,
    LOCATION_STYLE_ENDPOINT,
    applyProxyRequestHeaders,
    locationStyleProxy,
} from "./plugins/locationStyleProxy.js";
export { type ViteConfigFn, type ViteOverrides, type VitePreset } from "./presets/createPreset.js";
export {
    DEFAULT_MODULE_DEDUPE,
    type IHarnessOptions,
    type IModuleOptions,
    federationNameFromPackage,
    remoteUrlEnvVarFromPackage,
};

/**
 * The Vite presets, one full config per kind of package. Each takes typed options for what it
 * supports and raw Vite config overrides for anything else.
 */
export const presets = {
    module,
    harness,
} as const;
