// (C) 2026 GoodData Corporation

// oxlint-disable eslint-js/no-console

import {
    type IHeadlessModule,
    type IHeadlessModuleMountOptions,
    type ITelemetryProvider,
} from "@gooddata/sdk-pluggable-application-model";

// vite.config.ts and vitest.config.ts define both values at build time.
declare const __BUILD_TIMESTAMP__: number;
declare const __ALLOWED_ORGANIZATIONS__: string[];

const DEFAULT_LOG_PREFIX = "[gdc-headless-template-name]";

// The starter provider writes the telemetry to the browser console. README.md has provider recipes
// for Amplitude, Mixpanel, PostHog and Pendo.
export function createTelemetryProvider(config: Record<string, unknown>): ITelemetryProvider {
    const prefix = typeof config["logPrefix"] === "string" ? config["logPrefix"] : DEFAULT_LOG_PREFIX;
    return {
        identify(identity) {
            console.info(prefix, "identify", identity);
        },
        trackEvent(eventName, data) {
            console.info(prefix, "event", eventName, data);
        },
        trackPageView(page, data) {
            console.info(prefix, "page", page, data);
        },
        trackTiming(variable, valueMs, data) {
            console.info(prefix, "timing", variable, valueMs, data);
        },
    };
}

export const headlessModule: IHeadlessModule = {
    allowedOrganizations: __ALLOWED_ORGANIZATIONS__,
    buildTimestamp: __BUILD_TIMESTAMP__,
    mount({ config, registerTelemetryProvider }: IHeadlessModuleMountOptions) {
        const unregister = registerTelemetryProvider(createTelemetryProvider(config));
        return {
            unmount: unregister,
        };
    },
};
