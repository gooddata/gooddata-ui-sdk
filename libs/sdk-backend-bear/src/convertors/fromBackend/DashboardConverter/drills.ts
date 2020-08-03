// (C) 2019-2020 GoodData Corporation

import { GdcVisualizationWidget, GdcKpi } from "@gooddata/api-model-bear";
import { uriRef, idRef, localIdRef } from "@gooddata/sdk-model";
import {
    IDrillToLegacyDashboard,
    DrillDefinition,
    IDrillToDashboard,
    IDrillToInsight,
    IDrillToCustomUrl,
    IDrillToAttributeUrl,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";

export const convertKpiDrill = (kpi: GdcKpi.IWrappedKPI): IDrillToLegacyDashboard => {
    const { drillTo: { projectDashboard, projectDashboardTab } = {}, metric } = kpi.kpi.content;

    const drillDefinition: IDrillToLegacyDashboard = {
        type: "drillToLegacyDashboard",
        origin: {
            type: "drillFromMeasure",
            measure: uriRef(metric),
        },
        target: uriRef(projectDashboard!),
        tab: projectDashboardTab!,
        transition: "in-place",
    };

    return drillDefinition;
};

export const convertVisualizationWidgetDrill = (
    drill: GdcVisualizationWidget.IDrillDefinition,
): DrillDefinition => {
    if (GdcVisualizationWidget.isDrillToDashboard(drill)) {
        const {
            drillToDashboard: {
                toDashboard,
                target,
                from: {
                    drillFromMeasure: { localIdentifier },
                },
            },
        } = drill;

        const drillDefinition: IDrillToDashboard = {
            type: "drillToDashboard",
            origin: { type: "drillFromMeasure", measure: localIdRef(localIdentifier) },
            target: idRef(toDashboard),
            transition: target,
        };
        return drillDefinition;
    } else if (GdcVisualizationWidget.isDrillToVisualization(drill)) {
        const {
            drillToVisualization: {
                toVisualization,
                target,
                from: {
                    drillFromMeasure: { localIdentifier },
                },
            },
        } = drill;
        const drillDefinition: IDrillToInsight = {
            type: "drillToInsight",
            origin: { type: "drillFromMeasure", measure: localIdRef(localIdentifier) },
            target: toVisualization,
            transition: target,
        };

        return drillDefinition;
    } else if (GdcVisualizationWidget.isDrillToCustomUrl(drill)) {
        const {
            drillToCustomUrl: {
                target,
                customUrl,
                from: {
                    drillFromMeasure: { localIdentifier },
                },
            },
        } = drill;
        const drillDefinition: IDrillToCustomUrl = {
            type: "drillToCustomUrl",
            origin: { type: "drillFromMeasure", measure: localIdRef(localIdentifier) },
            target: {
                url: customUrl,
            },
            transition: target,
        };

        return drillDefinition;
    } else if (GdcVisualizationWidget.isDrillToAttributeUrl(drill)) {
        const {
            drillToAttributeUrl: {
                drillToAttributeDisplayForm,
                insightAttributeDisplayForm,
                target,
                from: {
                    drillFromMeasure: { localIdentifier },
                },
            },
        } = drill;

        const drillDefinition: IDrillToAttributeUrl = {
            type: "drillToAttributeUrl",
            origin: { type: "drillFromMeasure", measure: localIdRef(localIdentifier) },
            target: {
                displayForm: insightAttributeDisplayForm,
                hyperlinkDisplayForm: drillToAttributeDisplayForm,
            },
            transition: target,
        };

        return drillDefinition;
    }

    throw new UnexpectedError("Unable to convert unknown drill!");
};
