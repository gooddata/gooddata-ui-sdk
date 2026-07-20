// (C) 2024-2026 GoodData Corporation

import { compact } from "lodash-es";

import {
    type AiAlertProposal,
    type AnomalyDetectionWrapper,
    type AutomationAttributeItem,
    type AutomationAutomationAlert,
    type AutomationAutomationExternalRecipient,
    type AutomationFilterDefinition,
    type AutomationMeasureItem,
    type AutomationParameterItem,
    type ComparisonWrapper,
    type JsonApiAnalyticalDashboardOutWithLinks,
    type JsonApiAutomationOutAttributesStateEnum,
    type JsonApiAutomationOutIncludes,
    type JsonApiAutomationOutList,
    type JsonApiAutomationOutRelationships,
    type JsonApiAutomationOutWithLinks,
    type JsonApiAutomationResultOutAttributes,
    type JsonApiExportDefinitionOutWithLinks,
    type JsonApiNotificationChannelOutWithLinks,
    type JsonApiUserLinkage,
    type JsonApiUserOutWithLinks,
    type JsonApiWorkspaceAutomationOutIncludes,
    type JsonApiWorkspaceAutomationOutRelationships,
    type JsonApiWorkspaceAutomationOutWithLinks,
    type JsonApiWorkspaceOutWithLinks,
    type MeasureItem,
    type RangeWrapper,
    type RelativeWrapper,
} from "@gooddata/api-client-tiger";
import {
    type DateFilterGranularity,
    type FilterContextItem,
    type IAlertComparisonOperator,
    type IAutomationAlert,
    type IAutomationMetadataObject,
    type IAutomationRecipient,
    type IAutomationState,
    type IExportDefinitionMetadataObject,
    type IFilter,
    type IInsightParameterValue,
    filterAttributeElements,
    filterLocalIdentifier,
    filterObjRef,
    idRef,
    isAbsoluteDateFilter,
    isAllTimeDateFilter,
    isArbitraryAttributeFilter,
    isAttributeFilterWithSelection,
    isAutomationUserRecipient,
    isExportDefinitionVisualizationObjectRequestPayload,
    isFilter,
    isFilterContextItem,
    isMatchAttributeFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isObjRef,
    isRelativeBoundedDateFilter,
    isRelativeDateFilter,
    measureValueFilterConditions,
    measureValueFilterDimensionality,
    measureValueFilterMeasure,
    newAbsoluteDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { fixNumber } from "../../utils/fixNumber.js";

import { convertFilter } from "./afm/FilterConverter.js";
import { convertMeasure } from "./afm/MeasureConverter.js";
import { convertAttribute } from "./AttributeConvertor.js";
import {
    convertDashboardTabularExportRequest,
    convertExportDefinitionMdObject as convertExportDefinitionMdObjectFromBackend,
    convertImageExportRequest,
    convertSlidesExportRequest,
    convertTabularExportRequest,
    convertToRawExportRequest,
    convertVisualExportRequest,
    wrapExportDefinition,
} from "./ExportDefinitionsConverter.js";
import { type IIncludedWithUserIdentifier, convertUserIdentifier } from "./UsersConverter.js";

function convertRecipient(
    userLinkage: JsonApiUserLinkage,
    included: JsonApiAutomationOutIncludes[],
): IAutomationRecipient | undefined {
    const linkedUser = included.find(
        (i) => i.type === "user" && i.id === userLinkage.id,
    ) as JsonApiUserOutWithLinks;
    if (!linkedUser) {
        return undefined;
    }

    const userFirstName = linkedUser.attributes?.firstname;
    const userLastName = linkedUser.attributes?.lastname;
    const userName =
        userFirstName || userLastName
            ? [userFirstName, userLastName].filter(Boolean).join(" ")
            : linkedUser.attributes?.email;
    return {
        type: "user",
        id: linkedUser.id,
        name: userName,
        email: linkedUser.attributes?.email,
    };
}

function convertExternalRecipient(external: AutomationAutomationExternalRecipient): IAutomationRecipient {
    return {
        id: external.email,
        type: "externalUser",
        name: external.email,
        email: external.email,
    };
}

const convertDashboard = (
    relationships?: JsonApiAutomationOutRelationships,
    included?: JsonApiAutomationOutIncludes[],
) => {
    const id = relationships?.analyticalDashboard?.data?.id;
    const title = (
        included?.find(
            (i) => i.type === "analyticalDashboard" && i.id === id,
        ) as JsonApiAnalyticalDashboardOutWithLinks
    )?.attributes?.title;

    return {
        id: id,
        title,
    };
};

const convertWorkspace = (
    relationships: JsonApiWorkspaceAutomationOutRelationships,
    included?: JsonApiWorkspaceAutomationOutIncludes[],
) => {
    // Check if organization level relationships - includes workspace
    if (relationships && "workspace" in relationships) {
        const workspaceRelationship = relationships.workspace;
        const id = workspaceRelationship?.data?.id;
        const title = (
            included?.find((i) => i.type === "workspace" && i.id === id) as JsonApiWorkspaceOutWithLinks
        )?.attributes?.name;

        return {
            id: id,
            title: title ?? undefined,
        };
    }

    return undefined;
};

const convertNotificationChannel = (
    relationships?: JsonApiAutomationOutRelationships,
    included?: JsonApiAutomationOutIncludes[],
) => {
    const id = relationships?.notificationChannel?.data?.id;
    const title = (
        included?.find(
            (i) => i.type === "notificationChannel" && i.id === id,
        ) as JsonApiNotificationChannelOutWithLinks
    )?.attributes?.name;

    return title ?? undefined;
};

const convertAutomationResult = (
    relationships?: JsonApiAutomationOutRelationships,
    included?: JsonApiAutomationOutIncludes[],
) => {
    const automationResultData = relationships?.automationResults?.data;
    if (!automationResultData || automationResultData.length === 0) {
        return undefined;
    }

    const results = automationResultData.map((resultRef) =>
        included?.find((i) => i.type === "automationResult" && i.id === resultRef.id),
    );

    //Find latest result
    const latestResult =
        results.reduce(
            (latest, current) => {
                const currentExecutedAt = (current?.attributes as JsonApiAutomationResultOutAttributes)
                    ?.executedAt;
                if (!currentExecutedAt) return latest;

                const latestExecutedAt = (latest?.attributes as JsonApiAutomationResultOutAttributes)
                    ?.executedAt;
                if (!latestExecutedAt) return current;

                return new Date(currentExecutedAt) > new Date(latestExecutedAt) ? current : latest;
            },
            undefined as JsonApiAutomationOutIncludes | undefined,
        ) ?? results[results.length - 1];

    return latestResult?.attributes as JsonApiAutomationResultOutAttributes;
};

export function convertAutomation(
    automation: JsonApiAutomationOutWithLinks | JsonApiWorkspaceAutomationOutWithLinks,
    included: JsonApiAutomationOutIncludes[],
): IAutomationMetadataObject {
    const { id, attributes = {}, relationships = {} } = automation;
    const {
        title,
        description,
        tags,
        schedule,
        alert,
        details,
        createdAt,
        modifiedAt,
        metadata,
        state,
        visualExports,
        tabularExports,
        imageExports,
        slidesExports,
        rawExports,
        dashboardTabularExports,
        externalRecipients,
        evaluationMode,
    } = attributes;
    const { createdBy, modifiedBy } = relationships;

    const notificationChannel = relationships?.notificationChannel?.data?.id;
    const exportDefinitionsIds = relationships?.exportDefinitions?.data?.map((ed) => ed.id) ?? [];
    const includedExportDefinitions = compact(
        exportDefinitionsIds.map((exportDefinitionId) =>
            included.find((i) => i.type === "exportDefinition" && i.id === exportDefinitionId),
        ),
    );

    const exportDefinitions = [
        ...includedExportDefinitions.map((ed) =>
            convertExportDefinitionMdObjectFromBackend(ed as JsonApiExportDefinitionOutWithLinks, undefined),
        ),
        ...(visualExports?.map((ve) =>
            wrapExportDefinition(convertVisualExportRequest(ve), ve.requestPayload.metadata),
        ) ?? []),
        ...(tabularExports?.map((te) =>
            wrapExportDefinition(convertTabularExportRequest(te), te.requestPayload.metadata ?? undefined),
        ) ?? []),
        ...(imageExports?.map((ie) =>
            wrapExportDefinition(convertImageExportRequest(ie), ie.requestPayload.metadata ?? undefined),
        ) ?? []),
        ...(slidesExports?.map((se) =>
            wrapExportDefinition(convertSlidesExportRequest(se), se.requestPayload.metadata ?? undefined),
        ) ?? []),
        ...(dashboardTabularExports?.map((dte) =>
            wrapExportDefinition(convertDashboardTabularExportRequest(dte)),
        ) ?? []),
        ...(rawExports?.map((re) =>
            wrapExportDefinition(convertToRawExportRequest(re), re.requestPayload.metadata ?? undefined),
        ) ?? []),
    ];

    const normalizedExportDefinitions = exportDefinitions.map(convertLegacyTabularFiltersToFilterContext);

    const recipients = [
        ...(relationships?.recipients?.data
            ?.map((r) => convertRecipient(r, included))
            .filter(isAutomationUserRecipient) ?? []),
        ...(externalRecipients?.map((r) => convertExternalRecipient(r)) ?? []),
    ];

    const workspace = convertWorkspace(relationships, included);

    const dashboard = convertDashboard(relationships, included);

    const notificationChannelTitle = convertNotificationChannel(relationships, included);

    const automationResult = convertAutomationResult(relationships, included);

    const convertedAlert = convertAlert(alert, state);

    const alertObj = convertedAlert
        ? {
              alert: convertedAlert,
          }
        : {};
    const scheduleObj = schedule ? { schedule } : {};
    const evaluationModeObj = evaluationMode ? { evaluationMode } : {};
    const metadataObj = metadata
        ? {
              metadata,
          }
        : {};

    return {
        // Core
        ...scheduleObj,
        ...evaluationModeObj,
        ...alertObj,
        ...metadataObj,
        // Common metadata object properties
        type: "automation",
        id,
        ref: idRef(id, "automation"),
        uri: id,
        title: title ?? "",
        description: description ?? "",
        tags,
        // Details
        details,
        // Relationships
        exportDefinitions: normalizedExportDefinitions,
        recipients,
        notificationChannel,
        notificationChannelTitle,
        createdBy: convertUserIdentifier(createdBy, included as IIncludedWithUserIdentifier[]),
        updatedBy: convertUserIdentifier(modifiedBy, included as IIncludedWithUserIdentifier[]),
        lastRun: automationResult,
        created: createdAt ?? undefined,
        updated: modifiedAt ?? undefined,
        state: state as IAutomationState,
        dashboard,
        workspace,
        // Bear legacy props
        unlisted: false,
        production: true,
        deprecated: false,
    };
}

export const convertAutomationListToAutomations = (
    automationList: JsonApiAutomationOutList,
): IAutomationMetadataObject[] => {
    return automationList.data.map((automationObject) =>
        convertAutomation(automationObject, automationList.included ?? []),
    );
};

/**
 * The wire value is an untyped string with no type tag. A value that parses to a finite number
 * decodes as a number (legacy NUMBER rows, incl. `Number("") === 0`); everything else passes
 * through as-is, so a STRING value that happens to look numeric decodes as a number too.
 */
function convertParameterItems(items: AutomationParameterItem[]): IInsightParameterValue[] {
    return items.map((item) => {
        const value = Number(item.value);
        return {
            ref: idRef(item.parameter.identifier.id, "parameter"),
            value: Number.isFinite(value) ? value : item.value,
        };
    });
}

export const convertAlert = (
    alert: AutomationAutomationAlert | AiAlertProposal["alert"] | undefined,
    state?: JsonApiAutomationOutAttributesStateEnum,
): IAutomationAlert | undefined => {
    if (!alert) {
        return undefined;
    }

    const { condition, execution } = alert;
    const parameters = convertParameterItems(execution.parameters ?? []);
    const comparison = (condition as ComparisonWrapper)?.comparison;
    const range = (condition as RangeWrapper)?.range;
    const relative = (condition as RelativeWrapper)?.relative;
    const anomaly = (condition as AnomalyDetectionWrapper)?.anomaly;

    // TODO: we do not support RANGE for now
    if (range) {
        return undefined;
    }

    const base = {
        execution: {
            attributes:
                execution.attributes?.map((a) => convertAttribute(a as AutomationAttributeItem)) ?? [],
            measures: execution.measures?.map((m) => convertMeasure(m as AutomationMeasureItem)) ?? [],
            auxMeasures: execution.auxMeasures?.map((m: MeasureItem) => convertMeasure(m)) ?? [],
            filters: execution.filters?.map((f) => convertFilter(f as AutomationFilterDefinition)) ?? [],
            ...(parameters.length ? { parameters } : {}),
        },
        trigger: {
            state: state ?? "ACTIVE",
            mode: alert.trigger,
            interval: alert.interval || undefined,
        },
    };

    if (comparison) {
        return {
            condition: {
                type: "comparison",
                operator: comparison.operator as IAlertComparisonOperator,
                left: {
                    id: comparison.left.localIdentifier,
                    title: comparison.left.title ?? undefined,
                    format: comparison.left.format ?? undefined,
                },
                right: (comparison.right as any)?.value,
            },
            ...base,
        };
    }

    if (relative) {
        return {
            condition: {
                type: "relative",
                operator: relative.operator,
                measure: {
                    operator: relative.measure.operator,
                    left: {
                        id: relative.measure.left.localIdentifier,
                        title: relative.measure.left.title ?? undefined,
                        format: relative.measure.left.format ?? undefined,
                    },
                    right: {
                        id: relative.measure.right.localIdentifier,
                        title: relative.measure.right.title ?? undefined,
                        format: relative.measure.right.format ?? undefined,
                    },
                },
                ...(relative.measure.operator === "CHANGE"
                    ? {
                          threshold: fixNumber(relative.threshold.value * 100),
                      }
                    : {
                          threshold: relative.threshold.value,
                      }),
            },
            ...base,
        };
    }

    if (anomaly) {
        return {
            condition: {
                type: "anomalyDetection",
                sensitivity: anomaly.sensitivity ?? "MEDIUM",
                granularity: anomaly.granularity,
                measure: {
                    id: anomaly.measure.localIdentifier,
                    title: anomaly.measure.title ?? undefined,
                    format: anomaly.measure.format ?? undefined,
                },
                dataset: idRef(anomaly.dataset.identifier.id, "dataSet"),
            },
            ...base,
        };
    }

    return undefined;
};

function convertLegacyTabularFiltersToFilterContext(
    exportDefinition: IExportDefinitionMetadataObject,
): IExportDefinitionMetadataObject {
    if (
        !isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload) ||
        exportDefinition.requestPayload.format !== "XLSX"
    ) {
        return exportDefinition;
    }

    const filters = exportDefinition.requestPayload.content.filters;

    if (!filters?.length || filters.some(isFilterContextItem)) {
        return exportDefinition;
    }

    const convertedFilters = filters
        .map((filter, index) =>
            isFilter(filter)
                ? convertExecutionFilterToFilterContextItem(filter, `legacy-mvf-${index}`)
                : undefined,
        )
        .filter((filter): filter is FilterContextItem => Boolean(filter));

    if (!convertedFilters.length) {
        return exportDefinition;
    }

    return {
        ...exportDefinition,
        requestPayload: {
            ...exportDefinition.requestPayload,
            content: {
                ...exportDefinition.requestPayload.content,
                filters: convertedFilters,
            },
        },
    };
}

/**
 * Converts a legacy execution-level filter to a dashboard `FilterContextItem`. Used during
 * lazy migration of XLSX export definitions that historically stored `IFilter[]` instead of
 * `FilterContextItem[]`. Pure: no random ids — the caller passes a deterministic
 * `fallbackLocalIdentifier` for MVFs that lack one.
 *
 * @internal
 */
export function convertExecutionFilterToFilterContextItem(
    filter: IFilter,
    fallbackLocalIdentifier: string,
): FilterContextItem | undefined {
    if (isAttributeFilterWithSelection(filter)) {
        return {
            attributeFilter: {
                negativeSelection: isNegativeAttributeFilter(filter),
                attributeElements: filterAttributeElements(filter),
                displayForm: filterObjRef(filter),
                selectionMode: "multi",
                localIdentifier: filterLocalIdentifier(filter),
            },
        };
    }

    if (isArbitraryAttributeFilter(filter)) {
        return {
            arbitraryAttributeFilter: {
                displayForm: filterObjRef(filter),
                values: filter.arbitraryAttributeFilter.values,
                negativeSelection: filter.arbitraryAttributeFilter.negativeSelection ?? false,
                localIdentifier: filterLocalIdentifier(filter),
            },
        };
    }

    if (isMatchAttributeFilter(filter)) {
        return {
            matchAttributeFilter: {
                displayForm: filterObjRef(filter),
                operator: filter.matchAttributeFilter.operator,
                literal: filter.matchAttributeFilter.literal,
                caseSensitive: filter.matchAttributeFilter.caseSensitive,
                negativeSelection: filter.matchAttributeFilter.negativeSelection,
                localIdentifier: filterLocalIdentifier(filter),
            },
        };
    }

    if (isAbsoluteDateFilter(filter)) {
        return newAbsoluteDashboardDateFilter(
            filter.absoluteDateFilter.from,
            filter.absoluteDateFilter.to,
            filter.absoluteDateFilter.dataSet,
            filter.absoluteDateFilter.localIdentifier,
            filter.absoluteDateFilter.emptyValueHandling,
        );
    }

    if (isAllTimeDateFilter(filter)) {
        return newAllTimeDashboardDateFilter(
            filter.relativeDateFilter.dataSet,
            filter.relativeDateFilter.localIdentifier,
            filter.relativeDateFilter.emptyValueHandling,
        );
    }

    if (isRelativeDateFilter(filter)) {
        return newRelativeDashboardDateFilter(
            filter.relativeDateFilter.granularity as DateFilterGranularity,
            filter.relativeDateFilter.from,
            filter.relativeDateFilter.to,
            filter.relativeDateFilter.dataSet,
            filter.relativeDateFilter.localIdentifier,
            isRelativeBoundedDateFilter(filter) ? filter.relativeDateFilter.boundedFilter : undefined,
            filter.relativeDateFilter.emptyValueHandling,
        );
    }

    if (isMeasureValueFilter(filter)) {
        const measure = measureValueFilterMeasure(filter);
        // Dashboard MVF requires an ObjRef catalog metric. LocalIdRef-keyed MVFs only exist on
        // execution filters coming from insights and must not appear here — log and drop.
        if (!isObjRef(measure)) {
            console.warn(
                "MeasureValueFilter with LocalIdRef cannot be converted to a dashboard MVF — dropped",
                filter,
            );
            return undefined;
        }
        const body = filter.measureValueFilter;
        const conditions = measureValueFilterConditions(filter);
        const dimensionality = measureValueFilterDimensionality(filter)?.filter(isObjRef);
        // The SDK execution-side body does not declare `title`, but inputs may carry one at runtime
        // (e.g. exports coming from a richer source). Propagate it if present.
        const title = "title" in body ? (body as { title?: string }).title : undefined;
        return {
            dashboardMeasureValueFilter: {
                measure,
                localIdentifier: body.localIdentifier ?? fallbackLocalIdentifier,
                ...(conditions ? { conditions } : {}),
                ...(dimensionality && dimensionality.length > 0 ? { dimensionality } : {}),
                ...(title ? { title } : {}),
            },
        };
    }

    return undefined;
}
