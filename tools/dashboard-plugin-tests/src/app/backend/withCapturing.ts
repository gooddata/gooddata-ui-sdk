// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withEventing } from "@gooddata/sdk-backend-base";
import {
    captureDashboard,
    captureDisplayForm,
    captureElementsQuery,
    captureExecutionDefinition,
    captureExecutionDefinitionReadAll,
    captureExecutionDefinitionWindow,
    captureInsight,
    initializeCapturedData,
} from "../../capturing";

export function withCapturing(backend: IAnalyticalBackend): IAnalyticalBackend {
    initializeCapturedData();

    return withEventing(backend, {
        beforeExecute: (def, executionId) => {
            captureExecutionDefinition(def, executionId);
        },
        successfulResultReadWindow: (offset, size, _dataView, executionId) => {
            captureExecutionDefinitionWindow(offset, size, executionId);
        },
        successfulResultReadAll: (_dataView, executionId) => {
            captureExecutionDefinitionReadAll(executionId);
        },
        attributes: {
            attributeDisplayFormSuccess: (df) => {
                captureDisplayForm(df);
            },
        },
        elements: {
            displayFormElementsQuery: (options) => {
                captureElementsQuery(options);
            },
        },
        dashboards: {
            dashboardWithReferencedObjectsSuccess: (dashboardReferences) => {
                dashboardReferences.insights.forEach((i) => captureInsight(i.insight.identifier));
            },
            dashboardWithReferencesSuccess: (dashboardWithReferences) => {
                captureDashboard(dashboardWithReferences.dashboard.identifier);
                dashboardWithReferences.references.insights.forEach((i) =>
                    captureInsight(i.insight.identifier),
                );
            },
        },
    });
}
