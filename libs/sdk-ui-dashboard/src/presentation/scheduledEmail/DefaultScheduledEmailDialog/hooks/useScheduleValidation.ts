// (C) 2024 GoodData Corporation

import {
    IAutomationMetadataObjectDefinition,
    IExportDefinitionVisualizationObjectContent,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";
import { selectWidgetByRef, useDashboardSelector } from "../../../../model/index.js";

export const useScheduleValidation = (schedule: IAutomationMetadataObjectDefinition) => {
    const isDashboardSchedule = schedule.exportDefinitions?.some((exportDefinition) =>
        isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
    );
    const widgetLocalId = (
        schedule.exportDefinitions?.find((exportDefinition) =>
            isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload),
        )?.requestPayload.content as IExportDefinitionVisualizationObjectContent
    )?.widget;
    const widgetRef = widgetLocalId ? { identifier: widgetLocalId } : undefined;
    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));

    const isValid = isDashboardSchedule || !!widget;

    return {
        isValid,
    };
};
