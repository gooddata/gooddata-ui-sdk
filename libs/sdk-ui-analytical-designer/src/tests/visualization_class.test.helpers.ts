// (C) 2026 GoodData Corporation

import { type IVisualizationClass } from "@gooddata/sdk-model";

/**
 * A COMPLETE `IVisualizationClass` for fixtures that only care about the `url` — the shape the API
 * loader actually stores, named once here rather than approximated per fixture.
 */
export const visualizationClassMock = (url: string, uri: string = url): IVisualizationClass => ({
    visualizationClass: {
        identifier: url,
        uri,
        title: url,
        icon: "",
        iconSelected: "",
        checksum: "",
        url,
    },
});
