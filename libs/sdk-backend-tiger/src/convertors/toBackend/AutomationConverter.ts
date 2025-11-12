// (C) 2024-2025 GoodData Corporation

import { isEmpty, omit, omitBy } from "lodash-es";
import { v4 as uuidv4 } from "uuid";

import {
    ArithmeticMeasureOperatorEnum,
    ComparisonOperatorEnum,
    JsonApiAutomationIn,
    JsonApiAutomationOutAttributes,
    JsonApiAutomationOutAttributesAlert,
    RelativeOperatorEnum,
} from "@gooddata/api-client-tiger";
import {
    IAutomationAlert,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
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
    convertToSlidesExportRequest,
    convertToTabularExportRequest,
    convertToVisualExportRequest,
} from "./ExportDefinitionsConverter.js";
import { fixNumber } from "../../utils/fixNumber.js";

export function convertAutomation(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    enableAutomationFilterContext: boolean,
    enableNewScheduledExport: boolean,
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
        // rawExports,
    } = (exportDefinitions ?? []).reduce((acc, ed) => {
        switch (ed.requestPayload.format) {
            case "CSV":
            case "XLSX":
                return {
                    ...acc,
                    ...(isExportDefinitionDashboardRequestPayload(ed.requestPayload)
                        ? {
                              dashboardTabularExports: [
                                  ...(acc.dashboardTabularExports ?? []),
                                  {
                                      requestPayload: convertToDashboardTabularExportRequest(
                                          ed.requestPayload,
                                      ),
                                  },
                              ],
                          }
                        : {
                              tabularExports: [
                                  ...(acc.tabularExports ?? []),
                                  {
                                      requestPayload: convertToTabularExportRequest(
                                          ed.requestPayload,
                                          ed.title,
                                      ),
                                  },
                              ],
                          }),
                };
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
            // case "CSV_RAW":
            //     return {
            //         ...acc,
            //         rawExports: [
            //             ...(acc.rawExports ?? []),
            //             {
            //                 requestPayload: convertToRawExportRequest(
            //                     ed.requestPayload,
            //                     enableAutomationFilterContext,
            //                     ed.title,
            //                 ),
            //             },
            //         ],
            //     };
            default:
                return acc;
        }
    }, {} as JsonApiAutomationOutAttributes);

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
            dashboardTabularExports,
            // rawExports,
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
): JsonApiAutomationOutAttributesAlert => {
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
