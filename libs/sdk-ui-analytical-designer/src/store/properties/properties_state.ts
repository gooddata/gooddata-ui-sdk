// (C) 2026 GoodData Corporation

import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";

export type IPropertiesState = IVisualizationProperties;

export const propertiesInitialState: IPropertiesState = {
    controls: {},
    sortItems: [],
};
