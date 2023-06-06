// (C) 2019-2020 GoodData Corporation
/**
 * @beta
 */
export type TelemetryData = {
    componentName?: string;
    props?: string[];
};

let cachedRuntimeReactVersion: string | undefined = undefined;

(async () => {
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line import/no-unresolved
        const react = await import("react");
        cachedRuntimeReactVersion = react.version ?? "not-supported";
    } catch {
        cachedRuntimeReactVersion = "no-react";
    }

})();

/**
 * @alpha
 */
export function detectReactRuntimeVersion(): string | undefined {
    return cachedRuntimeReactVersion;
}
