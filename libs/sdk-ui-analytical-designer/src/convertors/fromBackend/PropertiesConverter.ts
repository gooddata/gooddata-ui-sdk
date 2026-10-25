// (C) 2019-2026 GoodData Corporation

import stringify from "json-stable-stringify";

import { type VisualizationProperties } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const serializeProperties = (properties: VisualizationProperties): string => stringify(properties);

/**
 * @internal
 */
export const deserializeProperties = (properties: string | undefined): VisualizationProperties => {
    try {
        return properties ? JSON.parse(properties) : {};
    } catch {
        console.error(`Error parsing properties: "${properties}"`);
        return {};
    }
};
