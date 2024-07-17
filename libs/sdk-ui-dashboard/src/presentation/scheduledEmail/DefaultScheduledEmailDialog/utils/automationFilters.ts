// (C) 2024 GoodData Corporation

import {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IFilter,
    isExportDefinitionDashboardContent,
    isExportDefinitionVisualizationObjectContent,
    isFilter,
    isFilterContextItem,
} from "@gooddata/sdk-model";

export const isDashboardAutomation = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
) => {
    if (!automation) {
        return false;
    }

    return automation.exportDefinitions?.some((exportDefinition) => {
        return isExportDefinitionDashboardContent(exportDefinition.requestPayload.content);
    });
};

export const isVisualisationAutomation = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
) => {
    if (!automation) {
        return false;
    }

    return automation?.exportDefinitions?.some((exportDefinition) => {
        return isExportDefinitionVisualizationObjectContent(exportDefinition.requestPayload.content);
    });
};

export const getAutomationDashboardFilters = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
): FilterContextItem[] | undefined => {
    if (!automation) {
        return undefined;
    }

    return automation.exportDefinitions
        ?.find((exportDefinition) => {
            return isExportDefinitionDashboardContent(exportDefinition.requestPayload.content);
        })
        ?.requestPayload?.content.filters?.filter(isFilterContextItem);
};

export const getAutomationVisualizationFilters = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
): IFilter[] | undefined => {
    if (!automation) {
        return undefined;
    }

    return automation.exportDefinitions
        ?.find((exportDefinition) => {
            return isExportDefinitionVisualizationObjectContent(exportDefinition.requestPayload.content);
        })
        ?.requestPayload?.content.filters?.filter(isFilter);
};
