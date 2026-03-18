// (C) 2025-2026 GoodData Corporation

import { type AxiosInstance } from "axios";

/**
 * Basic representation of a MapLibre style document returned by Tiger.
 */
export type LocationStyleDocument = Record<string, unknown>;

/**
 * Query parameters for the location style endpoint.
 */
export interface ILocationStyleParams {
    /**
     * Basemap identifier. Valid values: `standard`, `satellite`, `monochrome`, `hybrid`, `none`.
     */
    basemap?: string;

    /**
     * Color scheme. Valid values: `light`, `dark`. Ignored for `satellite` and `none` basemaps.
     */
    colorScheme?: string;

    /**
     * Two-letter ISO 639-1 language code (e.g. `en`, `de`, `fr`).
     * When provided, map labels are returned in the requested language.
     */
    language?: string;
}

/**
 * Interface describing available operations for location service style endpoint.
 */
export type LocationStyleApiInterface = {
    /**
     * Loads the MapLibre style document for the given basemap and color scheme.
     */
    getDefaultStyle(params?: ILocationStyleParams): Promise<LocationStyleDocument>;
};

/**
 * Factory producing a typed client for interacting with the location style endpoint.
 */
export const tigerLocationStyleClientFactory = (axios: AxiosInstance): LocationStyleApiInterface => {
    return {
        getDefaultStyle: async (params?) => LocationStyleApi_GetDefaultStyle(axios, params),
    };
};

/**
 * Low-level request that retrieves the MapLibre style configuration.
 *
 * @remarks
 * Passes `basemap` and `colorScheme` as query parameters when provided.
 */
export async function LocationStyleApi_GetDefaultStyle(
    axios: AxiosInstance,
    params?: ILocationStyleParams,
): Promise<LocationStyleDocument> {
    const queryParams = {
        ...(params?.basemap === undefined ? {} : { basemap: params.basemap }),
        ...(params?.colorScheme === undefined ? {} : { colorScheme: params.colorScheme }),
        ...(params?.language === undefined ? {} : { language: params.language }),
    };

    const response = await axios.get<LocationStyleDocument>("/api/v1/location/style", {
        params: queryParams,
    });
    return response.data;
}
