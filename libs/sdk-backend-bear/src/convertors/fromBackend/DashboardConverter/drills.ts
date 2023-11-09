// (C) 2019-2023 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import {
    DrillFromType,
    IDrillDefinition,
    IWrappedKPI,
    isDrillFromAttribute,
    isDrillFromMeasure,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToVisualization,
} from "@gooddata/api-model-bear";

import {
    uriRef,
    idRef,
    DrillOrigin,
    IDrillToLegacyDashboard,
    InsightDrillDefinition,
} from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

export const generateDrillLocalIdentifier = () => uuidv4().replace(/-/g, "");

/**
 * @internal
 */
export const convertKpiDrill = (kpi: IWrappedKPI): IDrillToLegacyDashboard => {
    const { drillTo: { projectDashboard, projectDashboardTab } = {}, metric } = kpi.kpi.content;

    return {
        type: "drillToLegacyDashboard",
        origin: {
            type: "drillFromMeasure",
            measure: uriRef(metric),
        },
        target: uriRef(projectDashboard!),
        tab: projectDashboardTab!,
        transition: "in-place",
    };
};

/**
 * @internal
 */
export const convertDrillOrigin = (from: DrillFromType): DrillOrigin => {
    if (isDrillFromMeasure(from)) {
        return {
            type: "drillFromMeasure",
            measure: from.drillFromMeasure,
        };
    } else if (isDrillFromAttribute(from)) {
        return {
            type: "drillFromAttribute",
            attribute: from.drillFromAttribute,
        };
    } else {
        throw new UnexpectedError("Unable to convert unknown drill origin!");
    }
};

/**
 * @internal
 */
export const convertVisualizationWidgetDrill = (drill: IDrillDefinition): InsightDrillDefinition => {
    const localIdentifier = generateDrillLocalIdentifier();
    if (isDrillToDashboard(drill)) {
        const {
            drillToDashboard: { toDashboard, target, from },
        } = drill;
        return {
            localIdentifier,
            type: "drillToDashboard",
            origin: convertDrillOrigin(from),
            target: toDashboard !== undefined ? idRef(toDashboard) : undefined,
            transition: target,
        };
    } else if (isDrillToVisualization(drill)) {
        const {
            drillToVisualization: { toVisualization, target, from },
        } = drill;
        return {
            localIdentifier,
            type: "drillToInsight",
            origin: convertDrillOrigin(from),
            target: uriRef(toVisualization.uri),
            transition: target,
        };
    } else if (isDrillToCustomUrl(drill)) {
        const {
            drillToCustomUrl: { target, customUrl, from },
        } = drill;
        return {
            localIdentifier,
            type: "drillToCustomUrl",
            origin: convertDrillOrigin(from),
            target: {
                url: customUrl,
            },
            transition: target,
        };
    } else if (isDrillToAttributeUrl(drill)) {
        const {
            drillToAttributeUrl: { drillToAttributeDisplayForm, insightAttributeDisplayForm, target, from },
        } = drill;
        return {
            localIdentifier,
            type: "drillToAttributeUrl",
            origin: convertDrillOrigin(from),
            target: {
                displayForm: uriRef(insightAttributeDisplayForm.uri),
                hyperlinkDisplayForm: uriRef(drillToAttributeDisplayForm.uri),
            },
            transition: target,
        };
    }

    throw new UnexpectedError("Unable to convert unknown drill!");
};
