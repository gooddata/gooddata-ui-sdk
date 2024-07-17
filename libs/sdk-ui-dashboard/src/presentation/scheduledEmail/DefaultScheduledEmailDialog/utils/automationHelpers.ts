// (C) 2024 GoodData Corporation

import {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IExportDefinitionMetadataObject,
    IExportDefinitionMetadataObjectDefinition,
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

    return automation.exportDefinitions?.some((exportDefinition) => {
        return isExportDefinitionVisualizationObjectContent(exportDefinition.requestPayload.content);
    });
};

export const isCsvVisualizationAutomation = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
) => {
    if (!automation) {
        return false;
    }

    return automation.exportDefinitions?.some(isCsvVisualizationExportDefinition);
};

export const isCsvVisualizationExportDefinition = (
    exportDefinition: IExportDefinitionMetadataObject | IExportDefinitionMetadataObjectDefinition | undefined,
) => {
    if (!exportDefinition) {
        return false;
    }

    return (
        isExportDefinitionVisualizationObjectContent(exportDefinition.requestPayload.content) &&
        exportDefinition.requestPayload.format === "CSV"
    );
};

export const isXlsxVisualizationAutomation = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
) => {
    if (!automation) {
        return false;
    }

    return automation.exportDefinitions?.some(isXlsxVisualizationExportDefinition);
};

export const isXlsxVisualizationExportDefinition = (
    exportDefinition: IExportDefinitionMetadataObject | IExportDefinitionMetadataObjectDefinition | undefined,
) => {
    if (!exportDefinition) {
        return false;
    }

    return (
        isExportDefinitionVisualizationObjectContent(exportDefinition.requestPayload.content) &&
        exportDefinition.requestPayload.format === "XLSX"
    );
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
