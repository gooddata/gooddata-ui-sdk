// (C) 2024-2025 GoodData Corporation
import {
    ComparisonOperatorEnum,
    RelativeOperatorEnum,
    ArithmeticMeasureOperatorEnum,
    JsonApiAutomationIn,
    JsonApiAutomationPatchAttributesAlert,
} from "@gooddata/api-client-tiger";
import {
    IAutomationAlert,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    isAutomationUserRecipient,
    isAutomationExternalUserRecipient,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";
import omitBy from "lodash/omitBy.js";
import isEmpty from "lodash/isEmpty.js";
import omit from "lodash/omit.js";
import { v4 as uuidv4 } from "uuid";
import { convertMeasure } from "./afm/MeasureConverter.js";
import { convertAfmFilters } from "./afm/AfmFiltersConverter.js";
import { fixNumber } from "../../utils/fixNumber.js";
import { convertAttribute } from "./afm/AttributeConverter.js";
import { convertExportDefinitionRequestPayload } from "./ExportDefinitionsConverter.js";

export function convertAutomation(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    enableAutomationFilterContext: boolean,
): JsonApiAutomationIn {
    const {
        id,
        type,
        description,
        schedule,
        alert,
        tags,
        title,
        recipients,
        details,
        notificationChannel,
        dashboard,
        metadata,
        exportDefinitions,
    } = automation;

    const relationships = omitBy(
        {
            recipients: recipients?.length
                ? {
                      data:
                          recipients
                              ?.filter(isAutomationUserRecipient)
                              .map((r) => ({ type: "user", id: r.id })) ?? [],
                  }
                : undefined,
            notificationChannel: notificationChannel
                ? {
                      data: { type: "notificationChannel", id: notificationChannel },
                  }
                : undefined,
            analyticalDashboard: dashboard
                ? { data: { type: "analyticalDashboard", id: dashboard } }
                : undefined,
        },
        isEmpty,
    );
    const externalRecipients =
        recipients?.filter(isAutomationExternalUserRecipient).map((r) => ({ email: r.email })) ?? [];

    const hasRelationships = !isEmpty(relationships);

    const scheduleObj = schedule ? { schedule } : {};
    const alertObj = alert
        ? {
              alert: convertAlert(alert, enableAutomationFilterContext),
          }
        : {};
    const state = alert ? alert.trigger.state : undefined;
    const metadataObj = metadata
        ? {
              metadata,
          }
        : {};

    const tabularExports = exportDefinitions
        ?.filter((ed) => isExportDefinitionVisualizationObjectRequestPayload(ed.requestPayload))
        .map((ed) => ({
            requestPayload: convertExportDefinitionRequestPayload(
                ed.requestPayload,
                enableAutomationFilterContext,
                ed.title,
            ),
        }));
    const visualExports = exportDefinitions
        ?.filter((ed) => isExportDefinitionDashboardRequestPayload(ed.requestPayload))
        .map((ed) => ({
            requestPayload: convertExportDefinitionRequestPayload(
                ed.requestPayload,
                enableAutomationFilterContext,
                ed.title,
            ),
        }));

    const attributes = omitBy(
        {
            title,
            description,
            tags,
            details,
            state,
            tabularExports,
            visualExports,
            externalRecipients,
            ...metadataObj,
            ...scheduleObj,
            ...alertObj,
        },
        isEmpty,
    );

    return {
        type,
        id: id ?? uuidv4(),
        attributes,
        ...(hasRelationships
            ? {
                  relationships,
              }
            : {}),
    };
}

const convertAlert = (
    alert: IAutomationAlert,
    enableAutomationFilterContext: boolean,
): JsonApiAutomationPatchAttributesAlert => {
    const { condition, execution } = alert;

    const { filters: convertedFilters } = convertAfmFilters(
        execution.measures,
        execution.filters,
        enableAutomationFilterContext,
    );
    const base = {
        execution: {
            filters: convertedFilters,
            measures: execution.measures.map((measure) => {
                return omit(convertMeasure(measure), "alias", "format", "title");
            }),
            auxMeasures: execution.auxMeasures?.map((measure) => {
                return omit(convertMeasure(measure), "alias", "format", "title");
            }),
            attributes: execution.attributes?.map((attribute, i) => {
                return omit(convertAttribute(attribute, i), "alias");
            }),
        },
        trigger: alert.trigger.mode,
    };

    //comparison
    if (condition.type === "comparison") {
        return {
            condition: {
                comparison: {
                    operator: condition.operator as ComparisonOperatorEnum,
                    left: {
                        localIdentifier: condition.left.id,
                        title: condition.left.title,
                        format: condition.left.format,
                    },
                    right: { value: condition.right },
                },
            },
            ...base,
        };
    }

    //relative
    if (condition.type === "relative") {
        return {
            condition: {
                relative: {
                    operator: condition.operator as RelativeOperatorEnum,
                    measure: {
                        operator: condition.measure.operator as ArithmeticMeasureOperatorEnum,
                        left: {
                            localIdentifier: condition.measure.left.id,
                            title: condition.measure.left.title,
                            format: condition.measure.left.format,
                        },
                        right: {
                            localIdentifier: condition.measure.right.id,
                            title: condition.measure.right.title,
                            format: condition.measure.right.format,
                        },
                    },
                    threshold: {
                        ...(condition.measure.operator === ArithmeticMeasureOperatorEnum.CHANGE
                            ? {
                                  value: fixNumber(condition.threshold / 100),
                              }
                            : {
                                  value: condition.threshold,
                              }),
                    },
                },
            },
            ...base,
        };
    }

    throw new Error("Unsupported alert condition type.");
};
