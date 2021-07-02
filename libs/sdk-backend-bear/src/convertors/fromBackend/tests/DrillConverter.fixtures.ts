// (C) 2021 GoodData Corporation

import { GdcVisualizationWidget } from "@gooddata/api-model-bear";
import { localIdRef } from "@gooddata/sdk-model";

export const drillFromMeasure: GdcVisualizationWidget.IDrillFromMeasure = {
    drillFromMeasure: localIdRef("measureLocalIdentifier"),
};

export const drillFromAttribute: GdcVisualizationWidget.IDrillFromAttribute = {
    drillFromAttribute: localIdRef("attributeLocalIdentifier"),
};

export const drillToDashboardWithDrillFromMeasure: GdcVisualizationWidget.IDrillToDashboard = {
    drillToDashboard: {
        target: "in-place",
        from: {
            drillFromMeasure: localIdRef("measureLocalIdentifier"),
        },
        toDashboard: "dashboardId",
    },
};

export const drillToDashboardWithDrillFromAttribute: GdcVisualizationWidget.IDrillToDashboard = {
    drillToDashboard: {
        target: "in-place",
        from: {
            drillFromAttribute: localIdRef("attributeLocalIdentifier"),
        },
        toDashboard: "dashboardId",
    },
};
