// (C) 2026 GoodData Corporation

import { defaultClientConditions } from "vite";

/**
 * Options for {@link clientConditions}.
 */
export interface IClientConditionsOptions {
    /**
     * Add the `source` condition, so workspace libs that publish a `source` export resolve to their
     * TS source. Dev only: production builds must use the published artifacts.
     */
    source: boolean;
}

/**
 * `resolve.conditions` for a browser build. The option REPLACES Vite's defaults rather than extending
 * them (Vite 8's mergeWithDefaultsRecursively assigns arrays directly), so the defaults are spread in
 * to keep `browser` / `module` / dev-prod resolution. Without `browser`, packages like
 * react-textarea-autosize fall through to their node-targeted default export.
 */
export function clientConditions({ source }: IClientConditionsOptions): string[] {
    return [...defaultClientConditions, ...(source ? ["source"] : [])];
}
