// (C) 2025 GoodData Corporation

import { IGeoService, IGeoStyleSpecification } from "@gooddata/sdk-backend-spi";

const DEFAULT_GEO_STYLE: IGeoStyleSpecification = {
    version: 8,
    name: "mockingbird-default",
    sources: {},
    layers: [],
};

export function createMockGeoService(style?: IGeoStyleSpecification): IGeoService {
    const resolvedStyle = style ?? DEFAULT_GEO_STYLE;

    return {
        getDefaultStyle: async () => resolvedStyle,
    };
}
