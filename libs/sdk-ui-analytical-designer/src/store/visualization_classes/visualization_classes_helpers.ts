// (C) 2026 GoodData Corporation

import { type IVisualizationClass, visClassUrl } from "@gooddata/sdk-model";

import { LOCAL_COLUMN, LOCAL_TABLE } from "../../constants/visualization_types.js";

export function getDefaultVisualizationClass(
    classes: ReadonlyArray<IVisualizationClass>,
): IVisualizationClass | undefined {
    const column = classes.find((visualizationClass) => visClassUrl(visualizationClass) === LOCAL_COLUMN);
    const table = classes.find((visualizationClass) => visClassUrl(visualizationClass) === LOCAL_TABLE);

    return table || column || classes[0];
}
