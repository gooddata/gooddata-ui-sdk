// (C) 2025-2026 GoodData Corporation

import { type IGeoService, type IGeoStyleSpecification } from "@gooddata/sdk-backend-spi";

const DEFAULT_GEO_STYLE: IGeoStyleSpecification = {
    version: 8,
    name: "mockingbird-default",
    sources: {},
    layers: [],
};

export function createMockGeoService(style?: IGeoStyleSpecification): IGeoService {
    const resolvedStyle = style ?? DEFAULT_GEO_STYLE;

    return {
        getDefaultStyle: async () => Promise.resolve(resolvedStyle),
        getDefaultStyleSpriteIcons: async () => Promise.resolve([]),
        getStyles: async () => Promise.resolve([]),
        getStyleById: async () => Promise.resolve(resolvedStyle),
        collections: () => ({
            getAll: () => Promise.resolve([]),
            getGeoCollection: () => Promise.resolve(undefined),
            createGeoCollection: (definition) =>
                Promise.resolve({ id: "mock_geo_collection", ...definition }),
            updateGeoCollection: (geoCollection) => Promise.resolve({ ...geoCollection }),
            deleteGeoCollection: () => Promise.resolve(),
            uploadGeoCollectionFile: () => Promise.resolve({ location: "mock-upload-location" }),
            convertGeoCollectionFile: () => Promise.resolve({ location: "mock-convert-location" }),
            importGeoCollectionFile: () => Promise.resolve(),
        }),
    };
}
