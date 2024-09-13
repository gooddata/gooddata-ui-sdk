// (C) 2024 GoodData Corporation

import {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IAutomationRecipient,
    IExportDefinitionMetadataObject,
    IExportDefinitionMetadataObjectDefinition,
    IFilter,
    isAbsoluteDateFilter,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
    isFilter,
    isFilterContextItem,
    isObjRef,
    isRelativeDateFilter,
    IUser,
} from "@gooddata/sdk-model";
import omit from "lodash/omit.js";
import isEqual from "lodash/isEqual.js";
import pick from "lodash/pick.js";
import { ExtendedDashboardWidget } from "../../../../model/index.js";
import { filterContextItemsToDashboardFiltersByWidget } from "../../../../converters/index.js";

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

type ExportDefinitionSubset = Pick<IExportDefinitionMetadataObjectDefinition, "requestPayload" | "title">;

const sortByFormat = (a: ExportDefinitionSubset, b: ExportDefinitionSubset) =>
    a.requestPayload.format > b.requestPayload.format ? 1 : -1;

export const areAutomationsEqual = (
    automation: IAutomationMetadataObjectDefinition,
    originalAutomation: IAutomationMetadataObjectDefinition,
) => {
    const automationWithoutExportDefinitions = omit(automation, "exportDefinitions");
    const origAutomationWithoutExportDefinitions = omit(originalAutomation, "exportDefinitions");

    // We only want to compare requestPayload and title of exportDefinitions, rest may be omitted as it is just arbitrary
    // metadata that is not relevant for the comparison and causes false positive results when comparing new and old def.
    // Sorting is done just to avoid false positive result of different order of export definitions.
    const automationExportDefinitions = automation.exportDefinitions
        ?.map((exportDefinition) => pick(exportDefinition, ["requestPayload", "title"]))
        .sort(sortByFormat);
    const origAutomationExportDefinitions = originalAutomation.exportDefinitions
        ?.map((exportDefinition) => pick(exportDefinition, ["requestPayload", "title"]))
        .sort(sortByFormat);

    return (
        isEqual(automationWithoutExportDefinitions, origAutomationWithoutExportDefinitions) &&
        isEqual(automationExportDefinitions, origAutomationExportDefinitions)
    );
};

export const transformFilterContextToModelFilters = (
    filters: FilterContextItem[] | undefined,
    widget: ExtendedDashboardWidget,
): IFilter[] => {
    if (!filters) {
        return [];
    }

    const transformedFilters = filterContextItemsToDashboardFiltersByWidget(filters, widget);

    /**
     * When widget has no date dimension available, common date filter gets empty date data set.
     * In this case, we rather filter it out and keep all other filters.
     */
    return transformedFilters.filter((filter) => {
        if (isRelativeDateFilter(filter)) {
            return isObjRef(filter.relativeDateFilter.dataSet);
        } else if (isAbsoluteDateFilter(filter)) {
            return isObjRef(filter.absoluteDateFilter.dataSet);
        }

        return filter;
    });
};

export const convertUserToAutomationRecipient = (user: IUser): IAutomationRecipient => {
    return {
        id: user.login,
        email: user.email,
        name: user.fullName,
        type: "user",
    };
};
