// (C) 2024 GoodData Corporation

import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    isExportDefinitionDashboardContent,
    isFilterContextItem,
} from "@gooddata/sdk-model";

export const getAutomationDashboardFilters = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
) => {
    if (!automation) {
        return undefined;
    }

    return automation.exportDefinitions
        ?.find((exportDefinition) => {
            return isExportDefinitionDashboardContent(exportDefinition.requestPayload.content);
        })
        ?.requestPayload?.content.filters?.filter(isFilterContextItem);
};
