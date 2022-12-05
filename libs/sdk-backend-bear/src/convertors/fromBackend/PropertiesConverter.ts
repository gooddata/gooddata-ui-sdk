// (C) 2019-2022 GoodData Corporation
import stringify from "json-stable-stringify";
import { VisualizationProperties } from "@gooddata/sdk-model";

export const serializeProperties = (properties: VisualizationProperties): string => stringify(properties);
export const deserializeProperties = (properties: string | undefined): VisualizationProperties => {
    try {
        return properties ? JSON.parse(properties) : {};
    } catch {
        console.error(`Error parsing properties: "${properties}"`);
        return {};
    }
};
