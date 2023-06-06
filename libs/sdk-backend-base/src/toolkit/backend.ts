// (C) 2019-2020 GoodData Corporation
/**
 * @beta
 */
export type TelemetryData = {
    componentName?: string;
    props?: string[];
};

let cachedRuntimeReactVersion: string | undefined = undefined;

function detectAndCacheReactRuntimeVersion() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const react = require("react");
        cachedRuntimeReactVersion = react.version ?? "not-supported";
    } catch {
        cachedRuntimeReactVersion = "no-react";
    }
    return cachedRuntimeReactVersion;
}

/**
 * @alpha
 */
export function detectReactRuntimeVersion(): string | undefined {
    return cachedRuntimeReactVersion ? cachedRuntimeReactVersion : detectAndCacheReactRuntimeVersion();
}
