// (C) 2025-2026 GoodData Corporation

import { type AxiosInstance } from "axios";

/**
 * Basic representation of a MapLibre style document returned by Tiger.
 */
export type LocationStyleDocument = Record<string, unknown>;

/**
 * An item in the list of available map styles returned by the styles endpoint.
 */
export interface ILocationStyleListItem {
    /**
     * Unique style identifier (e.g. `standard-light`, `satellite`).
     */
    id: string;

    /**
     * Human-readable title (e.g. `Standard (Light)`).
     */
    title: string;

    /**
     * URL to fetch the full MapLibre style document for this style.
     */
    link: string;
}

/**
 * Query parameters for the location style endpoint.
 */
export interface ILocationStyleParams {
    /**
     * Two-letter ISO 639-1 language code (e.g. `en`, `de`, `fr`).
     * When provided, map labels are returned in the requested language.
     */
    language?: string;
}

/**
 * Interface describing available operations for location service style endpoints.
 */
export type LocationStyleApiInterface = {
    /**
     * Loads the default MapLibre style document (no specific basemap selected).
     */
    getDefaultStyle(params?: ILocationStyleParams): Promise<LocationStyleDocument>;

    /**
     * Lists all available map styles.
     */
    getStyles(): Promise<ILocationStyleListItem[]>;

    /**
     * Loads the MapLibre style document for a specific style.
     *
     * @param styleId - Style identifier (e.g. `standard-light`).
     * @param params - Optional query parameters.
     */
    getStyleById(styleId: string, params?: ILocationStyleParams): Promise<LocationStyleDocument>;
};

/**
 * Factory producing a typed client for interacting with the location style endpoints.
 */
export const tigerLocationStyleClientFactory = (axios: AxiosInstance): LocationStyleApiInterface => {
    return {
        getDefaultStyle: async (params?) => LocationStyleApi_GetDefaultStyle(axios, params),
        getStyles: async () => LocationStyleApi_GetStyles(axios),
        getStyleById: async (styleId, params?) => LocationStyleApi_GetStyleById(axios, styleId, params),
    };
};

/**
 * Low-level request that retrieves the default MapLibre style configuration.
 */
export async function LocationStyleApi_GetDefaultStyle(
    axios: AxiosInstance,
    params?: ILocationStyleParams,
): Promise<LocationStyleDocument> {
    const queryParams = {
        ...(params?.language === undefined ? {} : { language: params.language }),
    };

    const response = await axios.get<LocationStyleDocument>("/api/v1/location/style", {
        params: queryParams,
    });
    return response.data;
}

/**
 * Low-level request that lists all available map styles.
 */
export async function LocationStyleApi_GetStyles(axios: AxiosInstance): Promise<ILocationStyleListItem[]> {
    const response = await axios.get<ILocationStyleListItem[]>("/api/v1/location/styles");
    return response.data;
}

/**
 * Low-level request that retrieves the MapLibre style for a specific style ID.
 */
export async function LocationStyleApi_GetStyleById(
    axios: AxiosInstance,
    styleId: string,
    params?: ILocationStyleParams,
): Promise<LocationStyleDocument> {
    const queryParams = {
        ...(params?.language === undefined ? {} : { language: params.language }),
    };

    const response = await axios.get<LocationStyleDocument>(
        `/api/v1/location/styles/${encodeURIComponent(styleId)}`,
        { params: queryParams },
    );
    return response.data;
}
