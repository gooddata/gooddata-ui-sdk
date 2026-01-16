// (C) 2025-2026 GoodData Corporation

import { type AxiosInstance } from "axios";

/**
 * Basic representation of a MapLibre style document returned by Tiger.
 */
export type LocationStyleDocument = Record<string, unknown>;

/**
 * Interface describing available operations for location service style endpoint.
 */
export type LocationStyleApiInterface = {
    /**
     * Loads the default MapLibre style document configured for the organization.
     */
    getDefaultStyle(): Promise<LocationStyleDocument>;
};

/**
 * Factory producing a typed client for interacting with the location style endpoint.
 */
export const tigerLocationStyleClientFactory = (axios: AxiosInstance): LocationStyleApiInterface => {
    return {
        getDefaultStyle: async () => LocationStyleApi_GetDefaultStyle(axios),
    };
};

/**
 * Low-level request that retrieves the current MapLibre style configuration.
 */
export async function LocationStyleApi_GetDefaultStyle(axios: AxiosInstance): Promise<LocationStyleDocument> {
    const response = await axios.get<LocationStyleDocument>("/api/v1/location/style");
    return response.data;
}
