// (C) 2024-2025 GoodData Corporation

import { isEmpty, omit, omitBy } from "lodash-es";
import { v4 as uuidv4 } from "uuid";

import {
    type ArithmeticMeasureOperatorEnum,
    type ComparisonOperatorEnum,
    type JsonApiAutomationIn,
    type JsonApiAutomationPatchAttributes,
    type JsonApiAutomationPatchAttributesAlert,
    type RelativeOperatorEnum,
} from "@gooddata/api-client-tiger";
import { type IRawExportCustomOverrides } from "@gooddata/sdk-backend-spi";
import {
    type IAutomationAlert,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IExecutionDefinition,
    isAutomationExternalUserRecipient,
    isAutomationUserRecipient,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import { convertAfmFilters } from "./afm/AfmFiltersConverter.js";
import { convertAttribute } from "./afm/AttributeConverter.js";
import { convertMeasure } from "./afm/MeasureConverter.js";
import {
    convertExportDefinitionRequestPayload,
    convertToDashboardTabularExportRequest,
    convertToImageExportRequest,
    convertToRawExportRequest,
    convertToSlidesExportRequest,
    convertToTabularExportRequest,
    convertToVisualExportRequest,
    convertVisualizationToDashboardTabularExportRequest,
} from "./ExportDefinitionsConverter.js";
import { toDateDataSetQualifier } from "./ObjRefConverter.js";
import { fixNumber } from "../../utils/fixNumber.js";

export function convertAutomation(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    enableAutomationFilterContext: boolean,
    enableNewScheduledExport: boolean,
    widgetExecution?: IExecutionDefinition,
    overrides?: IRawExportCustomOverrides,
): JsonApiAutomationIn {
    const {
        id,
        type,
        description,
        schedule,
        evaluationMode,
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
                ? { data: { type: "analyticalDashboard", id: dashboard?.id } }
                : undefined,
        },
        isEmpty,
    );
    const externalRecipients =
        recipients?.filter(isAutomationExternalUserRecipient).map((r) => ({ email: r.email })) ?? [];

    const hasRelationships = !isEmpty(relationships);

    const scheduleObj = schedule ? { schedule } : {};
    const evaluationModeObj = evaluationMode ? { evaluationMode } : {};
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

    const tabularExportsOld = exportDefinitions
        ?.filter((ed) => isExportDefinitionVisualizationObjectRequestPayload(ed.requestPayload))
        .map((ed) => ({
            requestPayload: convertExportDefinitionRequestPayload(
                ed.requestPayload,
                enableAutomationFilterContext,
                ed.title,
            ),
        }));
    const visualExportsOld = exportDefinitions
        ?.filter((ed) => isExportDefinitionDashboardRequestPayload(ed.requestPayload))
        .map((ed) => ({
            requestPayload: convertExportDefinitionRequestPayload(
                ed.requestPayload,
                enableAutomationFilterContext,
                ed.title,
            ),
        }));

    const {
        tabularExports,
        visualExports,
        imageExports,
        slidesExports,
        dashboardTabularExports,
        rawExports,
    } = (exportDefinitions ?? []).reduce((acc, ed) => {
        switch (ed.requestPayload.format) {
            case "CSV":
                return {
                    ...acc,
                    tabularExports: [
                        ...(acc.tabularExports ?? []),
                        {
                            requestPayload: convertToTabularExportRequest(ed.requestPayload, ed.title),
                        },
                    ],
                };
            case "XLSX": {
                const requestPayload = isExportDefinitionDashboardRequestPayload(ed.requestPayload)
                    ? convertToDashboardTabularExportRequest(ed.requestPayload)
                    : convertVisualizationToDashboardTabularExportRequest(ed.requestPayload);

                return {
                    ...acc,
                    dashboardTabularExports: [
                        ...(acc.dashboardTabularExports ?? []),
                        {
                            requestPayload,
                        },
                    ],
                };
            }
            case "PDF_TABULAR": {
                const requestPayload = convertVisualizationToDashboardTabularExportRequest(ed.requestPayload);

                return {
                    ...acc,
                    dashboardTabularExports: [
                        ...(acc.dashboardTabularExports ?? []),
                        {
                            requestPayload,
                        },
                    ],
                };
            }
            case "PDF":
                return {
                    ...acc,
                    visualExports: [
                        ...(acc.visualExports ?? []),
                        ...(isExportDefinitionDashboardRequestPayload(ed.requestPayload)
                            ? [
                                  {
                                      requestPayload: convertToVisualExportRequest(
                                          ed.requestPayload,
                                          ed.title,
                                      ),
                                  },
                              ]
                            : []),
                    ],
                    slidesExports: [
                        ...(acc.slidesExports ?? []),
                        ...(isExportDefinitionVisualizationObjectRequestPayload(ed.requestPayload)
                            ? [
                                  {
                                      requestPayload: convertToSlidesExportRequest(
                                          ed.requestPayload,
                                          ed.title,
                                      ),
                                  },
                              ]
                            : []),
                    ],
                };
            case "PNG":
                return {
                    ...acc,
                    imageExports: [
                        ...(acc.imageExports ?? []),
                        ...(isExportDefinitionVisualizationObjectRequestPayload(ed.requestPayload)
                            ? [
                                  {
                                      requestPayload: convertToImageExportRequest(
                                          ed.requestPayload,
                                          ed.title,
                                      ),
                                  },
                              ]
                            : []),
                    ],
                };
            case "PPTX":
            case "PDF_SLIDES":
                return {
                    ...acc,
                    slidesExports: [
                        ...(acc.slidesExports ?? []),
                        {
                            requestPayload: convertToSlidesExportRequest(ed.requestPayload, ed.title),
                        },
                    ],
                };
            case "CSV_RAW":
                return {
                    ...acc,
                    rawExports: [
                        ...(acc.rawExports ?? []),
                        {
                            requestPayload: convertToRawExportRequest(
                                ed.requestPayload,
                                widgetExecution,
                                overrides,
                            ),
                        },
                    ],
                };
            default:
                return acc;
        }
    }, {} as JsonApiAutomationPatchAttributes);

    const attributes = omitBy(
        {
            title,
            description,
            tags,
            details,
            state,
            tabularExports: enableNewScheduledExport ? tabularExports : tabularExportsOld,
            visualExports: enableNewScheduledExport ? visualExports : visualExportsOld,
            imageExports,
            slidesExports,
            dashboardTabularExports: enableNewScheduledExport ? dashboardTabularExports : undefined,
            rawExports,
            externalRecipients,
            ...metadataObj,
            ...scheduleObj,
            ...evaluationModeObj,
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
                        ...(condition.measure.operator === "CHANGE"
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

    //anomaly detection
    if (condition.type === "anomalyDetection") {
        return {
            condition: {
                anomaly: {
                    measure: {
                        localIdentifier: condition.measure.id,
                        title: condition.measure.title,
                        format: condition.measure.format,
                    },
                    sensitivity: condition.sensitivity,
                    granularity: condition.granularity,
                    dataset: toDateDataSetQualifier(condition.dataset),
                },
            },
            ...base,
        };
    }

    throw new Error("Unsupported alert condition type.");
};
