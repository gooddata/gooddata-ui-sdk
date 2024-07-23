// (C) 2024 GoodData Corporation

import {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IExportDefinitionMetadataObject,
    IExportDefinitionMetadataObjectDefinition,
    IFilter,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
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
        return isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload);
    });
};

export const isVisualisationAutomation = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
) => {
    if (!automation) {
        return false;
    }

    return automation.exportDefinitions?.some((exportDefinition) => {
        return isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload);
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
        isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload) &&
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
        isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload) &&
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
            return isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload);
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
            return isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload);
        })
        ?.requestPayload?.content.filters?.filter(isFilter);
};
