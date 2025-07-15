// (C) 2024-2025 GoodData Corporation

import {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IAutomationRecipient,
    IExportDefinitionDashboardRequestPayload,
    IExportDefinitionMetadataObject,
    IExportDefinitionMetadataObjectDefinition,
    IExportDefinitionVisualizationObjectRequestPayload,
    IFilter,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
    isFilter,
    isFilterContextItem,
    IUser,
    IWorkspaceUser,
} from "@gooddata/sdk-model";
import omit from "lodash/omit.js";
import isEqual from "lodash/isEqual.js";
import pick from "lodash/pick.js";

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

    return (
        automation.exportDefinitions?.find((exportDefinition) => {
            return isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload);
        })?.requestPayload as IExportDefinitionDashboardRequestPayload
    )?.content.filters?.filter((f) => isFilterContextItem(f));
};

export const getAutomationVisualizationFilters = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
): { executionFilters: IFilter[] | undefined; filterContextItems: FilterContextItem[] | undefined } => {
    if (!automation) {
        return { executionFilters: undefined, filterContextItems: undefined };
    }

    const executionFilters = (
        automation.exportDefinitions?.find((exportDefinition) => {
            return isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload);
        })?.requestPayload as IExportDefinitionVisualizationObjectRequestPayload
    )?.content.filters?.filter((f) => isFilter(f)) as IFilter[] | undefined;

    const filterContextItems = (
        automation.exportDefinitions?.find((exportDefinition) => {
            return isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload);
        })?.requestPayload as IExportDefinitionVisualizationObjectRequestPayload
    )?.content.filters?.filter((f) => isFilterContextItem(f)) as FilterContextItem[] | undefined;

    return {
        executionFilters: (executionFilters ?? []).length > 0 ? executionFilters : undefined,
        filterContextItems: (filterContextItems ?? []).length > 0 ? filterContextItems : undefined,
    };
};

export const getAutomationAlertFilters = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
): IFilter[] | undefined => {
    if (!automation) {
        return undefined;
    }

    return automation.alert?.execution?.filters?.filter(isFilter);
};

type ExportDefinitionSubset = Pick<IExportDefinitionMetadataObjectDefinition, "requestPayload" | "title">;

const sortByFormat = (a: ExportDefinitionSubset, b: ExportDefinitionSubset) =>
    a.requestPayload.format > b.requestPayload.format ? 1 : -1;

export const areAutomationsEqual = (
    originalAutomation: IAutomationMetadataObjectDefinition,
    updatedAutomation: IAutomationMetadataObjectDefinition,
) => {
    const automationWithoutExportDefinitions = omit(updatedAutomation, "exportDefinitions");
    const origAutomationWithoutExportDefinitions = omit(originalAutomation, "exportDefinitions");

    // We only want to compare requestPayload and title of exportDefinitions, rest may be omitted as it is just arbitrary
    // metadata that is not relevant for the comparison and causes false positive results when comparing new and old def.
    // Sorting is done just to avoid false positive result of different order of export definitions.
    const automationExportDefinitions = updatedAutomation.exportDefinitions
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

export const convertCurrentUserToAutomationRecipient = (
    users: IWorkspaceUser[],
    user: IUser,
): IAutomationRecipient => {
    const foundUser = users.find((u) => u.login === user.login);

    return convertUserToAutomationRecipient(foundUser ?? user);
};

export const convertCurrentUserToWorkspaceUser = (users: IWorkspaceUser[], user: IUser): IWorkspaceUser => {
    const foundUser = users.find((u) => u.login === user.login);

    return (
        foundUser ?? {
            email: user.email ?? "",
            fullName: user.fullName,
            status: "ENABLED",
            login: user.login,
            lastName: user.lastName,
            firstName: user.firstName,
            uri: user.login,
            ref: user.ref,
        }
    );
};

export const convertUserToAutomationRecipient = (user: IUser): IAutomationRecipient => {
    return {
        id: user.login,
        email: user.email,
        name: user.fullName,
        type: "user",
    };
};

export const convertExternalRecipientToAutomationRecipient = (
    externalRecipient: string,
): IAutomationRecipient => {
    return {
        id: externalRecipient,
        email: externalRecipient,
        name: externalRecipient,
        type: "externalUser",
    };
};
