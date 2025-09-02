// (C) 2024-2025 GoodData Corporation
import compact from "lodash/compact.js";

import {
    ArithmeticMeasureOperatorEnum,
    ComparisonWrapper,
    JsonApiAnalyticalDashboardOutWithLinks,
    JsonApiAutomationOutAttributesAlert,
    JsonApiAutomationOutAttributesExternalRecipients,
    JsonApiAutomationOutIncludes,
    JsonApiAutomationOutList,
    JsonApiAutomationOutRelationships,
    JsonApiAutomationOutWithLinks,
    JsonApiAutomationResultOutAttributes,
    JsonApiExportDefinitionOutWithLinks,
    JsonApiUserLinkage,
    JsonApiUserOutWithLinks,
    JsonApiWorkspaceAutomationOutAttributesStateEnum,
    JsonApiWorkspaceAutomationOutWithLinks,
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
    convertVisualExportRequest,
    wrapExportDefinition,
} from "./ExportDefinitionsConverter.js";
import { IIncludedWithUserIdentifier, convertUserIdentifier } from "./UsersConverter.js";
import { fixNumber } from "../../utils/fixNumber.js";

/**
 * Type guard to check if automation is an organization level automation by presence of workspaceId
 */
function isOrganizationLevelAutomation(
    automation: JsonApiWorkspaceAutomationOutWithLinks | JsonApiAutomationOutWithLinks,
): automation is JsonApiWorkspaceAutomationOutWithLinks {
    return (automation as JsonApiWorkspaceAutomationOutWithLinks).attributes?.workspaceId !== undefined;
}

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
    const userName = userFirstName && userLastName ? `${userFirstName} ${userLastName}` : undefined;
    return {
        type: "user",
        id: linkedUser.id,
        name: userName,
        email: linkedUser.attributes?.email,
    };
}

function convertExternalRecipient(
    external: JsonApiAutomationOutAttributesExternalRecipients,
): IAutomationRecipient {
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
        title: title,
    };
};

const convertWorkspace = (
    automation: JsonApiAutomationOutWithLinks | JsonApiWorkspaceAutomationOutWithLinks,
) => {
    if (!isOrganizationLevelAutomation(automation) || !automation.attributes?.workspaceId) {
        return undefined;
    }
    const id = automation.attributes.workspaceId;
    const title = automation.attributes.workspaceId;

    return {
        id: id,
        title: title,
    };
};

const convertAutomationResult = (
    relationships?: JsonApiAutomationOutRelationships,
    included?: JsonApiAutomationOutIncludes[],
) => {
    const automationResultData = relationships?.automationResults?.data;
    if (!automationResultData || automationResultData.length === 0) {
        return undefined;
    }

    // Take the last item from the data array
    const lastAutomationResult = automationResultData[automationResultData.length - 1];
    const automationResult = included?.find(
        (i) => i.type === "automationResult" && i.id === lastAutomationResult?.id,
    );

    return automationResult?.attributes as JsonApiAutomationResultOutAttributes;
};

export function convertAutomation(
    automation: JsonApiAutomationOutWithLinks | JsonApiWorkspaceAutomationOutWithLinks,
    included: JsonApiAutomationOutIncludes[],
    enableAutomationFilterContext: boolean,
    enableNewScheduleExport: boolean,
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
        dashboardTabularExports,
        externalRecipients,
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
            enableNewScheduleExport
                ? wrapExportDefinition(
                      convertVisualExportRequest(ve, enableAutomationFilterContext),
                      ve.requestPayload.metadata,
                  )
                : convertInlineExportDefinitionMdObject(ve, enableAutomationFilterContext),
        ) ?? []),
        ...(tabularExports?.map((te) =>
            enableNewScheduleExport
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
        // ...(rawExports?.map((re) =>
        //     convertInlineExportDefinitionMdObject(re, enableAutomationFilterContext),
        // ) ?? []),
    ];

    const recipients = [
        ...(relationships?.recipients?.data
            ?.map((r) => convertRecipient(r, included))
            .filter(isAutomationUserRecipient) ?? []),
        ...(externalRecipients?.map((r) => convertExternalRecipient(r)) ?? []),
    ];

    const workspace = convertWorkspace(automation);

    const dashboard = convertDashboard(relationships, included);

    const automationResult = convertAutomationResult(relationships, included);

    const convertedAlert = convertAlert(alert, state);

    const alertObj = convertedAlert
        ? {
              alert: convertedAlert,
          }
        : {};
    const scheduleObj = schedule ? { schedule } : {};
    const metadataObj = metadata
        ? {
              metadata,
          }
        : {};

    return {
        // Core
        ...scheduleObj,
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
        // Bear legacy props
        unlisted: false,
        production: true,
        deprecated: false,
        workspace: workspace,
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
    alert: JsonApiAutomationOutAttributesAlert | undefined,
    state: JsonApiWorkspaceAutomationOutAttributesStateEnum | undefined,
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
                ...(relative.measure.operator === ArithmeticMeasureOperatorEnum.CHANGE
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
