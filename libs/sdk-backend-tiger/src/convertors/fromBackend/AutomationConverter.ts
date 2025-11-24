// (C) 2024-2025 GoodData Corporation

import { compact } from "lodash-es";

import {
    AutomationAutomationAlert,
    AutomationAutomationExternalRecipient,
    ComparisonWrapper,
    JsonApiAnalyticalDashboardOutWithLinks,
    JsonApiAutomationInAttributesStateEnum,
    JsonApiAutomationOutIncludes,
    JsonApiAutomationOutList,
    JsonApiAutomationOutRelationships,
    JsonApiAutomationOutWithLinks,
    JsonApiAutomationResultOutAttributes,
    JsonApiExportDefinitionOutWithLinks,
    JsonApiUserLinkage,
    JsonApiUserOutWithLinks,
    JsonApiWorkspaceAutomationOutIncludes,
    JsonApiWorkspaceAutomationOutRelationships,
    JsonApiWorkspaceAutomationOutWithLinks,
    JsonApiWorkspaceOutWithLinks,
    RangeWrapper,
    RelativeWrapper,
} from "@gooddata/api-client-tiger";
import {
    IAlertComparisonOperator,
    IAutomationAlert,
    IAutomationMetadataObject,
    IAutomationRecipient,
    IAutomationState,
    idRef,
    isAutomationUserRecipient,
} from "@gooddata/sdk-model";

import { convertFilter } from "./afm/FilterConverter.js";
import { convertMeasure } from "./afm/MeasureConverter.js";
import { convertAttribute } from "./AttributeConvertor.js";
import {
    convertDashboardTabularExportRequest,
    convertExportDefinitionMdObject as convertExportDefinitionMdObjectFromBackend,
    convertImageExportRequest,
    convertInlineExportDefinitionMdObject,
    convertSlidesExportRequest,
    convertTabularExportRequest,
    convertToRawExportRequest,
    convertVisualExportRequest,
    wrapExportDefinition,
} from "./ExportDefinitionsConverter.js";
import { IIncludedWithUserIdentifier, convertUserIdentifier } from "./UsersConverter.js";
import { fixNumber } from "../../utils/fixNumber.js";

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
    enableAutomationFilterContext: boolean,
    enableNewScheduledExport: boolean,
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
            convertExportDefinitionMdObjectFromBackend(
                ed as JsonApiExportDefinitionOutWithLinks,
                undefined,
                enableAutomationFilterContext,
            ),
        ),
        ...(visualExports?.map((ve) =>
            enableNewScheduledExport
                ? wrapExportDefinition(
                      convertVisualExportRequest(ve, enableAutomationFilterContext),
                      ve.requestPayload.metadata,
                  )
                : convertInlineExportDefinitionMdObject(ve, enableAutomationFilterContext),
        ) ?? []),
        ...(tabularExports?.map((te) =>
            enableNewScheduledExport
                ? wrapExportDefinition(
                      convertTabularExportRequest(te),
                      te.requestPayload.metadata ?? undefined,
                  )
                : convertInlineExportDefinitionMdObject(te, enableAutomationFilterContext),
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

    const recipients = [
        ...(relationships?.recipients?.data
            ?.map((r) => convertRecipient(r, included))
            .filter(isAutomationUserRecipient) ?? []),
        ...(externalRecipients?.map((r) => convertExternalRecipient(r)) ?? []),
    ];

    const workspace = convertWorkspace(relationships, included);

    const dashboard = convertDashboard(relationships, included);

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
        exportDefinitions,
        recipients,
        notificationChannel,
        createdBy: convertUserIdentifier(createdBy, included as IIncludedWithUserIdentifier[]),
        updatedBy: convertUserIdentifier(modifiedBy, included as IIncludedWithUserIdentifier[]),
        lastRun: automationResult,
        created: createdAt,
        updated: modifiedAt,
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
    enableAutomationFilterContext: boolean,
    enableNewScheduledExport: boolean,
): IAutomationMetadataObject[] => {
    return automationList.data.map((automationObject) =>
        convertAutomation(
            automationObject,
            automationList.included ?? [],
            enableAutomationFilterContext,
            enableNewScheduledExport,
        ),
    );
};

const convertAlert = (
    alert: AutomationAutomationAlert | undefined,
    state?: JsonApiAutomationInAttributesStateEnum,
): IAutomationAlert | undefined => {
    if (!alert) {
        return undefined;
    }

    const { condition, execution } = alert;
    const comparison = (condition as ComparisonWrapper)?.comparison;
    const range = (condition as RangeWrapper)?.range;
    const relative = (condition as RelativeWrapper)?.relative;

    // TODO: we do not support RANGE for now
    if (range) {
        return undefined;
    }

    const base = {
        execution: {
            attributes: execution.attributes?.map(convertAttribute) ?? [],
            measures: execution.measures.map(convertMeasure),
            auxMeasures: execution.auxMeasures?.map(convertMeasure) ?? [],
            filters: execution.filters.map(convertFilter),
        },
        trigger: {
            state: state ?? "ACTIVE",
            mode: alert.trigger,
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

    return undefined;
};
