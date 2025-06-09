// (C) 2024-2025 GoodData Corporation
import {
    ComparisonWrapper,
    RangeWrapper,
    RelativeWrapper,
    JsonApiAutomationOutAttributesStateEnum,
    JsonApiAutomationOutIncludes,
    JsonApiAutomationOutList,
    JsonApiAutomationOutWithLinks,
    JsonApiExportDefinitionOutWithLinks,
    JsonApiUserLinkage,
    JsonApiUserOutWithLinks,
    JsonApiAutomationPatchAttributesAlert,
    ArithmeticMeasureOperatorEnum,
    JsonApiAutomationPatchAttributesExternalRecipients,
} from "@gooddata/api-client-tiger";
import {
    IAlertComparisonOperator,
    IAutomationAlert,
    IAutomationMetadataObject,
    IAutomationRecipient,
    idRef,
    isAutomationUserRecipient,
} from "@gooddata/sdk-model";

import {
    convertExportDefinitionMdObject as convertExportDefinitionMdObjectFromBackend,
    convertInlineExportDefinitionMdObject,
} from "./ExportDefinitionsConverter.js";
import compact from "lodash/compact.js";
import { convertUserIdentifier } from "./UsersConverter.js";
import { convertFilter } from "./afm/FilterConverter.js";
import { convertMeasure } from "./afm/MeasureConverter.js";
import { fixNumber } from "../../utils/fixNumber.js";
import { convertAttribute } from "./AttributeConvertor.js";

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
    external: JsonApiAutomationPatchAttributesExternalRecipients,
): IAutomationRecipient {
    return {
        id: external.email,
        type: "externalUser",
        name: external.email,
        email: external.email,
    };
}

export function convertAutomation(
    automation: JsonApiAutomationOutWithLinks,
    included: JsonApiAutomationOutIncludes[],
    enableAutomationFilterContext: boolean,
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
            convertInlineExportDefinitionMdObject(ve, enableAutomationFilterContext),
        ) ?? []),
        ...(tabularExports?.map((te) =>
            convertInlineExportDefinitionMdObject(te, enableAutomationFilterContext),
        ) ?? []),
    ];

    const recipients = [
        ...(relationships?.recipients?.data
            ?.map((r) => convertRecipient(r, included))
            .filter(isAutomationUserRecipient) ?? []),
        ...(externalRecipients?.map((r) => convertExternalRecipient(r)) ?? []),
    ];

    const dashboard = relationships?.analyticalDashboard?.data?.id;

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
        createdBy: convertUserIdentifier(createdBy, included),
        updatedBy: convertUserIdentifier(modifiedBy, included),
        created: createdAt,
        updated: modifiedAt,
        dashboard,
        // Bear legacy props
        unlisted: false,
        production: true,
        deprecated: false,
    };
}

export const convertAutomationListToAutomations = (
    automationList: JsonApiAutomationOutList,
    enableAutomationFilterContext: boolean,
): IAutomationMetadataObject[] => {
    return automationList.data.map((automationObject) =>
        convertAutomation(automationObject, automationList.included ?? [], enableAutomationFilterContext),
    );
};

const convertAlert = (
    alert: JsonApiAutomationPatchAttributesAlert | undefined,
    state: JsonApiAutomationOutAttributesStateEnum | undefined,
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
