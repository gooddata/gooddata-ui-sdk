// (C) 2024-2026 GoodData Corporation

import {
    type IAutomationMetadataObjectDefinition,
    type IExportDefinitionVisualizationObjectContent,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";

export const useScheduleValidation = (schedule: IAutomationMetadataObjectDefinition) => {
    const { widgetExistsByRef } = useAutomationsContext();

    const isDashboardSchedule = schedule.exportDefinitions?.some((exportDefinition) =>
        isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
    );
    const widgetLocalId = (
        schedule.exportDefinitions?.find((exportDefinition) =>
            isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload),
        )?.requestPayload.content as IExportDefinitionVisualizationObjectContent
    )?.widget;
    const widgetRef = widgetLocalId ? { identifier: widgetLocalId } : undefined;

    // Schedules created via API may not reference any widget — that's acceptable.
    // We only flag an error when a widget was explicitly referenced but no longer exists on the dashboard.
    const hasUnresolvableWidgetRef = !!widgetRef && !widgetExistsByRef(widgetRef);

    const isValid = isDashboardSchedule || !hasUnresolvableWidgetRef;

    return {
        isValid,
    };
};
