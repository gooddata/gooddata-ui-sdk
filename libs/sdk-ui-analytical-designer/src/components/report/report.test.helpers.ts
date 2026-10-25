// (C) 2019-2026 GoodData Corporation

import { type IVisualizationClass } from "@gooddata/sdk-model";

export const EMPTY_TITLE = "empty_title";

// Visualization classes
export const dummyTableVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        url: "local:table",
        icon: "",
        iconSelected: "",
        checksum: "",
        identifier: "id",
        title: EMPTY_TITLE,
        orderIndex: 1,
        uri: "/some/uri",
    },
};
