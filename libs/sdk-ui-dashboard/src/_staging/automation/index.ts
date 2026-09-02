// (C) 2024-2026 GoodData Corporation

import { isEqual, omit, pick } from "lodash-es";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
    type IDashboardExportParameter,
    type IExportDefinitionDashboardRequestPayload,
    type IExportDefinitionMetadataObject,
    type IExportDefinitionMetadataObjectDefinition,
    type IExportDefinitionVisualizationObjectRequestPayload,
    type IFilter,
    type IInsightParameterValue,
    type IParameterDefinition,
    type IUser,
    type IWorkspaceUser,
    type ParameterType,
    type ParameterValue,
    assertNever,
    idRef,
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

/**
 * The timezone baked into an automation at creation time, when it could not be derived at run
 * time. Alerts store it in the alert execution config, schedules in their export definitions —
 * all of which carry the same value. Undefined means the dashboard/workspace timezone applies.
 */
export const getAutomationTimezone = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
): string | undefined =>
    automation?.alert?.execution?.executionConfig?.timezone ??
    automation?.exportDefinitions?.[0]?.requestPayload.timezoneId;

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

/**
 * Extracts dashboard filters structured by tab from automation metadata object.
 * Returns filtersByTab from the first dashboard export definition.
 */
export const getAutomationDashboardFiltersByTab = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
): Record<string, FilterContextItem[]> | undefined => {
    if (!automation) {
        return undefined;
    }

    return (
        automation.exportDefinitions?.find((exportDefinition) => {
            return isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload);
        })?.requestPayload as IExportDefinitionDashboardRequestPayload
    )?.content.filtersByTab;
};

/**
 * Extracts the per-tab parameter overrides from automation metadata. All export definitions carry
 * the same `content.parametersByTab`, so the first dashboard or visualization-object definition
 * that has them wins.
 */
export const getAutomationExportParametersByTab = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
): Record<string, IDashboardExportParameter[]> | undefined => {
    return automation?.exportDefinitions
        ?.map((exportDefinition) => exportDefinition.requestPayload)
        .find(
            (requestPayload) =>
                (isExportDefinitionDashboardRequestPayload(requestPayload) ||
                    isExportDefinitionVisualizationObjectRequestPayload(requestPayload)) &&
                !!requestPayload.content.parametersByTab,
        )?.content.parametersByTab;
};

/**
 * Returns a copy of the automation with `content.parametersByTab` replaced on every dashboard and
 * visualization-object export definition. Passing `undefined` clears the field (the store-filters
 * off path). No-op when the automation carries no export definitions. Write-side counterpart of
 * {@link getAutomationExportParametersByTab}.
 */
export function setExportParametersByTab(
    automation: IAutomationMetadataObjectDefinition,
    parametersByTab: Record<string, IDashboardExportParameter[]> | undefined,
): IAutomationMetadataObjectDefinition {
    if (!automation.exportDefinitions?.length) {
        return automation;
    }
    return {
        ...automation,
        exportDefinitions: automation.exportDefinitions.map((exportDefinition) => {
            const { requestPayload } = exportDefinition;
            // Both branches are identical on purpose: narrowing to one variant keeps `content`'s exact type.
            // Spreading the raw union widens `dashboard` to `string | undefined`, matching neither.
            if (isExportDefinitionDashboardRequestPayload(requestPayload)) {
                return {
                    ...exportDefinition,
                    requestPayload: {
                        ...requestPayload,
                        content: { ...requestPayload.content, parametersByTab },
                    },
                };
            }
            if (isExportDefinitionVisualizationObjectRequestPayload(requestPayload)) {
                return {
                    ...exportDefinition,
                    requestPayload: {
                        ...requestPayload,
                        content: { ...requestPayload.content, parametersByTab },
                    },
                };
            }
            return exportDefinition;
        }),
    };
}

/**
 * Converts stored export parameter overrides ({@link IDashboardExportParameter}, value carried as a
 * string) to {@link IInsightParameterValue} runtime values. Each row carries its own type tag:
 * NUMBER values are parsed (non-finite ones dropped), STRING values stay strings. STRING rows are
 * dropped while `enableStringParameters` is off (a row persisted before the flag was turned off).
 * Untagged rows predate the tag and are decoded as NUMBER; rows tagged with a type this version
 * does not know (persisted by a newer one) are dropped.
 */
export function exportParametersToValues(
    stored: IDashboardExportParameter[],
    isStringParametersEnabled: boolean,
): IInsightParameterValue[] {
    return stored.reduce<IInsightParameterValue[]>((acc, row) => {
        // Untagged rows predate the tag — a wire-format rule, so the default lives at this call site
        const tag = row.parameterType ?? "NUMBER";
        if (tag === "STRING" && !isStringParametersEnabled) {
            return acc;
        }
        const value = decodeParameterValue(tag, row.value);
        if (value !== undefined) {
            acc.push({ ref: idRef(row.id, "parameter"), value });
        }
        return acc;
    }, []);
}

/**
 * The single core of parameter value decoding: coerces `value` to the type named by `tag`, or
 * fails with `undefined` — for a non-numeric value under NUMBER, a tag this version does not know
 * (persisted by a newer one), or a malformed persisted row whose value is nullish. Both wire
 * shapes route here: export rows pass their own type tag, alert values pass the workspace
 * definition's type (see {@link decodeParameterWireValue}).
 */
function decodeParameterValue(
    tag: ParameterType,
    value: ParameterValue | null | undefined,
): ParameterValue | undefined {
    if (value == null) {
        return undefined;
    }
    switch (tag) {
        case "NUMBER":
            return typeof value === "number" ? value : parseNumberWireValue(value);
        case "STRING":
            return String(value);
        default:
            assertNever(tag);
            return undefined;
    }
}

/**
 * Strict whole-string numeric parse of a wire value: only a non-empty string that is entirely a
 * finite number parses (guarding the `Number("") === 0` quirk); anything else is `undefined`.
 * Runtime rows can violate the declared type (e.g. a null value in persisted metadata), so the
 * input is stringified first — the parse degrades to `undefined` instead of throwing.
 */
export function parseNumberWireValue(wireValue: string): number | undefined {
    const normalized = String(wireValue).trim();
    const parsed = normalized === "" ? Number.NaN : Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Decodes a stored alert parameter value against a workspace parameter definition. The alert wire
 * format is untyped — values arrive as raw strings — so the definition is the only source of the
 * value's type: under a NUMBER definition a numeric string parses to a number, under a STRING
 * definition the string passes through byte-for-byte. A value already carrying the definition's
 * runtime type (user-edited in the dialog) passes through unchanged. Returns `undefined` when the
 * value cannot be decoded (see {@link decodeParameterValue}).
 *
 * @internal
 */
export function decodeParameterWireValue(
    definition: IParameterDefinition,
    value: ParameterValue,
): ParameterValue | undefined {
    return decodeParameterValue(definition.type, value);
}

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
    )?.content.filters?.filter((f) => isFilterContextItem(f));

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

/**
 * Extracts the parameter overrides stored on an alert. Unlike export schedules (per-tab
 * `content.parametersByTab`), alerts keep a flat {@link IInsightParameterValue} list at
 * `alert.execution.parameters`. Mirrors {@link getAutomationAlertFilters}.
 */
export const getAutomationAlertParameters = (
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | undefined,
): IInsightParameterValue[] | undefined => {
    return automation?.alert?.execution?.parameters;
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
